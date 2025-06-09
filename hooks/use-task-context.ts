import { clearTaskContextCache } from "@/lib/task-context"
import { useCallback } from "react"

export function useTaskContext() {
  const invalidateTaskContext = useCallback((userId: string) => {
    clearTaskContextCache(userId)
  }, [])

  const invalidateAllTaskContexts = useCallback(() => {
    // This would be called when tasks are updated via API
    // The cache will be refreshed on next intelligence request
  }, [])

  return {
    invalidateTaskContext,
    invalidateAllTaskContexts,
  }
}
