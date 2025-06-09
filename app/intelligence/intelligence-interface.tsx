"use client"

import { Message } from "ai"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { ChatHistoryModal } from "@/components/custom/chat-history-modal"
import { IntelligenceModelSelector } from "@/components/custom/intelligence-model-selector"
import { SimplifiedChat } from "@/components/custom/simplified-chat"
import { Model } from "@/lib/model"

export function IntelligenceInterface({
  id,
  selectedModelName,
  user,
  initialMessages = [],
}: {
  id: string
  selectedModelName: Model["name"]
  user?: any
  initialMessages?: Array<Message>
}) {
  const router = useRouter()
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isIncognito, setIsIncognito] = useState(false)
  const [chatKey, setChatKey] = useState(0) // Key to force re-render of chat
  const [preservedInput, setPreservedInput] = useState("") // Store input when switching modes
  const [hasMessages, setHasMessages] = useState(initialMessages.length > 0)
  const [messagesForChat, setMessagesForChat] = useState(initialMessages)

  // On mount, check for preserved input and mode from a "New" chat navigation
  useEffect(() => {
    const savedInput = sessionStorage.getItem("preservedChatInput")
    if (savedInput) {
      setPreservedInput(savedInput)
      sessionStorage.removeItem("preservedChatInput")
    }

    const chatMode = sessionStorage.getItem("chatMode")
    if (chatMode === "normal") {
      setIsIncognito(false)
    } else if (chatMode === "private") {
      setIsIncognito(true)
      setChatKey((prev) => prev + 1)
    }

    if (chatMode) {
      sessionStorage.removeItem("chatMode")
    }
  }, [])

  const handleIncognitoToggle = useCallback(() => {
    setIsIncognito((prev) => {
      const newIncognitoState = !prev
      setHasMessages(newIncognitoState ? false : initialMessages.length > 0)
      return newIncognitoState
    })
    setChatKey((prev) => prev + 1)
  }, [initialMessages.length])

  // When user clicks "New", save the input and mode, then navigate.
  const handleNewClick = () => {
    if (preservedInput) {
      sessionStorage.setItem("preservedChatInput", preservedInput)
    }

    if (isIncognito) {
      sessionStorage.setItem("chatMode", "normal")
      setIsIncognito(false)
      setMessagesForChat([])
    }

    router.push("/intelligence")
  }

  const shouldShowIncognitoToggle = !hasMessages

  return (
    <>
      <div className="size-full flex flex-col items-center justify-start space-y-4 py-4 px-2 sm:px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-task-border flex flex-col flex-1 min-h-0 bg-normal-task">
          <div className="pt-4 px-4">
            <div className="grid grid-cols-3 items-center w-full text-left">
              <div className="flex justify-start gap-2">
                <IntelligenceModelSelector
                  selectedModelName={selectedModelName}
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleNewClick}
                  className="px-2 py-1 text-muted-foreground hover:bg-task-hover hover:text-muted-foreground text-xs font-medium normal-case transition-colors rounded-md"
                >
                  New
                </button>
                {shouldShowIncognitoToggle && (
                  <button
                    onClick={handleIncognitoToggle}
                    className={`px-2 py-1 text-xs font-medium normal-case transition-colors rounded-md ${
                      isIncognito
                        ? "bg-task-hover text-purple-500"
                        : "text-muted-foreground hover:bg-task-hover hover:text-muted-foreground"
                    }`}
                  >
                    Private
                  </button>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowHistoryModal(true)
                  }}
                  className="px-2 py-1 text-muted-foreground hover:bg-task-hover hover:text-muted-foreground text-xs font-medium normal-case transition-colors rounded-md"
                >
                  Log
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <SimplifiedChat
              key={`${id}-${chatKey}`}
              id={id}
              initialMessages={isIncognito ? [] : messagesForChat}
              selectedModelName={selectedModelName}
              api="/intelligence/api/chat"
              user={user}
              hideHeader={true}
              isIncognito={isIncognito}
              onMessagesChange={setHasMessages}
              initialInput={preservedInput}
              onInputChange={setPreservedInput}
            />
          </div>
        </div>
      </div>

      {/* Chat History Modal */}
      <ChatHistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        user={user}
      />
    </>
  )
}
