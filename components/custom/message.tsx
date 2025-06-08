'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { PencilIcon, Copy, Check, X } from 'lucide-react';
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
  if (!text || !highlight) return text;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
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
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyCheck, setShowCopyCheck] = useState(false);
  const [editedAttachments, setEditedAttachments] = useState<Array<Attachment>>(attachments || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedAttachments(attachments || []);
  }, [attachments]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(24, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing]);

  const handleEdit = () => {
    const textToEdit = typeof content === 'string' ? content : getTextContent();
    setEditedContent(textToEdit);
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
    const textToCopy = typeof content === 'string' ? content : getTextContent();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setShowCopyCheck(true);
      setTimeout(() => setShowCopyCheck(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setEditedAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Separate text content from images
  const getTextContent = () => {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }
    // Handle ReactNode content by converting to string if possible
    if (content && typeof content === 'object' && 'props' in content) {
      // Try to extract text from React elements
      const extractTextFromReactNode = (node: any): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return node.toString();
        if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
        if (node && typeof node === 'object' && node.props) {
          if (node.props.children) {
            return extractTextFromReactNode(node.props.children);
          }
        }
        return '';
      };
      return extractTextFromReactNode(content);
    }
    return String(content || '');
  };

  const getImageContent = () => {
    if (Array.isArray(content)) {
      return content.filter((part: any) => part.type === 'image_url');
    }
    return [];
  };

  const textContent = getTextContent();
  const imageContent = getImageContent();
  const hasImages = (attachments && attachments.length > 0) || imageContent.length > 0;

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
        "group-data-[role=user]/message:py-3.5 group-data-[role=user]/message:px-5 group-data-[role=user]/message:rounded-lg",
        role === 'user' 
          ? isIncognito
            ? 'group-data-[role=user]/message:bg-purple-100 dark:group-data-[role=user]/message:bg-purple-900/40'
            : 'group-data-[role=user]/message:bg-task-light dark:group-data-[role=user]/message:bg-task-dark'
          : ''
      )}>
        <div className="flex flex-col gap-2 w-full min-w-0">
          {/* Text Content */}
          {textContent && (
            <div className="flex flex-col gap-2 w-full min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className={cn(
                      "min-h-[24px] w-full border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs leading-relaxed overflow-hidden",
                      isIncognito 
                        ? 'bg-purple-100 dark:bg-purple-900/40' 
                        : 'bg-task-light dark:bg-task-dark'
                    )}
                    disabled={isLoading}
                    onInput={adjustTextareaHeight}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="h-6 px-2 text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground font-montserrat"
                      style={{ fontSize: '11px' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading}
                      className="h-6 px-2 text-foreground transition-colors bg-transparent hover:bg-transparent hover:text-foreground font-montserrat"
                      style={{ fontSize: '11px' }}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0">
                  <Markdown className="font-chat">
                    {highlight ? highlightText(textContent, highlight) : textContent}
                  </Markdown>
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
        </div>
      </div>

      {/* Images Section - Separate from text */}
      {hasImages && (
        <div className="mt-3 max-w-3xl flex justify-end">
          <div className="flex flex-wrap gap-3">
            {/* Content images */}
            {imageContent.map((part: any, index: number) => {
              const url = typeof part.image_url === 'string' ? part.image_url : part.image_url.url;
              return (
                <div key={index} className="relative group">
                  <div className="size-16 bg-muted rounded-lg relative flex items-center justify-center cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Image content"
                      className="rounded-lg size-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 size-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full p-0"
                      onClick={() => {
                        // Handle removal of content images if needed
                        toast.info('Content image removal not implemented');
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                </div>
              );
            })}
            
            {/* Attachment images */}
            {(isEditing ? editedAttachments : attachments)?.map((attachment, index) => (
              <div key={attachment.url} className="relative group">
                <PreviewAttachment
                  attachment={attachment}
                  onRemove={isEditing ? () => handleRemoveAttachment(index) : undefined}
                />
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-1 -right-1 size-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full p-0"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons below images */}
      {!isEditing && (textContent || hasImages) && role === 'user' && (
        <div className="flex gap-1 mt-px opacity-0 group-hover/message:opacity-100 transition-opacity justify-end max-w-3xl">
          {onEdit && id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="size-8 hover:bg-transparent"
            >
              <PencilIcon className="size-3 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
          {textContent && (
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
          )}
        </div>
      )}
    </motion.div>
  );
};
