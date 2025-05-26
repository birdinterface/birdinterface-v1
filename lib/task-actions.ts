import { createTask, updateTask, deleteTask, getUserTasks } from '@/lib/queries';
import { Task } from '@/lib/supabase';
import { clearTaskContextCache } from '@/lib/task-context';

export interface TaskAction {
  type: 'create' | 'update' | 'delete' | 'complete' | 'prioritize';
  taskId?: string;
  data?: Partial<Task>;
  reason?: string;
}

export interface TaskSuggestion {
  action: TaskAction;
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

export async function executeTaskAction(userId: string, action: TaskAction): Promise<boolean> {
  try {
    switch (action.type) {
      case 'create':
        if (!action.data?.title) return false;
        await createTask(userId, {
          title: action.data.title,
          description: action.data.description || null,
          status: action.data.status || 'pending',
          dueDate: action.data.dueDate || null
        });
        break;

      case 'update':
        if (!action.taskId || !action.data) return false;
        await updateTask(action.taskId, userId, action.data);
        break;

      case 'delete':
        if (!action.taskId) return false;
        await deleteTask(action.taskId, userId);
        break;

      case 'complete':
        if (!action.taskId) return false;
        await updateTask(action.taskId, userId, {
          completed: true,
          completedAt: new Date().toISOString(),
          status: 'completed'
        });
        break;

      case 'prioritize':
        if (!action.taskId || !action.data?.status) return false;
        await updateTask(action.taskId, userId, {
          status: action.data.status
        });
        break;

      default:
        return false;
    }

    // Clear cache after any task modification
    clearTaskContextCache(userId);
    return true;
  } catch (error) {
    console.error('Error executing task action:', error);
    return false;
  }
}

export function generateTaskSuggestions(tasks: Task[]): TaskSuggestion[] {
  const suggestions: TaskSuggestion[] = [];
  const now = new Date();

  // Find overdue tasks
  const overdueTasks = tasks.filter(task => 
    !task.completed && 
    task.dueDate && 
    new Date(task.dueDate) < now
  );

  // Suggest prioritizing overdue tasks
  overdueTasks.forEach(task => {
    const daysOverdue = Math.floor((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
    const urgencyText = daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`;
    suggestions.push({
      action: {
        type: 'prioritize',
        taskId: task.id,
        data: { status: 'urgent' },
        reason: `Task is ${urgencyText}`
      },
      priority: 'high',
      description: `Complete overdue task "${task.title}" (${urgencyText})`,
      impact: `Reduce backlog and prevent further delays`
    });
  });

  // Find tasks without due dates
  const tasksWithoutDueDates = tasks.filter(task => 
    !task.completed && !task.dueDate
  );

  if (tasksWithoutDueDates.length > 0) {
    const taskTitles = tasksWithoutDueDates.slice(0, 5).map(t => `"${t.title}"`).join(', ');
    const moreText = tasksWithoutDueDates.length > 5 ? ` and ${tasksWithoutDueDates.length - 5} more` : '';
    suggestions.push({
      action: {
        type: 'update',
        reason: 'Tasks without due dates can lead to procrastination'
      },
      priority: 'medium',
      description: `Add due dates to tasks: ${taskTitles}${moreText}`,
      impact: 'Improve time management and task prioritization'
    });
  }

  // Find tasks with vague descriptions
  const vagueDescriptionTasks = tasks.filter(task => 
    !task.completed && 
    (!task.description || task.description.length < 10)
  );

  if (vagueDescriptionTasks.length > 0) {
    suggestions.push({
      action: {
        type: 'update',
        reason: 'Detailed descriptions improve task clarity'
      },
      priority: 'low',
      description: `Add detailed descriptions to ${vagueDescriptionTasks.length} tasks`,
      impact: 'Reduce ambiguity and improve task execution'
    });
  }

  // Suggest completing old pending tasks
  const oldPendingTasks = tasks.filter(task => {
    if (task.completed) return false;
    const daysSinceCreated = Math.floor((now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated > 30 && task.status === 'pending';
  });

  if (oldPendingTasks.length > 0) {
    suggestions.push({
      action: {
        type: 'update',
        reason: 'Long-pending tasks may need review or completion'
      },
      priority: 'medium',
      description: `Review ${oldPendingTasks.length} tasks pending for over 30 days`,
      impact: 'Clean up task list and improve focus'
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

export function formatTaskSuggestionsForAI(suggestions: TaskSuggestion[]): string {
  if (suggestions.length === 0) {
    return 'No specific task management suggestions at this time.';
  }

  let formatted = 'TASK MANAGEMENT SUGGESTIONS:\n\n';
  
  suggestions.forEach((suggestion, index) => {
    formatted += `${index + 1}. [${suggestion.priority.toUpperCase()} PRIORITY] ${suggestion.description}\n`;
    formatted += `   Impact: ${suggestion.impact}\n`;
    if (suggestion.action.reason) {
      formatted += `   Reason: ${suggestion.action.reason}\n`;
    }
    formatted += '\n';
  });

  return formatted;
}

export function getTaskManagementInsights(tasks: Task[]): string {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(t => 
    !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  let insights = `TASK INSIGHTS:\n`;
  insights += `- Completion Rate: ${completionRate}% (${completedTasks}/${totalTasks})\n`;
  insights += `- Active Tasks: ${activeTasks}\n`;
  insights += `- Overdue Tasks: ${overdueTasks}\n`;

  if (overdueTasks > 0) {
    insights += `- Urgency Level: HIGH (${overdueTasks} overdue tasks need immediate attention)\n`;
  } else if (activeTasks > 10) {
    insights += `- Workload Level: HIGH (${activeTasks} active tasks)\n`;
  } else {
    insights += `- Workload Level: MANAGEABLE\n`;
  }

  // Task status distribution
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  insights += `\nSTATUS DISTRIBUTION:\n`;
  Object.entries(statusCounts).forEach(([status, count]) => {
    insights += `- ${status}: ${count}\n`;
  });

  return insights;
} 