'use client';

import { Message } from 'ai';
import { MessageSquare, History, Plus, Ghost } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
      <div className="w-full flex items-start justify-center py-4">
        <div className="w-full max-w-2xl px-4 bg-task-light dark:bg-task-dark rounded-none mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistoryModal(true);
                  }}
                  className="p-1 hover:bg-transparent rounded-md cursor-pointer transition-colors"
                >
                  <History className="size-4 text-muted-foreground hover:text-black dark:hover:text-white transition-colors" />
                </div>
                <Link
                  href="/intelligence"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-transparent rounded-md block transition-colors"
                >
                  <Plus className="size-4 text-muted-foreground hover:text-black dark:hover:text-white transition-colors" />
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {shouldShowIncognitoToggle && (
                  <button
                    onClick={handleIncognitoToggle}
                    className={`p-1 hover:bg-transparent rounded-md transition-colors ${
                      isIncognito ? 'text-purple-500 hover:text-purple-600' : 'text-muted-foreground hover:text-black dark:hover:text-white'
                    }`}
                    title={isIncognito ? 'Exit incognito mode' : 'Incognito mode'}
                  >
                    <Ghost className="size-4" />
                  </button>
                )}
                <span className="text-xs text-muted-foreground task-tab">{selectedModelName}</span>
              </div>
            </div>
          </div>
          
          <div className="pb-4">
            <div className="bg-task-light dark:bg-task-dark rounded-none overflow-hidden">
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