"use client"

import { Search, TrashIcon } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { type User } from "next-auth"
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Message as PreviewMessage } from "@/components/custom/message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, fetcher } from "@/lib/utils"

const EMPTY_MESSAGES: any[] = []

// Define the expected shape of a processed chat object from the API
interface ProcessedChat {
  id: string
  title: string
  updatedat: string
  messages?: any[]
  messages_json?: string
}

// Helper function to parse messages from a chat object
function getMessagesFromChat(chat: ProcessedChat): any[] {
  if (chat.messages_json) {
    try {
      const messages = JSON.parse(chat.messages_json)
      return Array.isArray(messages) ? messages : []
    } catch (e) {
      console.error("Failed to parse messages_json for chat:", chat.id)
      return []
    }
  }
  if (Array.isArray(chat.messages)) {
    return chat.messages
  }
  if (typeof chat.messages === "string") {
    try {
      const messages = JSON.parse(chat.messages)
      return Array.isArray(messages) ? messages : []
    } catch (e) {
      console.error("Failed to parse messages for chat:", chat.id)
      return []
    }
  }
  return []
}

// Cache for search results to avoid recomputing
const searchCache = new Map<
  string,
  { result: any; timestamp: number; sourceData: GroupedHistory }
>()
const CACHE_DURATION = 30000 // 30 seconds

// Helper function to extract text content from various message content formats
function extractTextFromMessageContent(content: any): string {
  if (!content) return ""

  if (typeof content === "string") {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part.trim()
        }
        if (part && typeof part === "object") {
          // Handle text content parts
          if (part.type === "text" && part.text) {
            return part.text.trim()
          }
          // Handle other text fields
          if (part.text) {
            return part.text.trim()
          }
          // Handle content field
          if (part.content) {
            return extractTextFromMessageContent(part.content)
          }
        }
        return ""
      })
      .filter((text) => text.length > 0)
      .join(" ")
  }

  if (content && typeof content === "object") {
    // Handle object with text field
    if (content.text) {
      return content.text.trim()
    }
    // Handle nested content
    if (content.content) {
      return extractTextFromMessageContent(content.content)
    }
  }

  return ""
}

// Optimized search function with caching
function performSearch(
  query: string,
  historyData: GroupedHistory
): { "Search Results": ProcessedChat[] } | {} {
  if (!query) return {}

  const cacheKey = query
  const cached = searchCache.get(cacheKey)
  const now = Date.now()

  // Return cached result if still valid and data source is the same
  if (
    cached &&
    now - cached.timestamp < CACHE_DURATION &&
    cached.sourceData === historyData
  ) {
    return cached.result
  }

  try {
    const allChats = Object.values(historyData).flat()
    // Escape special regex characters
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

    // Create regex patterns for different types of matches
    const exactRegex = new RegExp(`\\b${escapedQuery}\\b`, "gi")
    const partialRegex = new RegExp(escapedQuery, "gi")

    const chatsWithScore = allChats
      .map((chat) => {
        const messages = getMessagesFromChat(chat)
        let score = 0

        // Search in title with higher weight
        const titleText = chat.title.toLowerCase()
        const titleExactMatches = titleText.match(exactRegex)
        const titlePartialMatches = titleText.match(partialRegex)

        if (titleExactMatches) {
          score += titleExactMatches.length * 3 // Highest priority for exact title matches
        } else if (titlePartialMatches) {
          score += titlePartialMatches.length * 2 // Medium priority for partial title matches
        }

        // Search in message content
        if (messages && Array.isArray(messages)) {
          messages.forEach((message) => {
            const messageText = extractTextFromMessageContent(message.content)

            if (messageText) {
              const messageTextLower = messageText.toLowerCase()
              const exactMatches = messageTextLower.match(exactRegex)
              const partialMatches = messageTextLower.match(partialRegex)

              if (exactMatches) {
                score += exactMatches.length * 2 // Higher score for exact word matches
              } else if (partialMatches) {
                score += partialMatches.length // Lower score for partial matches
              }
            }
          })
        }

        return { ...chat, messages, score }
      })
      .filter((chat) => chat.score > 0)
      .sort((a, b) => b.score - a.score)

    const result =
      chatsWithScore.length > 0 ? { "Search Results": chatsWithScore } : {}

    // Cache the result
    searchCache.set(cacheKey, {
      result,
      timestamp: now,
      sourceData: historyData,
    })

    return result
  } catch (error) {
    console.error("Error during search:", error)
    return {}
  }
}

// Define the expected shape of the grouped history from the API
type GroupedHistory = Record<string, ProcessedChat[]>

interface ChatHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}

export function ChatHistoryModal({
  open,
  onOpenChange,
  user,
}: ChatHistoryModalProps) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const currentChatId = params?.id as string | undefined
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
  const [hoveredChatMessages, setHoveredChatMessages] =
    useState<any[]>(EMPTY_MESSAGES)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Use React's useDeferredValue for better performance during rapid typing
  const deferredSearchQuery = useDeferredValue(searchQuery.toLowerCase().trim())

  const [isPending, startTransition] = useTransition()

  const {
    data: groupedHistoryData,
    isLoading,
    mutate,
  } = useSWR<GroupedHistory>(
    user ? "/intelligence/api/history" : null,
    fetcher,
    {
      fallbackData: {},
    }
  )

  const [searchResults, setSearchResults] = useState<GroupedHistory | null>(
    null
  )

  useEffect(() => {
    if (open) {
      mutate()
      // Focus the search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open, pathname, mutate])

  // Optimized search with immediate optimistic updates
  useEffect(() => {
    if (deferredSearchQuery) {
      startTransition(() => {
        const results = performSearch(
          deferredSearchQuery,
          groupedHistoryData || {}
        )
        setSearchResults(results as GroupedHistory)
      })
    } else {
      setSearchResults(null)
    }
  }, [deferredSearchQuery, groupedHistoryData])

  // Reset hover state when search results change
  useEffect(() => {
    if (
      deferredSearchQuery &&
      searchResults &&
      Object.keys(searchResults).length > 0
    ) {
      // Reset hover state so we show the first search result
      setHoveredChatId(null)
      setHoveredChatMessages(EMPTY_MESSAGES)
    } else if (!deferredSearchQuery) {
      // Also reset when clearing search to prevent showing stale preview
      setHoveredChatId(null)
      setHoveredChatMessages(EMPTY_MESSAGES)
    }
  }, [deferredSearchQuery, searchResults])

  // Handle search input with optimistic updates
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  // Use optimistic results when pending, otherwise use computed results
  const displayResults = searchResults || groupedHistoryData || {}

  // Set chat details for preview when hovering
  const handleChatHover = useCallback(
    (chat: ProcessedChat) => {
      if (hoveredChatId === chat.id) return
      setHoveredChatId(chat.id)
      const messages = getMessagesFromChat(chat)
      setHoveredChatMessages(messages)
    },
    [hoveredChatId]
  )

  const handleDelete = async (chatId: string) => {
    if (deletingId === chatId) {
      // This is the confirmation click
      try {
        await fetch(`/intelligence/api/chat?id=${chatId}`, {
          method: "DELETE",
        }).then((res) => {
          if (!res.ok) throw new Error("Failed to delete")
        })

        const newGroupedHistory = await mutate((currentData) => {
          if (!currentData) return {}
          const newData: GroupedHistory = {}
          for (const period in currentData) {
            const filteredChats = currentData[period].filter(
              (h) => h.id !== chatId
            )
            if (filteredChats.length > 0) {
              newData[period] = filteredChats
            }
          }
          return newData
        }, false)

        if (searchQuery.trim()) {
          const results = performSearch(
            searchQuery.toLowerCase().trim(),
            newGroupedHistory || {}
          )
          setSearchResults(results as GroupedHistory)
        }

        if (chatId === currentChatId) {
          router.push("/intelligence")
          onOpenChange(false)
        }
      } catch (error) {
        toast.error("Failed to delete chat")
      } finally {
        setDeletingId(null)
      }
    } else {
      // First click, set for confirmation
      setDeletingId(chatId)
    }
  }

  const renderChatItem = (chat: ProcessedChat) => (
    <div
      key={chat.id}
      className={cn(
        "group flex items-center justify-between p-2 rounded-md transition-all duration-200 cursor-pointer hover:bg-task-hover"
      )}
      onMouseEnter={() => handleChatHover(chat)}
    >
      <Link
        href={`/intelligence/chat/${chat.id}`}
        onClick={() => onOpenChange(false)}
        className={cn(
          "flex-1 min-w-0 text-muted-foreground group-hover:text-muted-foreground font-chat text-[9px] tracking-wider",
          chat.id === currentChatId &&
            "text-foreground group-hover:text-foreground"
        )}
      >
        <div className="font-chat text-[11px] tracking-wider truncate">
          {chat.title}
        </div>
        <div className="font-chat text-[9px] tracking-wider">
          {new Date(chat.updatedat).toLocaleDateString()}
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent",
          deletingId !== chat.id &&
            "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleDelete(chat.id)}
        onMouseLeave={() => {
          setDeletingId(null) // Reset confirmation on mouse leave
        }}
      >
        {deletingId === chat.id ? (
          <TrashIcon size={14} className="text-destructive" />
        ) : (
          <TrashIcon size={14} />
        )}
      </Button>
    </div>
  )

  const renderChatPreview = () => {
    let previewChatId = hoveredChatId
    let previewMessages = hoveredChatMessages

    // If no chat is hovered but we have search results, show the first result
    if (
      !hoveredChatId &&
      deferredSearchQuery &&
      Object.keys(displayResults).length > 0
    ) {
      const firstGroup = Object.values(displayResults)[0] as ProcessedChat[]
      if (firstGroup && firstGroup.length > 0) {
        const firstChat = firstGroup[0]
        previewChatId = firstChat.id
        previewMessages = getMessagesFromChat(firstChat)
      }
    }

    if (!previewChatId || previewMessages.length === 0) {
      return null
    }

    return (
      <div className="space-y-3">
        <div className="h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
          <div className="space-y-2">
            {previewMessages.map((message) => (
              <PreviewMessage
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                attachments={
                  message.experimental_attachments || message.attachments
                }
                toolInvocations={undefined}
                isPreview={true}
                highlight={deferredSearchQuery}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-6 p-6 mx-4 md:mx-auto bg-background rounded-lg border border-border shadow-[0_0_30px_rgba(255,255,255,0.15)]">
        <div className="flex flex-col h-[500px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search log"
              className="pl-10 w-full text-xs rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                Loading...
              </div>
            ) : Object.keys(displayResults).length > 0 ? (
              Object.entries(displayResults).map(([period, chats]) => (
                <div key={period} className="mb-4">
                  <h3
                    className="text-[9px] font-[700] tracking-widest text-foreground mb-2 px-2"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {period}{" "}
                    {period === "Search Results" &&
                      `(${(chats as ProcessedChat[]).length})`}
                  </h3>
                  <div className="">
                    {(chats as ProcessedChat[]).map(renderChatItem)}
                  </div>
                </div>
              ))
            ) : deferredSearchQuery ? null : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm"></div>
              </div>
            )}
          </div>
        </div>
        <div
          className="hidden md:block bg-border h-[500px]"
          style={{ zIndex: -1 }}
        ></div>
        <div className="hidden md:block h-[500px] p-4">
          {renderChatPreview()}
        </div>
      </div>
    </div>
  )
}
