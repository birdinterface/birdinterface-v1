'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { History, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { ChatHistoryModal } from '@/components/custom/chat-history-modal';
import { Message as PreviewMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { Button } from '@/components/ui/button';
import { Model } from '@/lib/model';

import { MultimodalInput } from './multimodal-input';
import { useModal } from '../context/modal-context';

interface SimplifiedChatProps {
  id: string;
  initialMessages: Array<Message>;
  selectedModelName: Model['name'];
  api?: string;
  user?: any;
  hideHeader?: boolean;
  isIncognito?: boolean;
  onMessagesChange?: (messages: Message[]) => void;
}

export function SimplifiedChat({
  id,
  initialMessages,
  selectedModelName,
  api = '/api/chat',
  user,
  hideHeader = false,
  isIncognito = false,
  onMessagesChange,
}: SimplifiedChatProps) {
  const { theme } = useTheme();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Ensure initialMessages is an array
  const validInitialMessages = Array.isArray(initialMessages) ? initialMessages : [];

  // Determine upload API based on chat API
  const uploadApi = api.includes('/intelligence/') 
    ? '/intelligence/api/files/upload' 
    : '/api/files/upload';

  const { messages, append, reload, stop, isLoading, input, setInput, handleSubmit, setMessages } =
    useChat({
      api,
      id,
      initialMessages: validInitialMessages,
      body: {
        id,
        model: selectedModelName,
        isIncognito, // Pass incognito mode to API
      },
      onError: (error) => {
        // Handle the error response
        let errorMessage = '';
        let lastMessage = '';
        try {
          // If it's a JSON string, parse it
          if (typeof error.message === 'string' && error.message.startsWith('{')) {
            const parsed = JSON.parse(error.message);
            errorMessage = parsed.error;
            lastMessage = parsed.lastMessage;
          } else {
            errorMessage = error.message;
          }
        } catch (e) {
          errorMessage = error.message;
        }

        if (errorMessage.toLowerCase().includes('usage limit')) {
          // Set the input back to the last message
          if (lastMessage) {
            setInput(lastMessage);
          }
          
          toast(
            <div className="flex items-center justify-between gap-4">
              <span>{errorMessage}</span>
              <button
                onClick={() => {
                  openModal();
                  toast.dismiss();
                }}
                className="px-4 py-1.5 rounded-md intelligence-text transition-colors whitespace-nowrap shrink-0 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Upgrade
              </button>
            </div>,
            {
              duration: 8000,
              style: {
                background: theme === 'dark' ? 'black' : 'white',
                border: theme === 'dark' ? '1px solid rgb(31,41,55)' : '1px solid rgb(229,231,235)',
                color: theme === 'dark' ? 'white' : 'black',
              }
            }
          );
        } else {
          toast.error(errorMessage);
        }
      },
      onFinish: () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      },
    });

  // Navigate to specific chat URL when the first message is sent in a new chat
  useEffect(() => {
    // Conditions for immediate navigation:
    // 1. Not in incognito mode.
    // 2. It's a brand-new chat (no initial messages).
    // 3. Currently on the main `/intelligence` page.
    // 4. The user has just sent their first message (messages array has one item).
    if (
      !isIncognito &&
      validInitialMessages.length === 0 &&
      pathname === '/intelligence' &&
      messages.length === 1 &&
      messages[0].role === 'user'
    ) {
      const chatUrl = api.includes('/intelligence/')
        ? `/intelligence/chat/${id}`
        : `/chat/${id}`;

      // Use replace to avoid a new history entry, making back-button behavior intuitive
      router.replace(chatUrl);
    }
    // We only want this to re-run when messages change, on the client-side.
    // Other dependencies are stable.
  }, [messages, isIncognito, pathname, validInitialMessages.length, id, api, router]);

  // Notify parent component about message changes in incognito mode
  useEffect(() => {
    if (isIncognito && onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, isIncognito, onMessagesChange]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const handleMessageEdit = async (messageId: string, newContent: string): Promise<boolean> => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      toast.error('Message not found');
      return false;
    }

    // Get the original message to preserve its attachments
    const originalMessage = messages[messageIndex];

    // Create a new array with messages up to (but not including) the edited message
    const updatedMessages = messages.slice(0, messageIndex);

    // Update the messages state immediately
    setMessages(updatedMessages);

    // Create a new prompt with the edited message
    try {
      // This will add the edited message as a new message
      await append(
        {
          role: 'user',
          content: newContent,
        },
        {
          experimental_attachments: originalMessage.experimental_attachments,
        }
      );
      return true;
    } catch (error) {
      toast.error('Failed to update conversation');
      return false;
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Header - conditionally rendered */}
        {!hideHeader && (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-xs text-foreground task-tab">Intelligence Chat</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="p-1 hover:bg-transparent rounded-md transition-colors"
              >
                <History className="size-4 text-muted-foreground hover:text-black dark:hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600"
        >
          {messages.map((message) => {
            // On a new chat from the main intelligence page, hide the user's first message
            // before navigation to make the transition seamless. The message will appear
            // on the new chat page.
            if (
              pathname === '/intelligence' &&
              validInitialMessages.length === 0 &&
              messages.length === 1 &&
              message.role === 'user'
            ) {
              return null;
            }

            return (
              <PreviewMessage
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
                onEdit={handleMessageEdit}
                isIncognito={isIncognito && message.role === 'user'}
              />
            );
          })}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Input Area */}
        <div className="p-4 relative">
          <MultimodalInput
            id={id}
            api={api}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
            uploadApi={uploadApi}
            isIncognito={isIncognito}
            validInitialMessages={validInitialMessages}
          />
          {isIncognito && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-normal text-muted-foreground opacity-60 normal-case pointer-events-none">
              This chat won&apos;t be saved and used to serve you better.
            </div>
          )}
        </div>
      </div>

      {/* Chat History Modal - only show if header is not hidden */}
      {!hideHeader && (
        <ChatHistoryModal
          open={showHistoryModal}
          onOpenChange={setShowHistoryModal}
          user={user}
        />
      )}
    </>
  );
} 