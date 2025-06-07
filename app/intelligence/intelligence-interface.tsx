'use client';

import { Message } from 'ai';
import { Ghost, History, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ChatHistoryModal } from '@/components/custom/chat-history-modal';
import { SimplifiedChat } from '@/components/custom/simplified-chat';
import { Button } from '@/components/ui/button';
import { Model } from '@/lib/model';

export function IntelligenceInterface({
  id,
  selectedModelName,
  user,
  initialMessages = [],
}: {
  id: string;
  selectedModelName: Model['name'];
  user?: any;
  initialMessages?: Array<Message>;
}) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [chatKey, setChatKey] = useState(0); // Key to force re-render of chat

  // Hide incognito toggle once messages exist and we're in incognito mode
  const [hasMessages, setHasMessages] = useState(initialMessages.length > 0);

  const handleIncognitoToggle = () => {
    const newIncognitoState = !isIncognito;
    setIsIncognito(newIncognitoState);
    
    // If switching to incognito, clear the chat by forcing a re-render
    if (newIncognitoState) {
      setChatKey(prev => prev + 1);
      setHasMessages(false);
    }
  };

  // Update hasMessages when we receive new messages in incognito mode
  const handleMessagesChange = (messages: Message[]) => {
    if (isIncognito) {
      setHasMessages(messages.length > 0);
    }
  };

  const shouldShowIncognitoToggle = initialMessages.length === 0 && (!isIncognito || !hasMessages);

  return (
    <>
      <div className="flex size-full max-w-2xl mx-auto flex-col pt-4">
        <div className="px-4">
          <div className="border-b-2 border-foreground/100"></div>
          <div className="pt-1 pb-4">
            <div className="flex items-center justify-between w-full text-left">
              <div className="flex-1 flex justify-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistoryModal(true);
                  }}
                  className="px-2 sm:px-3 py-1 w-16 sm:w-24 bg-black dark:bg-white text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black !text-[8px] task-tab rounded-none transition-colors"
                >
                  LOG
                </button>
              </div>

              <div className="flex items-center justify-center gap-1">
                <Link
                  href="/intelligence"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 sm:px-3 py-1 w-16 sm:w-24 bg-black dark:bg-white text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black !text-[8px] task-tab rounded-none transition-colors block text-center"
                >
                  NEW
                </Link>
                {shouldShowIncognitoToggle && (
                  <button
                    onClick={handleIncognitoToggle}
                    className={`px-2 sm:px-3 py-1 w-16 sm:w-24 !text-[8px] task-tab rounded-none transition-colors text-center ${
                      isIncognito 
                        ? 'bg-purple-500 text-white hover:text-white' 
                        : 'bg-black dark:bg-white text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black'
                    }`}
                  >
                    PRIVATE
                  </button>
                )}
              </div>

              <div className="flex-1 flex justify-end">
                <div className="px-2 sm:px-3 py-1 w-16 sm:w-24 bg-black dark:bg-white text-white/60 dark:text-black/60 !text-[8px] task-tab rounded-none text-center">
                  {selectedModelName}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grow overflow-hidden">
          <SimplifiedChat
            key={`${id}-${chatKey}`} // Force re-render when toggling incognito
            id={id}
            initialMessages={isIncognito && chatKey > 0 ? [] : initialMessages}
            selectedModelName={selectedModelName}
            api="/intelligence/api/chat"
            user={user}
            hideHeader={true}
            isIncognito={isIncognito}
            onMessagesChange={handleMessagesChange}
          />
        </div>
      </div>

      {/* Chat History Modal */}
      <ChatHistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        user={user}
      />
    </>
  );
} 