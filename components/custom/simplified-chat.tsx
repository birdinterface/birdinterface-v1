'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { History, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState } from 'react';
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
}

export function SimplifiedChat({
  id,
  initialMessages,
  selectedModelName,
  api = '/api/chat',
  user,
  hideHeader = false,
}: SimplifiedChatProps) {
  const { theme } = useTheme();
  const { openModal } = useModal();
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
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const handleMessageEdit = async (messageId: string, newContent: string): Promise<boolean> => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      toast.error('Message not found');
      return false;
    }

    // Create a new array with messages up to (but not including) the edited message
    const updatedMessages = messages.slice(0, messageIndex).map(message => message);

    // Update the messages state immediately
    setMessages(updatedMessages);

    // Create a new prompt with the edited message
    try {
      // This will add the edited message as a new message
      append({
        role: 'user',
        content: newContent,
      });
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
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <Image 
                  src="/images/blur.png" 
                  alt="Birdinterface Logo" 
                  width={200} 
                  height={200} 
                  className="size-[200px] opacity-60" 
                  style={{ filter: 'blur(25px)' }} 
                  draggable={false} 
                />
              </div>
            </div>
          )}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              id={message.id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
              onEdit={handleMessageEdit}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Input Area */}
        <div className="p-4">
          <MultimodalInput
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
          />
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