import {
  getTaskActionLogs,
  getUserRecurringTasks,
  getUserTasks,
} from "@/lib/queries"
import { ActionLog, RecurringTaskSupabase, Task } from "@/lib/supabase"
import {
  formatTaskSuggestionsForAI,
  generateTaskSuggestions,
  getTaskManagementInsights,
  TaskSuggestion,
} from "@/lib/task-actions"

interface TaskContext {
  activeTasks: Task[]
  completedTasks: Task[]
  overdueTasks: Task[]
  recurringTasks: RecurringTaskSupabase[]
  recentActions: ActionLog[]
  summary: string
  insights: string
  suggestions: TaskSuggestion[]
}

// Cache for user task contexts
const taskContextCache = new Map<
  string,
  { context: TaskContext; lastUpdated: number }
>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getUserTaskContext(userId: string): Promise<TaskContext> {
  // Check cache first
  const cached = taskContextCache.get(userId)
  if (cached && Date.now() - cached.lastUpdated < CACHE_DURATION) {
    console.log("Task context served from cache")
    return cached.context
  }

  try {
    console.log("Task context cache miss, fetching from database")
    // Fetch all task data
    const [tasks, recurringTasks] = await Promise.all([
      getUserTasks(userId),
      getUserRecurringTasks(userId),
    ])

    // Categorize tasks
    const now = new Date()
    const activeTasks = tasks.filter((task) => !task.completed)
    const completedTasks = tasks.filter((task) => task.completed)
    const overdueTasks = activeTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now
    )

    // Get recent action logs for context
    const recentTaskIds = tasks.slice(0, 10).map((task) => task.id)
    const recentActionsPromises = recentTaskIds.map((taskId) =>
      getTaskActionLogs(taskId)
    )
    const allRecentActions = await Promise.all(recentActionsPromises)
    const recentActions = allRecentActions
      .flat()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20)

    // Generate summary, insights, and suggestions
    const allTasks = [...tasks]
    const summary = generateTaskSummary({
      activeTasks,
      completedTasks,
      overdueTasks,
      recurringTasks,
      recentActions,
    })
    const insights = getTaskManagementInsights(allTasks)
    const suggestions = generateTaskSuggestions(allTasks)

    const context: TaskContext = {
      activeTasks,
      completedTasks,
      overdueTasks,
      recurringTasks,
      recentActions,
      summary,
      insights,
      suggestions,
    }

    // Update cache
    taskContextCache.set(userId, {
      context,
      lastUpdated: Date.now(),
    })

    return context
  } catch (error) {
    console.error("Error fetching task context:", error)
    return {
      activeTasks: [],
      completedTasks: [],
      overdueTasks: [],
      recurringTasks: [],
      recentActions: [],
      summary: "Unable to load task context.",
      insights: "Unable to load task insights.",
      suggestions: [],
    }
  }
}

function generateTaskSummary(
  context: Omit<TaskContext, "summary" | "insights" | "suggestions">
): string {
  const { activeTasks, completedTasks, overdueTasks, recurringTasks } = context

  let summaryLines: string[] = []

  const formatDateDisplay = (
    dateString: string | null | undefined,
    isOverdueBase?: boolean
  ): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (isOverdueBase) {
      // For overdue tasks, always show how many days overdue
      const daysOverdue = Math.abs(diffDays)
      return `${daysOverdue}d overdue`
    }

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
    return date.toLocaleDateString() // Default date format
  }

  // Show overdue tasks first if any
  if (overdueTasks.length > 0) {
    summaryLines.push(`Overdue Tasks`)
    overdueTasks.slice(0, 10).forEach((task) => {
      const parts = [task.title]
      if (task.description) parts.push(task.description)
      const dateDisplay = formatDateDisplay(task.dueDate, true)
      if (dateDisplay) parts.push(dateDisplay)
      summaryLines.push(parts.join(" • "))
    })
    summaryLines.push("") // Add a blank line for separation
  }

  // Show active tasks
  if (activeTasks.length > 0) {
    summaryLines.push(`Tasks`)
    activeTasks.slice(0, 10).forEach((task) => {
      const parts = [task.title]
      if (task.description) parts.push(task.description)
      const dateDisplay = formatDateDisplay(task.dueDate)
      if (dateDisplay) parts.push(dateDisplay)
      summaryLines.push(parts.join(" • "))
    })
    summaryLines.push("") // Add a blank line for separation
  }

  // Show recurring tasks
  if (recurringTasks.length > 0) {
    if (
      summaryLines.length > 0 &&
      summaryLines[summaryLines.length - 1] !== ""
    ) {
      // Only add separator if there was content and last line wasn't already a separator
      summaryLines.push("") // Add a blank line for separation before the horizontal line
    }
    // Add horizontal line before recurring tasks if there's already content
    if (summaryLines.length > 1) {
      // Check if there's more than just a potential initial blank line
      summaryLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    }
    summaryLines.push(`Recurring Tasks`)

    const sortedRecurringTasks = [...recurringTasks].sort((a, b) => {
      if (!a.duedate && !b.duedate) return 0
      if (!a.duedate) return 1
      if (!b.duedate) return -1

      const dateA = new Date(a.duedate)
      const dateB = new Date(b.duedate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const taskDateA = new Date(dateA)
      taskDateA.setHours(0, 0, 0, 0)
      const taskDateB = new Date(dateB)
      taskDateB.setHours(0, 0, 0, 0)

      const diffA = Math.ceil(
        (taskDateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      const diffB = Math.ceil(
        (taskDateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      return diffA - diffB
    })

    sortedRecurringTasks.slice(0, 10).forEach((task) => {
      const parts = [task.title]
      if (task.description) parts.push(task.description)
      let dateDisplay = formatDateDisplay(task.duedate)
      if (dateDisplay && task.recurrencepattern) {
        // Capitalize first letter of recurrence pattern
        const pattern =
          task.recurrencepattern.charAt(0).toUpperCase() +
          task.recurrencepattern.slice(1).toLowerCase()
        dateDisplay += `, ${pattern}`
      } else if (!dateDisplay && task.recurrencepattern) {
        const pattern =
          task.recurrencepattern.charAt(0).toUpperCase() +
          task.recurrencepattern.slice(1).toLowerCase()
        dateDisplay = pattern // Show recurrence pattern even if no date
      }
      if (dateDisplay) parts.push(dateDisplay)
      summaryLines.push(parts.join(" • "))
    })
  }

  // Remove last empty line if it exists
  if (summaryLines.length > 0 && summaryLines[summaryLines.length - 1] === "") {
    summaryLines.pop()
  }

  return summaryLines.join("\n").trim()
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "todo":
    case "pending":
      return "PENDING"
    case "in-progress":
    case "in_progress":
      return "IN PROGRESS"
    case "urgent":
      return "URGENT"
    case "completed":
      return "COMPLETED"
    case "on-hold":
      return "ON HOLD"
    default:
      return "TODO"
  }
}

export function formatTaskContextForAI(
  context: TaskContext,
  userQuery: string
): string {
  const queryLower = userQuery.toLowerCase()
  const isTaskRelated =
    queryLower.includes("task") ||
    queryLower.includes("todo") ||
    queryLower.includes("deadline") ||
    queryLower.includes("due") ||
    queryLower.includes("complete") ||
    queryLower.includes("finish") ||
    queryLower.includes("schedule") ||
    queryLower.includes("priority") ||
    queryLower.includes("overdue") ||
    queryLower.includes("recurring")

  if (!isTaskRelated && context.activeTasks.length === 0) {
    return ""
  }

  let formattedContext = `${context.summary}`

  // Only include insights and suggestions if specifically requested
  const wantsAdvice =
    queryLower.includes("advice") ||
    queryLower.includes("suggest") ||
    queryLower.includes("recommend") ||
    queryLower.includes("help") ||
    queryLower.includes("improve") ||
    queryLower.includes("optimize") ||
    queryLower.includes("what should")

  if (isTaskRelated && wantsAdvice) {
    formattedContext += `\n${context.insights}\n`

    if (context.suggestions.length > 0) {
      formattedContext += `\n${formatTaskSuggestionsForAI(context.suggestions)}\n`
    }
  }

  // Add detailed task information if query is task-related
  if (isTaskRelated) {
    if (queryLower.includes("overdue") && context.overdueTasks.length > 0) {
      formattedContext += `\nOverdue Tasks\n`
      context.overdueTasks.forEach((task) => {
        formattedContext += formatTaskDetails(task)
      })
    }

    if (
      queryLower.includes("active") ||
      queryLower.includes("current") ||
      queryLower.includes("pending")
    ) {
      formattedContext += `\nTasks\n`
      context.activeTasks.slice(0, 10).forEach((task) => {
        formattedContext += formatTaskDetails(task)
      })
    }

    if (
      queryLower.includes("completed") ||
      queryLower.includes("done") ||
      queryLower.includes("finished")
    ) {
      formattedContext += `\nCompleted Tasks\n`
      context.completedTasks.slice(0, 5).forEach((task) => {
        formattedContext += formatTaskDetails(task)
      })
    }

    if (queryLower.includes("recurring") || queryLower.includes("repeat")) {
      formattedContext += `\nRecurring Tasks\n`
      context.recurringTasks.forEach((task) => {
        formattedContext += formatRecurringTaskDetails(task)
      })
    }
  }

  return formattedContext
}

function formatTaskDetails(task: Task): string {
  const parts = [task.title]
  if (task.description) parts.push(task.description)

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
    return date.toLocaleDateString()
  }

  const dateDisplay = formatDate(task.dueDate)
  if (dateDisplay) parts.push(dateDisplay)

  let detailString = parts.join(" • ")

  if (task.status) {
    detailString += ` [Status: ${getStatusLabel(task.status)}]`
  }
  if (task.link) {
    detailString += ` [Link: ${task.link}]`
  }
  if (task.completed && task.completedAt) {
    detailString += ` [Completed: ${getTimeAgo(new Date(task.completedAt))}]`
  }
  return `- ${detailString}\n`
}

function formatRecurringTaskDetails(task: RecurringTaskSupabase): string {
  const parts = [task.title]
  if (task.description) parts.push(task.description)

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
    return date.toLocaleDateString()
  }

  let dateDisplay = formatDate(task.duedate)

  if (task.recurrencepattern) {
    const pattern =
      task.recurrencepattern.charAt(0).toUpperCase() +
      task.recurrencepattern.slice(1).toLowerCase()
    if (dateDisplay) {
      dateDisplay += `, ${pattern}`
    } else {
      dateDisplay = pattern
    }
  }
  if (dateDisplay) parts.push(dateDisplay)

  let detailString = parts.join(" • ")

  if (task.status) {
    detailString += ` [Status: ${getStatusLabel(task.status)}]`
  }
  // Recurring tasks don't have a direct 'link' or 'completedAt' in the same way singular tasks do in this context.
  // They generate instances which are then completed.
  return `- ${detailString}\n`
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

// Clear cache for a specific user (call this when tasks are updated)
export function clearTaskContextCache(userId: string): void {
  taskContextCache.delete(userId)
}

// Clear all cache (call this periodically or on server restart)
export function clearAllTaskContextCache(): void {
  taskContextCache.clear()
}
