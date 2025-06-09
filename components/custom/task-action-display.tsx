"use client"

import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  Edit3,
  Plus,
  Trash2,
} from "lucide-react"

interface TaskActionDisplayProps {
  result: {
    success: boolean
    action: "create" | "update" | "delete" | "complete"
    task?: {
      title: string
      description?: string
      dueDate?: string
      status?: string
      recurrencePattern?: string
    }
    taskId?: string
    updates?: Record<string, any>
    message: string
  }
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "done":
      return <CheckCircle className="size-4 text-green-600" />
    case "watch":
      return <Clock className="size-4 text-blue-600" />
    case "later":
      return <AlertTriangle className="size-4 text-orange-600" />
    case "todo":
    default:
      return <Circle className="size-4 text-gray-400" />
  }
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "create":
      return <Plus className="size-4 text-green-600" />
    case "update":
      return <Edit3 className="size-4 text-blue-600" />
    case "delete":
      return <Trash2 className="size-4 text-red-600" />
    case "complete":
      return <CheckCircle className="size-4 text-green-600" />
    default:
      return <Circle className="size-4 text-gray-400" />
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export function TaskActionDisplay({ result }: TaskActionDisplayProps) {
  const { success, action, task, taskId, updates, message } = result

  if (!success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4 max-w-md">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="size-4" />
          <span className="font-medium text-sm">Task Action Failed</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{message}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-task-border bg-task-light dark:bg-task-dark p-4 max-w-md">
      <div className="flex items-center gap-2 mb-3">
        {getActionIcon(action)}
        <span className="font-medium text-sm capitalize">
          {action === "create"
            ? "Task Created"
            : action === "update"
              ? "Task Updated"
              : action === "delete"
                ? "Task Deleted"
                : action === "complete"
                  ? "Task Completed"
                  : "Task Action"}
        </span>
      </div>

      {/* Task name display */}
      {task?.title && (
        <div className="text-xs text-muted-foreground mb-3">
          {task.title}
          {task.recurrencePattern && <span> • {task.recurrencePattern}</span>}
          {!task.recurrencePattern && task.dueDate && (
            <span> • {formatDate(task.dueDate)}</span>
          )}
        </div>
      )}

      {/* Task details for create action */}
      {action === "create" && task && (
        <div className="space-y-2">
          {task.description && (
            <p className="text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
      )}

      {/* Complete confirmation */}
      {action === "complete" && taskId && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="size-3" />
          <span>Marked as completed</span>
        </div>
      )}
    </div>
  )
}
