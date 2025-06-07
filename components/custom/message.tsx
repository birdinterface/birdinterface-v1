'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { PencilIcon, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const highlightText = (text: string, highlight: string): string => {
  if (!highlight.trim()) {
    return text;
  }
  const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  return text.replace(regex, '<span class="text-blue-500">$1</span>');
};

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
  onEdit,
  id,
  isIncognito = false,
  isPreview = false,
  highlight,
}: {
  role: string;
  content: ReactNode;
  toolInvocations: ToolInvocation[] | undefined;
  attachments?: Array<Attachment>;
  onEdit?: (messageId: string, newContent: string) => Promise<boolean>;
  id?: string;
  isIncognito?: boolean;
  isPreview?: boolean;
  highlight?: string;
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(
    typeof content === 'string' ? content : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyCheck, setShowCopyCheck] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Adjust height immediately when entering edit mode
      setTimeout(() => {
        adjustTextareaHeight();
        textareaRef.current?.focus();
        // Position cursor at the end of the text
        const textLength = textareaRef.current?.value.length || 0;
        textareaRef.current?.setSelectionRange(textLength, textLength);
      }, 0);
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedContent(typeof content === 'string' ? content : '');
    setIsEditing(true);
  };

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

  const handleCopy = async () => {
    if (typeof content !== 'string') {
      toast.error('Cannot copy complex message content');
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      setShowCopyCheck(true);
      setTimeout(() => setShowCopyCheck(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message mb-2"
      data-role={role}
    >
      <div className={cn(
        "flex gap-4 w-full relative",
        isEditing 
          ? "group-data-[role=user]/message:w-full group-data-[role=user]/message:max-w-3xl" 
          : "group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
        "group-data-[role=user]/message:py-3.5 group-data-[role=user]/message:px-5 rounded-xl",
        role === 'user' 
          ? isIncognito
            ? 'group-data-[role=user]/message:bg-purple-100 dark:group-data-[role=user]/message:bg-purple-900/40'
            : 'group-data-[role=user]/message:bg-chat-input'
          : ''
      )}>
        <div className="flex flex-col gap-2 w-full min-w-0">
          {content && (
            <div className="flex flex-col gap-4 w-full min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[24px] w-full bg-chat-input border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs leading-relaxed overflow-hidden"
                    disabled={isLoading}
                    onInput={adjustTextareaHeight}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="intelligence-text h-7 px-3"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading}
                      className="intelligence-text h-7 px-3"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0">
                  {typeof content === 'string' ? (
                    <Markdown className="font-chat">
                      {highlight ? highlightText(content, highlight) : content}
                    </Markdown>
                  ) : Array.isArray(content) ? (
                    content.map((part: any, index: number) => {
                      if (part.type === 'text') {
                        return (
                          <Markdown key={index} className="font-chat">
                            {highlight
                              ? highlightText(part.text, highlight)
                              : part.text}
                          </Markdown>
                        );
                      }
                      if (part.type === 'image_url') {
                        // Assuming image_url is a string path, adjust if it's an object
                        const url = typeof part.image_url === 'string' ? part.image_url : part.image_url.url;
                        return (
                          <Image
                            key={index}
                            src={url}
                            alt="Image content"
                            width={200}
                            height={200}
                            className="rounded-lg"
                          />
                        );
                      }
                      return null;
                    })
                  ) : null}
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

      {/* Action buttons outside and underneath the message */}
      {!isEditing && content && role === 'user' && typeof content === 'string' && (
        <div className="flex gap-1 mt-1 opacity-0 group-hover/message:opacity-100 transition-opacity justify-end max-w-3xl">
          {onEdit && id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="size-8 hover:bg-transparent"
            >
              <PencilIcon className="size-3 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-8 hover:bg-transparent"
          >
            {showCopyCheck ? (
              <Check className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Copy className="size-3 text-muted-foreground hover:text-foreground transition-colors rotate-90" />
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
