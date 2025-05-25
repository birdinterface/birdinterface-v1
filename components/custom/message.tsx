'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { PencilIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
  onEdit,
  id,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  onEdit?: (messageId: string, newContent: string) => Promise<boolean>;
  id?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content as string);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!onEdit || !id) {
      toast.error('Cannot edit message');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await onEdit(id, editedContent);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div className={cn(
        "flex gap-4 w-full relative",
        isEditing 
          ? "group-data-[role=user]/message:w-full group-data-[role=user]/message:max-w-3xl" 
          : "group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
        "group-data-[role=user]/message:py-3.5 group-data-[role=user]/message:px-5 group-data-[role=user]/message:bg-muted rounded-xl"
      )}>
        {role === 'assistant' && (
          <img
            src="/images/blur.png"
            alt="Assistant Icon"
            className="size-8 flex items-center rounded-full justify-center shrink-0"
            style={{ filter: 'blur(4.5px)' }}
            draggable={false}
          />
        )}
        
        {role === 'user' && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-col gap-2 w-full min-w-0">
          {content && (
            <div className="flex flex-col gap-4 w-full min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[100px] w-full"
                    disabled={isLoading}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0">
                  <Markdown>{content as string}</Markdown>
                </div>
              )}
            </div>
          )}

          {toolInvocations && toolInvocations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : null}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId} className="skeleton">
                      {toolName === 'getWeather' ? <Weather /> : null}
                    </div>
                  );
                }
              })}
            </div>
          ) : null}

          {attachments && (
            <div className="flex flex-row gap-2">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
