import { getUserTasks, getUserRecurringTasks, getTaskActionLogs } from '@/lib/queries';
import { Task, RecurringTaskSupabase, ActionLog, ActionLogSupabase } from '@/lib/supabase';
import { generateTaskSuggestions, formatTaskSuggestionsForAI, getTaskManagementInsights, TaskSuggestion } from '@/lib/task-actions';

interface TaskContext {
  activeTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  recurringTasks: RecurringTaskSupabase[];
  recentActions: ActionLog[];
  summary: string;
  insights: string;
  suggestions: TaskSuggestion[];
}

// Cache for user task contexts
const taskContextCache = new Map<string, { context: TaskContext; lastUpdated: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getUserTaskContext(userId: string): Promise<TaskContext> {
  // Check cache first
  const cached = taskContextCache.get(userId);
  if (cached && Date.now() - cached.lastUpdated < CACHE_DURATION) {
    return cached.context;
  }

  try {
    // Fetch all task data
    const [tasks, recurringTasks] = await Promise.all([
      getUserTasks(userId),
      getUserRecurringTasks(userId)
    ]);

    // Categorize tasks
    const now = new Date();
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    const overdueTasks = activeTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    );

    // Get recent action logs for context
    const recentTaskIds = tasks.slice(0, 10).map(task => task.id);
    const recentActionsPromises = recentTaskIds.map(taskId => getTaskActionLogs(taskId));
    const allRecentActions = await Promise.all(recentActionsPromises);
    const recentActions = allRecentActions
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Generate summary, insights, and suggestions
    const allTasks = [...tasks];
    const summary = generateTaskSummary({
      activeTasks,
      completedTasks,
      overdueTasks,
      recurringTasks,
      recentActions
    });
    const insights = getTaskManagementInsights(allTasks);
    const suggestions = generateTaskSuggestions(allTasks);

    const context: TaskContext = {
      activeTasks,
      completedTasks,
      overdueTasks,
      recurringTasks,
      recentActions,
      summary,
      insights,
      suggestions
    };

    // Update cache
    taskContextCache.set(userId, {
      context,
      lastUpdated: Date.now()
    });

    return context;
  } catch (error) {
    console.error('Error fetching task context:', error);
    return {
      activeTasks: [],
      completedTasks: [],
      overdueTasks: [],
      recurringTasks: [],
      recentActions: [],
      summary: 'Unable to load task context.',
      insights: 'Unable to load task insights.',
      suggestions: []
    };
  }
}

function generateTaskSummary(context: Omit<TaskContext, 'summary' | 'insights' | 'suggestions'>): string {
  const { activeTasks, completedTasks, overdueTasks, recurringTasks } = context;
  
  let summary = ``;

  // Show overdue tasks first if any
  if (overdueTasks.length > 0) {
    summary += `Overdue Tasks\n`;
    overdueTasks.forEach(task => {
      const daysOverdue = Math.floor((Date.now() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
      summary += `${task.title} [${daysOverdue}d overdue]\n`;
    });
    summary += `\n`;
  }

  // Show active tasks
  if (activeTasks.length > 0) {
    summary += `Tasks\n`;
    activeTasks.slice(0, 10).forEach(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const dueDateDisplay = diffDays === 0 ? 'Today' : 
                              diffDays === 1 ? 'Tomorrow' : 
                              diffDays > 0 ? dueDate.toLocaleDateString() : 
                              `${Math.abs(diffDays)}d overdue`;
        summary += `${task.title} [${dueDateDisplay}]\n`;
      } else {
        summary += `${task.title} [No date]\n`;
      }
    });
    summary += `\n`;
  }

  // Show recurring tasks
  if (recurringTasks.length > 0) {
    // Add horizontal line before recurring tasks if there's already content
    if (summary.length > 0) {
      summary += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    }
    summary += `Recurring Tasks`;
    
    // Sort recurring tasks: Tomorrow first, then by date, then no date
    const sortedRecurringTasks = [...recurringTasks].sort((a, b) => {
      if (!a.duedate && !b.duedate) return 0;
      if (!a.duedate) return 1;
      if (!b.duedate) return -1;
      
      const dateA = new Date(a.duedate);
      const dateB = new Date(b.duedate);
      const today = new Date();
      
      const diffA = Math.ceil((dateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffB = Math.ceil((dateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return diffA - diffB;
    });
    
    sortedRecurringTasks.slice(0, 10).forEach(task => {
      if (task.duedate) {
        const dueDate = new Date(task.duedate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const dueDateDisplay = diffDays === 0 ? 'Today' : 
                              diffDays === 1 ? 'Tomorrow' : 
                              diffDays > 0 ? dueDate.toLocaleDateString() : 
                              `${Math.abs(diffDays)}d overdue`;
        summary += `${task.title} [${dueDateDisplay}]\n`;
      } else {
        summary += `${task.title} [No date]\n`;
      }
    });
  }

  return summary.trim();
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'todo':
    case 'pending': return 'PENDING';
    case 'in-progress':
    case 'in_progress': return 'IN PROGRESS';
    case 'urgent': return 'URGENT';
    case 'completed': return 'COMPLETED';
    case 'on-hold': return 'ON HOLD';
    default: return 'TODO';
  }
}

export function formatTaskContextForAI(context: TaskContext, userQuery: string): string {
  const queryLower = userQuery.toLowerCase();
  const isTaskRelated = queryLower.includes('task') || 
                       queryLower.includes('todo') || 
                       queryLower.includes('deadline') || 
                       queryLower.includes('due') || 
                       queryLower.includes('complete') || 
                       queryLower.includes('finish') || 
                       queryLower.includes('schedule') ||
                       queryLower.includes('priority') ||
                       queryLower.includes('overdue') ||
                       queryLower.includes('recurring');

  if (!isTaskRelated && context.activeTasks.length === 0) {
    return '';
  }

  let formattedContext = `${context.summary}`;
  
  // Only include insights and suggestions if specifically requested
  const wantsAdvice = queryLower.includes('advice') || 
                     queryLower.includes('suggest') || 
                     queryLower.includes('recommend') || 
                     queryLower.includes('help') ||
                     queryLower.includes('improve') ||
                     queryLower.includes('optimize') ||
                     queryLower.includes('what should');
  
  if (isTaskRelated && wantsAdvice) {
    formattedContext += `\n${context.insights}\n`;
    
    if (context.suggestions.length > 0) {
      formattedContext += `\n${formatTaskSuggestionsForAI(context.suggestions)}\n`;
    }
  }

  // Add detailed task information if query is task-related
  if (isTaskRelated) {
    if (queryLower.includes('overdue') && context.overdueTasks.length > 0) {
      formattedContext += `\nOverdue Tasks\n`;
      context.overdueTasks.forEach(task => {
        formattedContext += formatTaskDetails(task);
      });
    }

    if (queryLower.includes('active') || queryLower.includes('current') || queryLower.includes('pending')) {
      formattedContext += `\nTasks\n`;
      context.activeTasks.slice(0, 10).forEach(task => {
        formattedContext += formatTaskDetails(task);
      });
    }

    if (queryLower.includes('completed') || queryLower.includes('done') || queryLower.includes('finished')) {
      formattedContext += `\nCompleted Tasks\n`;
      context.completedTasks.slice(0, 5).forEach(task => {
        formattedContext += formatTaskDetails(task);
      });
    }

    if (queryLower.includes('recurring') || queryLower.includes('repeat')) {
      formattedContext += `\nRecurring Tasks\n`;
      context.recurringTasks.forEach(task => {
        formattedContext += formatRecurringTaskDetails(task);
      });
    }
  }

  return formattedContext;
}

function formatTaskDetails(task: Task): string {
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 && !task.completed) {
      return `${task.title} [${Math.abs(diffDays)}d overdue]\n`;
    } else if (diffDays === 0) {
      return `${task.title} [Today]\n`;
    } else if (diffDays === 1) {
      return `${task.title} [Tomorrow]\n`;
    } else if (diffDays > 0) {
      return `${task.title} [${dueDate.toLocaleDateString()}]\n`;
    }
  }
  
  return `${task.title} [No date]\n`;
}

function formatRecurringTaskDetails(task: RecurringTaskSupabase): string {
  if (task.duedate) {
    const dueDate = new Date(task.duedate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `${task.title} [Today]\n`;
    } else if (diffDays === 1) {
      return `${task.title} [Tomorrow]\n`;
    } else {
      return `${task.title} [${dueDate.toLocaleDateString()}]\n`;
    }
  }
  
  return `${task.title} [No date]\n`;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

// Clear cache for a specific user (call this when tasks are updated)
export function clearTaskContextCache(userId: string): void {
  taskContextCache.delete(userId);
}

// Clear all cache (call this periodically or on server restart)
export function clearAllTaskContextCache(): void {
  taskContextCache.clear();
} 