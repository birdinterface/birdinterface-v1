'use client';

import Link from "next/link";
import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      
      if (!inline) {
        return (
          <div className="relative group w-full">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 dark:bg-muted border-t border-x rounded-t-lg">
              {language && (
                <span className="text-sm text-muted-foreground">
                  {language}
                </span>
              )}
              <CopyButton content={String(children).replace(/\n$/, "")} />
            </div>
            <div className="max-w-[calc(100vw-4rem)] md:max-w-full">
              <pre className={cn(
                "mb-4 rounded-b-lg border-b border-x bg-muted px-4 py-4",
                "dark:bg-muted/50",
                "overflow-x-auto",
                "[&_*]:!text-[14px]",
                "[&_*]:!leading-5",
                className
              )}>
                <code className={cn(
                  "!text-[14px]",
                  "!leading-5",
                  className
                )} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          </div>
        );
      }
      
      return (
        <code className={cn("rounded-md border px-1.5 py-0.5", className)} {...props}>
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }: any) => {
      return (
        <Link
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },
    p: ({ node, children, ...props }: any) => {
      if (React.Children.toArray(children).every(child => 
        typeof child === 'string' && child.trim() === ''
      )) {
        return <br />;
      }
      
      return (
        <p 
          className="whitespace-pre-wrap mb-2 [&:last-child]:mb-0" 
          {...props}
        >
          {children}
        </p>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="p-2 rounded-md hover:bg-background/100 transition-colors"
      onClick={handleCopy}
    >
      {copied ? (
        <svg 
          viewBox="0 0 24 24"
          className="size-4 text-green-500"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
