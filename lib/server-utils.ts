// Contains utility functions intended only for server-side execution,
// often related to database types or operations.

import { CoreMessage } from "ai"
import { format, isWithinInterval, subDays } from "date-fns"

import { Chat } from "@/lib/supabase"

import { convertToUIMessages } from "./utils" // Assuming convertToUIMessages is safe

export function getTitleFromChat(chat: Chat) {
  const messages = convertToUIMessages(chat.messages as Array<CoreMessage>)
  const firstMessage = messages[0]

  if (!firstMessage) {
    return "Untitled"
  }

  return firstMessage.content
}

export function groupChatsByDate(chats: Chat[]) {
  const now = new Date()
  const groups: { [key: string]: Chat[] } = {
    "Most Recent": [],
    "Last 7 Days": [],
    "Last 30 Days": [],
  }

  const monthGroups = new Map<string, Chat[]>()

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedat)

    // Most Recent (last 3 days)
    if (isWithinInterval(chatDate, { start: subDays(now, 3), end: now })) {
      groups["Most Recent"].push(chat)
    }
    // Last 7 Days
    else if (
      isWithinInterval(chatDate, {
        start: subDays(now, 7),
        end: subDays(now, 3),
      })
    ) {
      groups["Last 7 Days"].push(chat)
    }
    // Last 30 Days
    else if (
      isWithinInterval(chatDate, {
        start: subDays(now, 30),
        end: subDays(now, 7),
      })
    ) {
      groups["Last 30 Days"].push(chat)
    }
    // Group by Month
    else {
      const monthKey = format(chatDate, "MMMM yyyy")
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, [])
      }
      monthGroups.get(monthKey)!.push(chat)
    }
  })

  // Add month groups to the final groups object
  monthGroups.forEach((chats, month) => {
    groups[month] = chats
  })

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (Array.isArray(groups[key]) && groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
}
