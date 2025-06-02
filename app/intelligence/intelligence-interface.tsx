'use client';

import { Message } from 'ai';
import { ChevronDown, ChevronUp, MessageSquare, History, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <>
      <div className="w-full flex items-start justify-center py-4">
        <div className="w-full max-w-2xl px-4 bg-task-light dark:bg-task-dark rounded-lg mb-4">
          <div className="p-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-between w-full text-left"
            >
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
                <span className="text-xs text-muted-foreground task-tab">[{selectedModelName}]</span>
                {isCollapsed ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="size-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="pb-4 px-4">
              <div className="bg-task-light dark:bg-task-dark rounded-lg overflow-hidden">
                <SimplifiedChat
                  key={id}
                  id={id}
                  initialMessages={initialMessages}
                  selectedModelName={selectedModelName}
                  api="/intelligence/api/chat"
                  user={user}
                  hideHeader={true}
                />
              </div>
            </div>
          )}
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