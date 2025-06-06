'use client';

import { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai';
import { motion } from 'framer-motion';
import { Plus, File, Paperclip, SendHorizontal, XIcon } from 'lucide-react';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { ArrowUpIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import useWindowSize from './use-window-size';

export function MultimodalInput({
  id,
  api,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
  uploadApi = '/api/files/upload',
  isIncognito = false,
  validInitialMessages,
}: {
  id: string;
  api: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  uploadApi?: string;
  isIncognito?: boolean;
  validInitialMessages: Array<Message>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleInput = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  }, [setInput, adjustHeight]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(async () => {
    const isNewChat =
      !isIncognito &&
      validInitialMessages.length === 0 &&
      messages.length === 0;

    if (isNewChat) {
      // Initialize chat before submitting the first message
      const initApi = api.includes('/intelligence/')
        ? '/intelligence/api/chat/initialize'
        : '/api/chat/initialize';

      try {
        const res = await fetch(initApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          throw new Error('Initialization failed');
        }
      } catch (error) {
        console.error('Failed to initialize chat', error);
        toast.error('Could not start a new chat. Please try again.');
        return; // Stop submission if initialization fails
      }
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    width,
    api,
    id,
    isIncognito,
    messages.length,
    validInitialMessages.length,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(uploadApi, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, name, contentType } = data;

        return {
          url,
          name: name || file.name,
          contentType: contentType || file.type,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  }, [uploadApi]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  return (
    <div className="relative w-full flex flex-col gap-4 max-w-full overflow-x-hidden">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="What's on your mind?"
        value={input}
        onChange={handleInput}
        className={cn(
          "min-h-[24px] overflow-hidden resize-none rounded-xl p-4 pb-12 focus-visible:ring-0 focus-visible:ring-offset-0 intelligence-input border-none font-chat",
          isIncognito
            ? "bg-purple-100 dark:bg-purple-900/40"
            : "bg-chat-input"
        )}
        rows={1}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <Button
        variant="ghost"
        className="p-1.5 h-fit absolute bottom-2 left-2 m-0.5 hover:bg-transparent"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Add attachment"
      >
        <Paperclip size={16} className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors -rotate-45" />
      </Button>

      {isLoading ? (
        <Button
          variant="ghost"
          className="p-1.5 h-fit absolute bottom-2 right-2 m-0.5 hover:bg-transparent"
          onClick={(event) => {
            event.preventDefault();
            stop();
          }}
        >
          <StopIcon size={14} className="text-black dark:text-white" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="p-1.5 h-fit absolute bottom-2 right-2 m-0.5 hover:bg-transparent"
          onClick={(event) => {
            event.preventDefault();
            submitForm();
          }}
          disabled={input.length === 0 || uploadQueue.length > 0}
        >
          <ArrowUpIcon 
            size={14} 
            className={input.length > 0 ? "text-black dark:text-white" : "text-muted-foreground"} 
          />
        </Button>
      )}
    </div>
  );
}
