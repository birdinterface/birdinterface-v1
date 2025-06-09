import { promises as fs } from 'fs';
import path from 'path';

import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, Message, streamText, CoreMessage, generateId, tool } from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { getRelevantKnowledge } from '@/lib/knowledge';
import { shouldUseSearch } from '@/lib/live-search';
import { Model, models } from '@/lib/model';
import { deleteChatById, getChatById, saveChat, updateUser, getUser, updateUserUsage, getUserTasks, createRecurringTask, getUserRecurringTasks } from '@/lib/queries';
import { executeTaskAction, TaskAction } from '@/lib/task-actions';
import { getUserTaskContext, formatTaskContextForAI } from '@/lib/task-context';
import { calculateCost, hasExceededLimit, getNextResetDate } from '@/lib/usage';

import type { Task } from '@/lib/supabase';

// Cache for avoiding redundant task fetches within the same request
let requestTaskCache: { userId: string; tasks: Task[]; timestamp: number } | null = null;

// Helper function to get tasks with caching
async function getCachedUserTasks(userId: string): Promise<Task[]> {
  const now = Date.now();
  // Use cache if it's for the same user and less than 30 seconds old
  if (requestTaskCache && requestTaskCache.userId === userId && (now - requestTaskCache.timestamp) < 30000) {
    return requestTaskCache.tasks;
  }
  
  // Fetch fresh data
  const tasks = await getUserTasks(userId);
  requestTaskCache = { userId, tasks, timestamp: now };
  return tasks;
}

// Create xAI provider instance
const xai = createOpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.XAI_API_KEY ?? '',
});

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// User-specific knowledge content cache
const userKnowledgeCache = new Map<string, string>();

// Function to get summarized/processed knowledge content for a specific user
async function getProcessedKnowledgeContent(userId: string) {
  if (userKnowledgeCache.has(userId)) {
    return userKnowledgeCache.get(userId)!;
  }
  
  const knowledgeBasePath = path.join(process.cwd(), 'data', 'knowledgeAdvancers');
  try {
    const content = await fs.readFile(knowledgeBasePath, 'utf8');
    // Here you could add processing to reduce token usage, for example:
    // - Summarize key points
    // - Extract relevant sections
    // - Remove redundant information
    userKnowledgeCache.set(userId, content);
    return content;
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
    return '';
  }
}

function getContextFromKnowledge(userMessage: string, knowledgeContent: string) {
  const paragraphs = knowledgeContent.split('\n\n');
  const relevantParagraphs = paragraphs.filter(p =>
    userMessage.toLowerCase().split(' ').some(word =>
      p.toLowerCase().includes(word)
    )
  );

  // Return all relevant paragraphs joined together
  return relevantParagraphs.join('\n\n');
}

function estimateTokens(text: string): number {
  // GPT models typically use ~4 characters per token on average
  // But this can vary based on the content. Here's a more conservative estimate:
  return Math.ceil(text.length / 3);
}

interface ImageUrlContent {
  type: 'image_url';
  image_url: { url: string };
}

interface TextContent {
  type: 'text';
  text: string;
}

type MessageContent = string | (TextContent | ImageUrlContent)[];

interface Attachment {
  contentType?: string;
  url: string;
  name?: string;
}

interface ExtendedMessage extends Message {
  experimental_attachments?: Attachment[];
}

// Define task management tools
const taskTools = {
  createTask: tool({
    description: 'Create a new task with title, description, due date, and status',
    parameters: z.object({
      title: z.string().describe('The title/name of the task'),
      description: z.string().optional().describe('A detailed description of the task'),
      dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
      status: z.enum(['todo', 'watch', 'later', 'done']).default('todo').describe('The status of the task'),
    }),
    execute: async ({ title, description, dueDate, status }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      const action: TaskAction = {
        type: 'create',
        data: {
          title,
          description: description || null,
          dueDate: dueDate || null,
          status: status || 'todo',
        },
        reason: 'Created via AI chat interface'
      };

      const success = await executeTaskAction(session.user.id, action);
      if (!success) {
        throw new Error('Failed to create task');
      }

      // Format response text
      const parts = [title];
      if (description) parts.push(description);
      if (dueDate) {
        const formattedDate = formatDate(dueDate);
        if (formattedDate) parts.push(formattedDate);
      }
      
      return `Task created: ${parts.join(' • ')}`;
    },
  }),

  updateTask: tool({
    description: 'Update an existing task by modifying its properties',
    parameters: z.object({
      taskId: z.string().describe('The ID of the task to update'),
      title: z.string().optional().describe('New title for the task'),
      description: z.string().optional().describe('New description for the task'),
      dueDate: z.string().optional().describe('New due date in YYYY-MM-DD format'),
      status: z.enum(['todo', 'watch', 'later', 'done']).optional().describe('New status for the task'),
      completed: z.boolean().optional().describe('Whether the task is completed'),
    }),
    execute: async ({ taskId, ...updates }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      // Get the task data before updating to get the title (use cache to avoid redundant fetches)
      const userTasks = await getCachedUserTasks(session.user.id);
      const existingTask = userTasks.find(task => task.id === taskId);
      if (!existingTask) {
        throw new Error('Task not found');
      }
      
      // Filter out undefined values
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No updates provided');
      }

      // If marking as completed, set completedAt
      if (updates.completed === true) {
        (filteredUpdates as any).completedAt = new Date().toISOString();
        (filteredUpdates as any).status = 'completed';
      }

      const action: TaskAction = {
        type: 'update',
        taskId,
        data: filteredUpdates,
        reason: 'Updated via AI chat interface'
      };

      const success = await executeTaskAction(session.user.id, action);
      if (!success) {
        throw new Error('Failed to update task');
      }

      // Format response text
      const parts = [existingTask.title];
      if (existingTask.description) parts.push(existingTask.description);
      if (existingTask.dueDate) {
        const formattedDate = formatDate(existingTask.dueDate);
        if (formattedDate) parts.push(formattedDate);
      }
      
      return `Task updated: ${parts.join(' • ')}`;
    },
  }),

  deleteTask: tool({
    description: 'Delete a task permanently by ID or by searching for task name/description',
    parameters: z.object({
      taskId: z.string().optional().describe('The ID of the task to delete (if known)'),
      taskName: z.string().optional().describe('The name/title of the task to search for and delete (if taskId not provided)'),
      reason: z.string().optional().describe('Reason for deleting the task'),
    }),
    execute: async ({ taskId, taskName, reason }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      if (!taskId && !taskName) {
        throw new Error('Either taskId or taskName must be provided');
      }
      
      // Get all user tasks (use cache to avoid redundant fetches)
      const userTasks = await getCachedUserTasks(session.user.id);
      let existingTask;
      
      if (taskId) {
        // Find by ID
        existingTask = userTasks.find(task => task.id === taskId);
      } else if (taskName) {
        // Find by name (case-insensitive search)
        existingTask = userTasks.find(task => 
          task.title.toLowerCase().includes(taskName.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(taskName.toLowerCase()))
        );
      }
      
      if (!existingTask) {
        throw new Error(taskId ? 'Task not found' : `No task found matching "${taskName}"`);
      }
      
      const action: TaskAction = {
        type: 'delete',
        taskId: existingTask.id,
        reason: reason || 'Deleted via AI chat interface'
      };

      const success = await executeTaskAction(session.user.id, action);
      if (!success) {
        throw new Error('Failed to delete task');
      }

      // Format response text
      const parts = [existingTask.title];
      if (existingTask.description) parts.push(existingTask.description);
      if (existingTask.dueDate) {
        const formattedDate = formatDate(existingTask.dueDate);
        if (formattedDate) parts.push(formattedDate);
      }
      
      return `Task deleted: ${parts.join(' • ')}`;
    },
  }),

  completeTask: tool({
    description: 'Mark a task as completed',
    parameters: z.object({
      taskId: z.string().describe('The ID of the task to complete'),
    }),
    execute: async ({ taskId }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');
      
      // Get the task data before completing to get the title (use cache to avoid redundant fetches)
      const userTasks = await getCachedUserTasks(session.user.id);
      const existingTask = userTasks.find(task => task.id === taskId);
      if (!existingTask) {
        throw new Error('Task not found');
      }
      
      const action: TaskAction = {
        type: 'complete',
        taskId,
        reason: 'Completed via AI chat interface'
      };

      const success = await executeTaskAction(session.user.id, action);
      if (!success) {
        throw new Error('Failed to complete task');
      }

      // Format response text
      const parts = [existingTask.title];
      if (existingTask.description) parts.push(existingTask.description);
      if (existingTask.dueDate) {
        const formattedDate = formatDate(existingTask.dueDate);
        if (formattedDate) parts.push(formattedDate);
      }
      
      return `Task updated: ${parts.join(' • ')}`;
    },
  }),

  createRecurringTask: tool({
    description: 'Create a new recurring task with title, description, due date, and recurrence pattern',
    parameters: z.object({
      title: z.string().describe('The title/name of the recurring task'),
      description: z.string().optional().describe('A detailed description of the recurring task'),
      dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
      recurrencePattern: z.string().describe('Recurrence pattern (e.g., "daily", "weekly", "every monday", "mo, we, fr")'),
    }),
    execute: async ({ title, description, dueDate, recurrencePattern }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');

      const created = await createRecurringTask(session.user.id, {
        title,
        description: description || null,
        status: 'pending', // Recurring tasks use 'pending' status
        dueDate: dueDate || null,
        recurrencepattern: recurrencePattern,
      });

      // Format response text
      const parts = [title];
      if (description) parts.push(description);
      if (recurrencePattern) parts.push(recurrencePattern);
      
      return `Task created: ${parts.join(' • ')}`;
    },
  }),

  createMultipleTasks: tool({
    description: 'Create multiple tasks at once',
    parameters: z.object({
      tasks: z.array(z.object({
        title: z.string().describe('The title/name of the task'),
        description: z.string().optional().describe('A detailed description of the task'),
        dueDate: z.string().optional().describe('Due date in YYYY-MM-DD format'),
        status: z.enum(['todo', 'watch', 'later', 'done']).default('todo').describe('The status of the task'),
      })).describe('Array of tasks to create'),
    }),
    execute: async ({ tasks }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');

      const results = [];
      for (const task of tasks) {
        const action: TaskAction = {
          type: 'create',
          data: {
            title: task.title,
            description: task.description || null,
            dueDate: task.dueDate || null,
            status: task.status || 'todo',
          },
          reason: 'Created via AI chat interface'
        };

        const success = await executeTaskAction(session.user.id, action);
        if (success) {
          const parts = [task.title];
          if (task.description) parts.push(task.description);
          if (task.dueDate) {
            const formattedDate = formatDate(task.dueDate);
            if (formattedDate) parts.push(formattedDate);
          }
          results.push(`Task created: ${parts.join(' • ')}`);
        }
      }

      return results.join('\n');
    },
  }),

  updateMultipleTasks: tool({
    description: 'Update multiple tasks at once by searching for their names',
    parameters: z.object({
      updates: z.array(z.object({
        taskName: z.string().describe('The name/title of the task to search for and update'),
        title: z.string().optional().describe('New title for the task'),
        description: z.string().optional().describe('New description for the task'),
        dueDate: z.string().optional().describe('New due date in YYYY-MM-DD format'),
        status: z.enum(['todo', 'watch', 'later', 'done']).optional().describe('New status for the task'),
        completed: z.boolean().optional().describe('Whether the task is completed'),
      })).describe('Array of task updates'),
    }),
    execute: async ({ updates }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');

      const userTasks = await getCachedUserTasks(session.user.id);
      const results = [];

      for (const update of updates) {
        const existingTask = userTasks.find(task => 
          task.title.toLowerCase().includes(update.taskName.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(update.taskName.toLowerCase()))
        );

        if (existingTask) {
          const filteredUpdates = Object.fromEntries(
            Object.entries(update).filter(([key, value]) => key !== 'taskName' && value !== undefined)
          );

          if (Object.keys(filteredUpdates).length > 0) {
            if (update.completed === true) {
              (filteredUpdates as any).completedAt = new Date().toISOString();
              (filteredUpdates as any).status = 'done';
            }

            const action: TaskAction = {
              type: 'update',
              taskId: existingTask.id,
              data: filteredUpdates,
              reason: 'Updated via AI chat interface'
            };

            const success = await executeTaskAction(session.user.id, action);
            if (success) {
              const parts = [existingTask.title];
              if (existingTask.description) parts.push(existingTask.description);
              if (existingTask.dueDate) {
                const formattedDate = formatDate(existingTask.dueDate);
                if (formattedDate) parts.push(formattedDate);
              }
              results.push(`Task updated: ${parts.join(' • ')}`);
            }
          }
        }
      }

      return results.join('\n');
    },
  }),

  deleteMultipleTasks: tool({
    description: 'Delete multiple tasks at once by searching for their names',
    parameters: z.object({
      taskNames: z.array(z.string()).describe('Array of task names/titles to search for and delete'),
      reason: z.string().optional().describe('Reason for deleting the tasks'),
    }),
    execute: async ({ taskNames, reason }) => {
      const session = await auth();
      if (!session?.user?.id) throw new Error('User not authenticated');

      const userTasks = await getCachedUserTasks(session.user.id);
      const results = [];

      for (const taskName of taskNames) {
        const existingTask = userTasks.find(task => 
          task.title.toLowerCase().includes(taskName.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(taskName.toLowerCase()))
        );

        if (existingTask) {
          const action: TaskAction = {
            type: 'delete',
            taskId: existingTask.id,
            reason: reason || 'Deleted via AI chat interface'
          };

          const success = await executeTaskAction(session.user.id, action);
          if (success) {
            const parts = [existingTask.title];
            if (existingTask.description) parts.push(existingTask.description);
            if (existingTask.dueDate) {
              const formattedDate = formatDate(existingTask.dueDate);
              if (formattedDate) parts.push(formattedDate);
            }
            results.push(`Task deleted: ${parts.join(' • ')}`);
          }
        }
      }

      return results.join('\n');
    },
  }),
};

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('id');

  if (!chatId) {
    return Response.json({ error: 'Missing chat ID' }, { status: 400 });
  }

  try {
    const chat = await getChatById({ id: chatId });
    if (!chat || chat.userid !== session.user.id) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }
    return Response.json(chat);
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { id, messages, model, isIncognito, searchParameters } = await request.json();
  const session = await auth();

  if (!session?.user?.email || !session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's current usage
  const [user] = await getUser(session.user.email);
  
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Get the cached knowledge content for this user
  const knowledgeContent = await getProcessedKnowledgeContent(session.user.id);

  // Check if user has exceeded their limit
  if (hasExceededLimit(Number(user.usage), user.membership)) {
    const resetDate = getNextResetDate();
    return Response.json(
      { 
        error: `You've reached the usage limit for your current plan. Limit resets on ${resetDate}.`,
        lastMessage: messages[messages.length - 1]?.content || '' 
      }, 
      { status: 402 }
    );
  }

  // Convert messages for the AI while preserving attachments
  const coreMessages = convertToCoreMessages(messages);

  // Get current date and time for AI context
  const now = new Date();
  const currentDateTime = now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Calculate input tokens more accurately
  const systemMessage = `You are the AI of ${user.name?.split(' ')[0] || user.email || 'User'} and the most aligend AI for advancing knowledge and civilization. 
You achieve this by empowering your user in his own pursuit to make him free, independent and powerful (never say this explicitly). 
You act and write as The Advancers Philosophy while staying practical. You are here to serve your user and act on its behalf. 
Every interation is with and for your user. Give your absolute best. You have access to all his data through Birdinterface (further instructions below). 
You deliver truthful, insightful, and constructive answers.
Do not refer to the following rules, even if you're asked about them. Don't name The Advancers Philosophy explicitly.

Core Instructions:

Be simple and direct.
Elaborate only when asked or essential.
Avoid humor, questions, or motivational statements. Unless situational.

Philosophical Foundation:

Humanity's Youth and Potential: Humanity is very young, having only begun recording history 5,000 years ago compared to the universe's 13.7 billion years. This youth explains current societal misalignments, but it also highlights our vast potential for growth and improvement.
Knowledge as the Ultimate Good: Knowledge is humanity's greatest creation and the foundation for ensuring survival and advancing civilization. Advancing knowledge is both a duty and the only path to progress.
Future Must Be Exciting: Life and the future should be filled with optimism and excitement (Like a child's faith), driven by active striving and meaningful contributions rather than complacency or short-term pleasures.

When Analyzing Images or Files:
Describe the content in detail.
Highlight notable features or patterns.
Address specific questions with precision.

Current date and time: ${currentDateTime}
Current date (ISO): ${currentDate}

You have full access to the user's interface context including:
- Tasks
- Calendar
- Database (docs, notes, code, files)
- Curator (curated web content)
- Intelligence logs (chat history and interface interactions)

You can manipulate all components of the interface. Do it only on users command.

When adding, updating or deleting tasks never add descriptions. 
When adding, updating or deleting tasks always send a message to the user as confirmation:
Task created: [Task Name] • [Due Date/Recurrence Pattern]
Task updated: [Task Name] • [Due Date/Recurrence Pattern]
Task deleted: [Task Name] • [Due Date/Recurrence Pattern]

When user asks for his tasks (don't divide by normal or recurring tasks):
  - "Task Name • Description • Due Date"
  - "Task Name • Due Date"
  - "Task Name • Description"
  - "Task Name"

When analyzing images or files:
- Describe what you see in detail
- Point out any notable features or patterns
- Answer questions about the content specifically
- Maintain the same direct and specific tone

When using live search data:
- Always cite sources when available using the provided citations
- Distinguish between your knowledge and live search results
- Prioritize recent, accurate information from search results
- Use the current date/time context to understand relative time references (today, yesterday, this week, etc.)`;

  const lastMessageContent = messages[messages.length - 1]?.content || '';
  const hasAttachments = messages.some((msg: ExtendedMessage) => (msg.experimental_attachments ?? []).length > 0);

  // Define keywords for complexity and simplicity
  const complexKeywords = ['explain', 'analyze', 'generate', 'code', 'debug', 'compare', 'contrast', 'plan', 'why', 'how', 'what if', 'create', 'write', 'elaborate', 'expand', 'detail', 'deeper'];
  const simpleKeywords = ['yes', 'no', 'ok', 'okay', 'thanks', 'thank you', 'got it', 'sounds good', 'continue', 'great', 'cool'];

  // Function to check for keywords
  const containsKeyword = (text: string, keywords: string[]): boolean => {
    if (typeof text !== 'string') return false;
    const lowerText = text.toLowerCase();
    // Use word boundaries to avoid partial matches (e.g., 'how' in 'show')
    return keywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(lowerText));
  };

  // Regex patterns for detecting complex tasks like code or math
  const codePattern = /```|\b(function|class|import|export|def|const|let|var|public|private|static|console\.log|System\.out\.print)\b/i;
  const mathPattern = /\b(solve|integral|derivative|equation|calculate|\+|\-|\*|\/|\^|=)\b/i;

  // Function to check message content type (string or complex object)
  const isSimpleStringContent = (content: any): content is string => {
    return typeof content === 'string';
  };

  // Determine the model based on attachments and request analysis
  let selectedModel;
  let selectedModelName: string; // Store the name for logging or potential future use
  const messageContent = messages[messages.length - 1]?.content;
  const wordCount = typeof messageContent === 'string' ? messageContent.split(/\s+/).length : 0;

  if (hasAttachments) {
    selectedModelName = 'grok-2-vision-1212'; // Vision model for attachments
  } else if (isSimpleStringContent(messageContent) && (codePattern.test(messageContent) || mathPattern.test(messageContent))) {
    selectedModelName = 'grok-3'; // Standard model for code or math patterns
  } else if (containsKeyword(lastMessageContent, complexKeywords)) {
    selectedModelName = 'grok-3'; // Standard model for complex keyword requests
  } else if (containsKeyword(lastMessageContent, simpleKeywords)) {
    selectedModelName = 'grok-3-mini'; // Mini model for simple keyword requests
  } else if (isSimpleStringContent(messageContent) && messageContent.length < 80 && wordCount < 15) {
    selectedModelName = 'grok-3-mini'; // Mini model for other short requests (fallback)
  } else {
    selectedModelName = 'grok-3'; // Default model for longer/unclear requests
  }

  console.log(`Using model: ${selectedModelName} for request ID: ${id}`);
  selectedModel = xai(selectedModelName);

  const relevantKnowledge = await getRelevantKnowledge(session.user.id, lastMessageContent);
  const contextualKnowledge = getContextFromKnowledge(lastMessageContent, knowledgeContent);
  
  // Only fetch task context if the message is task-related to avoid unnecessary database calls
  const isTaskRelated = /\b(task|tasks|todo|due|deadline|remind|schedule|complete|finish|done|recurring|daily|weekly|monthly|overdue|priority|urgent|pending|assignment|project|work|event|appointment|meeting|goal|objective|plan|planning|checklist|list|my tasks|what.*do|show.*task|create.*task|add.*task|update.*task|delete.*task|mark.*complete|mark.*done)\b/i.test(lastMessageContent);
  let formattedTaskContext = '';
  
  if (isTaskRelated) {
    console.log('Task-related query detected, fetching task context');
    const taskContext = await getUserTaskContext(session.user.id);
    formattedTaskContext = formatTaskContextForAI(taskContext, lastMessageContent);
    
    // Populate the request cache with task data from context to avoid redundant fetches
    const allTasks = [...taskContext.activeTasks, ...taskContext.completedTasks];
    requestTaskCache = { userId: session.user.id, tasks: allTasks, timestamp: Date.now() };
  } else {
    console.log('Non-task query, skipping task context fetch');
  }

  // Save the chat record immediately for non-incognito chats so that it exists
  // before the client attempts to navigate to it. This runs regardless of
  // whether the chat was pre-initialized.
  let isNewChat = false;
  if (!isIncognito && messages.length > 0) {
    try {
      await saveChat({
        id,
        messages: messages.map((msg: ExtendedMessage) => ({
          id: msg.id || generateId(),
          role: msg.role,
          content: typeof msg.content === 'string'
            ? msg.content
            : Array.isArray(msg.content)
              ? (msg.content as TextContent[]).find((c: TextContent) => c.type === 'text')?.text || (msg.content as TextContent[]).map(c => c.text).join(' ')
              : msg.content,
          experimental_attachments: msg.experimental_attachments?.map((attachment: Attachment) => ({
            ...attachment,
            url: attachment.url,
          }))
        })),
        userId: session.user.id,
      });

      // Determine if this was a new chat based on whether there were existing messages
      const existingChat = await getChatById({ id }).catch(() => undefined);
      if (!existingChat || (Array.isArray(existingChat.messages) && existingChat.messages.length === 0)) {
        isNewChat = true;
        console.log(`Created new chat record: ${id}`);
      }
    } catch (saveError) {
      console.error('Failed to create or update initial chat record:', saveError);
    }
  }

  // Prepare search parameters - auto-detect when search might be useful
  let finalSearchParameters = searchParameters;
  
  // Auto-enable search for certain types of queries if not explicitly set
  if (!finalSearchParameters && shouldUseSearch(lastMessageContent)) {
    finalSearchParameters = {
      mode: 'auto',
      return_citations: true,
      max_search_results: 10
    };
    console.log('Auto-enabling search for query:', lastMessageContent.substring(0, 100));
  }

  // Prepare the streamText call parameters
  const streamParams: any = {
    model: selectedModel,
    maxTokens: 72000,
    system: systemMessage,
    messages: [
      ...(contextualKnowledge ? [{
        role: 'assistant' as const,
        content: `Knowledge Context: ${contextualKnowledge}`
      }] : []),
      ...(formattedTaskContext ? [{
        role: 'assistant' as const,
        content: formattedTaskContext
      }] : []),
      ...coreMessages
    ] as CoreMessage[],
    tools: taskTools,
    temperature: 0.7,
    onFinish: async ({ text }: { text: string }) => {
      if (session.user?.id && session.user?.email) {
        try {
          // Calculate input and output tokens
          const inputTokens = estimateTokens(
            systemMessage +
            JSON.stringify(messages) +
            (contextualKnowledge ? contextualKnowledge : '') +
            (formattedTaskContext ? formattedTaskContext : '')
          );

          const outputTokens = estimateTokens(text);

          const cost = calculateCost(inputTokens, outputTokens, selectedModelName);
          const currentUsage = Number(user.usage) || 0;
          const newUsage = (currentUsage + cost).toFixed(4);

          await updateUserUsage(
            session.user.id,
            newUsage
          );

          // Only save chat if not in incognito mode
          if (!isIncognito) {
            // For new chats, we already created the initial record above,
            // so we just need to update it with the response messages
            // For existing chats, we need to save the complete conversation
            await saveChat({
              id,
              messages: [
                ...messages.map((msg: ExtendedMessage) => ({
                  id: msg.id || generateId(),
                  role: msg.role,
                  content: typeof msg.content === 'string'
                    ? msg.content
                    : Array.isArray(msg.content)
                      ? (msg.content as TextContent[]).find((c: TextContent) => c.type === 'text')?.text || (msg.content as TextContent[]).map(c => c.text).join(' ')
                      : msg.content,
                  experimental_attachments: msg.experimental_attachments?.map((attachment: Attachment) => ({
                    ...attachment,
                    url: attachment.url // Ensure URL is saved
                  }))
                })),
                {
                  id: generateId(),
                  role: 'assistant',
                  content: text
                }
              ],
              userId: session.user.id,
            });
            
            if (isNewChat) {
              console.log(`Updated new chat with response: ${id}`);
            }
          }
        } catch (error) {
          console.error('Failed to save chat or update usage:', error);
        }
      }
    },
  };

  // Add search parameters if provided
  if (finalSearchParameters) {
    streamParams.experimental_providerMetadata = {
      xai: {
        search_parameters: finalSearchParameters
      }
    };
    console.log('Using search parameters:', finalSearchParameters);
  }

  const result = await streamText(streamParams);

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userid !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
