"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"

import { RecurringTaskList } from "@/components/custom/recurring-task-list"
import { TaskList } from "@/components/custom/task-list"
import {
  createRecurringTask as createRecurringTaskApi,
  createTask,
  deleteRecurringTask as deleteRecurringTaskApi,
  deleteTask as deleteTaskApi,
  updateRecurringTask as updateRecurringTaskApi,
  updateTask as updateTaskApi,
} from "@/lib/queries"
import { clearTaskContextCache } from "@/lib/task-context"

import type { RecurringTask } from "@/components/custom/recurring-task-list"
import type {
  Tab as TaskTab,
  Task as UiTask,
} from "@/components/custom/task-list"

// Module-level cache to prevent duplicate requests across component re-mounts
let pendingRequests: {
  tasks?: Promise<any>
  recurringTasks?: Promise<any>
  userPreferences?: Promise<any>
} = {}

// Timestamp-based cache to prevent rapid successive calls
let lastFetchTime = 0
const FETCH_COOLDOWN = 1000 // 1 second cooldown

// Helper functions for localStorage
const getFromLocalStorage = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null
  const item = window.localStorage.getItem(key)
  if (item) {
    try {
      return JSON.parse(item) as T
    } catch (error) {
      console.error("Error parsing from localStorage for key:", key, error)
      window.localStorage.removeItem(key) // Clear corrupted item
      return null
    }
  }
  return null
}

const saveToLocalStorage = <T,>(key: string, data: T): void => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage for key:", key, error)
  }
}

function toUiTask(task: any): UiTask {
  return {
    id: task.id,
    name: task.title,
    description: task.description,
    dueDate: task.duedate || "",
    completed: task.completed,
    status: task.status,
    completedAt: task.completedat || "",
    userId: task.userid,
    link: task.link || undefined,
  }
}

function toRecurringTask(task: any): RecurringTask {
  return {
    id: task.id,
    name: task.title,
    description: task.description,
    dueDate: task.duedate || "",
    completed: task.completed,
    status: task.status || "",
    completedAt: task.completedat || "",
    userId: task.userid,
    recurrencePattern: task.recurrencepattern || undefined,
  }
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<UiTask[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TaskTab>("todo")
  const [isLoading, setIsLoading] = useState(false)
  const [tabNames, setTabNames] = useState({
    todo: "ToDo",
    watch: "Watch",
    later: "Later",
    done: "Completed",
  })

  // Use session user ID, with fallback to hardcoded ID for development
  const userId = session?.user?.id || "26d545cb-63c5-461d-9fe9-8dc5256fe504"

  // Memoize cache keys to prevent unnecessary re-renders
  const TASKS_CACHE_KEY = useMemo(() => `cachedTasks_${userId}`, [userId])
  const RECURRING_TASKS_CACHE_KEY = useMemo(
    () => `cachedRecurringTasks_${userId}`,
    [userId]
  )
  const TAB_NAMES_CACHE_KEY = useMemo(
    () => `cachedTabNames_${userId}`,
    [userId]
  )

  useEffect(() => {
    // Prevent duplicate fetches
    if (isLoading || status === "loading") return

    // Load from cache first
    const cachedTasks = getFromLocalStorage<UiTask[]>(TASKS_CACHE_KEY)
    if (cachedTasks) {
      setTasks(cachedTasks)
    }

    const cachedRecurringTasks = getFromLocalStorage<RecurringTask[]>(
      RECURRING_TASKS_CACHE_KEY
    )
    if (cachedRecurringTasks) {
      setRecurringTasks(cachedRecurringTasks)
    }

    const cachedTabNames = getFromLocalStorage<any>(TAB_NAMES_CACHE_KEY)
    if (cachedTabNames) {
      setTabNames(cachedTabNames)
    }

    async function fetchData() {
      // Check if we've recently fetched data
      const now = Date.now()
      if (now - lastFetchTime < FETCH_COOLDOWN) {
        return
      }

      setIsLoading(true)
      lastFetchTime = now

      try {
        // Use cached promises if they exist to prevent duplicate requests
        if (!pendingRequests.tasks) {
          pendingRequests.tasks = fetch("/api/tasks")
        }
        if (!pendingRequests.recurringTasks) {
          pendingRequests.recurringTasks = fetch("/api/recurring-tasks")
        }
        if (!pendingRequests.userPreferences) {
          pendingRequests.userPreferences = fetch("/api/user-preferences")
        }

        // Wait for both requests to complete
        const [tasksResponse, recurringTasksResponse, prefsResponse] =
          await Promise.all([
            pendingRequests.tasks,
            pendingRequests.recurringTasks,
            pendingRequests.userPreferences,
          ])

        // Clear the pending requests cache
        pendingRequests.tasks = undefined
        pendingRequests.recurringTasks = undefined
        pendingRequests.userPreferences = undefined

        // Handle tasks response
        if (!tasksResponse.ok) {
          const errorData = await tasksResponse.json()
          console.error("Frontend: Error fetching tasks:", errorData)
          throw new Error(
            errorData.error || `Failed to fetch tasks: ${tasksResponse.status}`
          )
        }
        const tasksData = await tasksResponse.json()
        const uiTasks = tasksData.map(toUiTask)
        setTasks(uiTasks)
        saveToLocalStorage(TASKS_CACHE_KEY, uiTasks)

        // Handle recurring tasks response
        if (!recurringTasksResponse.ok) {
          const errorData = await recurringTasksResponse.json()
          console.error("Frontend: Error fetching recurring tasks:", errorData)
          throw new Error(
            errorData.error ||
              `Failed to fetch recurring tasks: ${recurringTasksResponse.status}`
          )
        }
        const recurringTasksData = await recurringTasksResponse.json()
        const uiRecurringTasks = recurringTasksData.map(toRecurringTask)
        setRecurringTasks(uiRecurringTasks)
        saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, uiRecurringTasks)

        // Handle user preferences response
        if (prefsResponse.ok) {
          const prefs = await prefsResponse.json()
          if (prefs.tabNames) {
            setTabNames(prefs.tabNames)
            saveToLocalStorage(TAB_NAMES_CACHE_KEY, prefs.tabNames)
          }
        }

        setError(null)
      } catch (err: any) {
        console.error("Frontend: Error fetching task data:", err)
        setError(err.message)
        // Clear the pending requests cache on error
        pendingRequests.tasks = undefined
        pendingRequests.recurringTasks = undefined
        pendingRequests.userPreferences = undefined
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, status])

  // Handler to add a new task (optimistic)
  const handleAddTask = async (task: Omit<UiTask, "id">) => {
    const realUserId = task.userId || userId
    const tempId = "temp-" + Date.now()
    const optimisticTask = { ...task, id: tempId, userId: realUserId }

    // Optimistic UI update and cache update
    setTasks((prev) => {
      const newTasks = [...prev, optimisticTask]
      saveToLocalStorage(TASKS_CACHE_KEY, newTasks)
      return newTasks
    })

    try {
      const created = await createTask(realUserId, {
        title: task.name,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
      })
      clearTaskContextCache(realUserId)
      // Update task with server ID and save to cache
      setTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === tempId ? toUiTask(created) : t
        )
        saveToLocalStorage(TASKS_CACHE_KEY, newTasks)
        return newTasks
      })
    } catch (err) {
      // Revert UI and cache
      setTasks((prev) => {
        const revertedTasks = prev.filter((t) => t.id !== tempId)
        saveToLocalStorage(TASKS_CACHE_KEY, revertedTasks)
        return revertedTasks
      })
      setError("Failed to add task")
      window.alert("Failed to add task")
    }
  }

  // Handler to add a new recurring task (optimistic)
  const handleAddRecurringTask = async (task: Omit<RecurringTask, "id">) => {
    const realUserId = task.userId || userId
    const tempId = "temp-recurring-" + Date.now()
    const optimisticTask = { ...task, id: tempId, userId: realUserId }

    // Optimistic UI update and cache update
    setRecurringTasks((prev) => {
      const newRecurringTasks = [...prev, optimisticTask]
      saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, newRecurringTasks)
      return newRecurringTasks
    })

    try {
      const created = await createRecurringTaskApi(realUserId, {
        title: task.name,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status || "pending",
        recurrencepattern: task.recurrencePattern || null,
      })
      clearTaskContextCache(realUserId)
      // Update task with server ID and save to cache
      setRecurringTasks((prev) => {
        const newRecurringTasks = prev.map((t) =>
          t.id === tempId ? toRecurringTask(created) : t
        )
        saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, newRecurringTasks)
        return newRecurringTasks
      })
    } catch (err) {
      // Revert UI and cache
      setRecurringTasks((prev) => {
        const revertedRecurringTasks = prev.filter((t) => t.id !== tempId)
        saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, revertedRecurringTasks)
        return revertedRecurringTasks
      })
      setError("Failed to add recurring task")
      window.alert("Failed to add recurring task")
    }
  }

  const isValidUuid = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id)

  // Handler to change active tab with caching
  const handleTabChange = (tab: TaskTab) => {
    setActiveTab(tab)
  }

  // Handler to update a task (optimistic)
  const handleUpdateTask = async (id: string, updates: Partial<UiTask>) => {
    const prevTasks = [...tasks] // Store previous state for potential rollback

    // Optimistic UI update and cache update
    setTasks((prev) => {
      const newTasks = prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      saveToLocalStorage(TASKS_CACHE_KEY, newTasks)
      return newTasks
    })

    try {
      const realUserId =
        updates.userId || tasks.find((t) => t.id === id)?.userId || userId
      if (!isValidUuid(realUserId) || !isValidUuid(id)) {
        console.warn(
          "Frontend: Skipping backend update for invalid task/user ID or temp ID for task:",
          id
        )
        // If it's a temp ID or invalid, optimistic update is fine, no backend call.
        // Cache is already updated with optimistic state.
        return
      }
      const backendData = {
        title: updates.name,
        description: updates.description,
        dueDate: updates.dueDate,
        status: updates.status,
        completed: updates.completed,
        completedAt: updates.completedAt,
        link: updates.link,
      }
      const updated = await updateTaskApi(id, realUserId, backendData)
      clearTaskContextCache(realUserId)
      // Update task with confirmed backend data and save to cache
      setTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === id ? { ...toUiTask(updated) } : t
        ) // Use full updated object from backend
        saveToLocalStorage(TASKS_CACHE_KEY, newTasks)
        return newTasks
      })
    } catch (err) {
      console.error("Frontend: Update task error:", err)
      setTasks(prevTasks) // Revert UI
      saveToLocalStorage(TASKS_CACHE_KEY, prevTasks) // Revert cache
      setError("Failed to update task")
      window.alert("Failed to update task")
    }
  }

  // Handler to update a recurring task (optimistic)
  const handleUpdateRecurringTask = async (
    id: string,
    updates: Partial<RecurringTask>
  ) => {
    const prevRecurringTasks = [...recurringTasks] // Store previous state for potential rollback

    // Optimistic UI update and cache update
    setRecurringTasks((prev) => {
      const newRecurringTasks = prev.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
      saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, newRecurringTasks)
      return newRecurringTasks
    })

    try {
      const realUserId =
        updates.userId ||
        recurringTasks.find((t) => t.id === id)?.userId ||
        userId
      if (!isValidUuid(realUserId) || !isValidUuid(id)) {
        console.warn(
          "Frontend: Skipping backend update for invalid task/user ID or temp ID for recurring task:",
          id
        )
        return
      }
      const backendData = {
        title: updates.name,
        description: updates.description,
        dueDate: updates.dueDate,
        status: updates.status,
        completed: updates.completed,
        completedAt: updates.completedAt,
        recurrencepattern: updates.recurrencePattern || null,
      }
      const updated = await updateRecurringTaskApi(
        id,
        realUserId,
        backendData as any
      )
      clearTaskContextCache(realUserId)
      // Update task with confirmed backend data and save to cache
      setRecurringTasks((prev) => {
        const newRecurringTasks = prev.map((t) =>
          t.id === id ? { ...toRecurringTask(updated) } : t
        ) // Use full updated object
        saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, newRecurringTasks)
        return newRecurringTasks
      })
    } catch (err) {
      console.error("Frontend: Update recurring task error:", err)
      setRecurringTasks(prevRecurringTasks) // Revert UI
      saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, prevRecurringTasks) // Revert cache
      setError("Failed to update recurring task")
      window.alert("Failed to update recurring task")
    }
  }

  // Handler to delete a task (optimistic)
  const handleDeleteTask = async (id: string) => {
    const prevTasks = [...tasks] // Store previous state for potential rollback

    // Optimistic UI update and cache update
    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.filter((t) => t.id !== id)
      saveToLocalStorage(TASKS_CACHE_KEY, updatedTasks)
      return updatedTasks
    })

    try {
      const taskToDelete = prevTasks.find((t) => t.id === id)
      const realUserId = taskToDelete?.userId || userId

      // Only call backend if it's a persisted task (not a temp one)
      if (
        taskToDelete &&
        isValidUuid(taskToDelete.id) &&
        isValidUuid(realUserId)
      ) {
        await deleteTaskApi(id, realUserId)
        clearTaskContextCache(realUserId)
      } else {
        console.log(
          "Frontend: Task was temporary or IDs invalid, deleted locally only.",
          id
        )
      }
      // If successful (or local-only delete), cache is already updated.
    } catch (err) {
      setTasks(prevTasks) // Revert UI
      saveToLocalStorage(TASKS_CACHE_KEY, prevTasks) // Revert cache
      setError("Failed to delete task")
      window.alert("Failed to delete task")
    }
  }

  // Handler to delete a recurring task (optimistic)
  const handleDeleteRecurringTask = async (id: string) => {
    const prevRecurringTasks = [...recurringTasks] // Store previous state for potential rollback

    // Optimistic UI update and cache update
    setRecurringTasks((currentTasks) => {
      const updatedRecurringTasks = currentTasks.filter((t) => t.id !== id)
      saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, updatedRecurringTasks)
      return updatedRecurringTasks
    })

    try {
      const taskToDelete = prevRecurringTasks.find((t) => t.id === id)
      const realUserId = taskToDelete?.userId || userId

      if (
        taskToDelete &&
        isValidUuid(taskToDelete.id) &&
        isValidUuid(realUserId)
      ) {
        await deleteRecurringTaskApi(id, realUserId)
        clearTaskContextCache(realUserId)
      } else {
        console.log(
          "Frontend: Recurring task was temporary or IDs invalid, deleted locally only.",
          id
        )
      }
    } catch (err) {
      setRecurringTasks(prevRecurringTasks) // Revert UI
      saveToLocalStorage(RECURRING_TASKS_CACHE_KEY, prevRecurringTasks) // Revert cache
      setError("Failed to delete recurring task")
      window.alert("Failed to delete recurring task")
    }
  }

  const handleUpdateTabNames = async (newTabNames: any) => {
    // Optimistic UI update
    setTabNames(newTabNames)
    // Update local storage cache
    saveToLocalStorage(TAB_NAMES_CACHE_KEY, newTabNames)

    // Update backend
    try {
      await fetch("/api/user-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tabNames: newTabNames,
        }),
      })
    } catch (error) {
      console.error("Failed to save tab name:", error)
    }
  }

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 py-4 px-2 sm:px-4">
      <TaskList
        tasks={tasks}
        userId={userId}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabNames={tabNames}
        onTabNamesChange={handleUpdateTabNames}
      />
      {activeTab !== "done" && (
        <RecurringTaskList
          tasks={recurringTasks}
          userId={userId}
          onAddTask={handleAddRecurringTask}
          onUpdateTask={handleUpdateRecurringTask}
          onDeleteTask={handleDeleteRecurringTask}
        />
      )}
    </div>
  )
}
