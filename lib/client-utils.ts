"use client"

// Contains utility functions that rely on client-side APIs or are primarily used by client components.

export function getLocalStorage(key: string) {
  // No need to check typeof window here, as this file only runs on the client.
  return JSON.parse(localStorage.getItem(key) || "[]")
}

// Add other client-specific utilities here if needed.
