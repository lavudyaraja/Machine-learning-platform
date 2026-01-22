"use client";

import React, { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

interface AIResponseProps {
  response: string;
  maxHeight?: string;
  className?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
}

// Code block component with copy functionality
const CodeBlock = memo(({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code 
        className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-xs font-mono" 
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-2">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-blue-700 dark:text-blue-300" />
        )}
      </button>
      <pre className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-md overflow-x-auto">
        <code 
          className={`text-xs font-mono text-blue-900 dark:text-blue-100 ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      </pre>
      {match && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-semibold text-blue-700 dark:text-blue-300">
          {match[1]}
        </div>
      )}
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default function AIResponse({ 
  response, 
  maxHeight = "300px",
  className = "",
  showCopyButton = true,
  onCopy
}: AIResponseProps) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm">
        No response available
      </div>
    );
  }

  // Enhanced preprocessing
  const processedResponse = response
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&lt;br\s*\/?&gt;/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`relative p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden ${className}`}
      role="article"
      aria-label="AI Response"
    >
      {showCopyButton && (
        <button
          onClick={handleCopyAll}
          className="absolute top-2 right-2 p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors z-10"
          aria-label="Copy entire response"
          title="Copy entire response"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>
      )}

      <div 
        className="overflow-y-auto pr-12" 
        style={{ maxHeight }}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              
              pre: ({ children, ...props }: any) => {
                // Ensure pre is not nested in p
                return (
                  <div className="my-2">
                    <pre className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-md overflow-x-auto" {...props}>
                      {children}
                    </pre>
                  </div>
                );
              },
              
              p: ({ children, ...props }: any) => {
                // Check if children contain only text/inline elements
                const childrenArray = React.Children.toArray(children);
                const hasOnlyInlineContent = childrenArray.every((child: any) => {
                  if (typeof child === 'string' || typeof child === 'number') {
                    return true; // Text nodes are fine
                  }
                  if (typeof child === 'object' && child !== null) {
                    const type = child.type;
                    if (typeof type === 'string') {
                      // Inline elements allowed in p
                      return ['span', 'strong', 'em', 'code', 'a', 'br'].includes(type);
                    }
                    // React components - check if they render inline content
                    return true; // Assume safe for now
                  }
                  return false;
                });

                // If it contains block elements, render as div instead of p
                if (!hasOnlyInlineContent) {
                  return (
                    <div className="mb-2 text-blue-900 dark:text-blue-100 leading-relaxed text-sm">
                      {children}
                    </div>
                  );
                }

                return (
                  <p className="mb-2 text-blue-900 dark:text-blue-100 leading-relaxed text-sm" {...props}>
                    {children}
                  </p>
                );
              },
              
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mb-2 mt-4 text-blue-900 dark:text-blue-100 first:mt-0">
                  {children}
                </h1>
              ),
              
              h2: ({ children }) => (
                <h2 className="text-base font-semibold mb-2 mt-3 text-blue-900 dark:text-blue-100 first:mt-0">
                  {children}
                </h2>
              ),
              
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold mb-1 mt-2 text-blue-900 dark:text-blue-100 first:mt-0">
                  {children}
                </h3>
              ),
              
              ul: ({ children }) => (
                <ul className="list-disc list-outside mb-2 ml-4 space-y-1 text-blue-900 dark:text-blue-100 text-sm">
                  {children}
                </ul>
              ),
              
              ol: ({ children }) => (
                <ol className="list-decimal list-outside mb-2 ml-4 space-y-1 text-blue-900 dark:text-blue-100 text-sm">
                  {children}
                </ol>
              ),
              
              li: ({ children }) => (
                <li className="text-blue-900 dark:text-blue-100 leading-relaxed">
                  {children}
                </li>
              ),
              
              // Enhanced table styling with better responsiveness
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 -mx-2">
                  <table className="border-collapse border border-blue-300 dark:border-blue-700 text-sm w-full min-w-max">
                    {children}
                  </table>
                </div>
              ),
              
              thead: ({ children }) => (
                <thead className="bg-blue-200 dark:bg-blue-900/50">
                  {children}
                </thead>
              ),
              
              tbody: ({ children }) => (
                <tbody className="bg-white dark:bg-blue-950/30">
                  {children}
                </tbody>
              ),
              
              tr: ({ children }) => (
                <tr className="border-b border-blue-300 dark:border-blue-700 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                  {children}
                </tr>
              ),
              
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 align-top">
                  {children}
                </th>
              ),
              
              td: ({ children }) => (
                <td className="px-3 py-2 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700 align-top">
                  {children}
                </td>
              ),
              
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 my-2 italic text-blue-800 dark:text-blue-200 text-sm bg-blue-100/30 dark:bg-blue-900/20 py-1 rounded-r">
                  {children}
                </blockquote>
              ),
              
              strong: ({ children }) => (
                <strong className="font-semibold text-blue-900 dark:text-blue-100">
                  {children}
                </strong>
              ),
              
              em: ({ children }) => (
                <em className="italic text-blue-800 dark:text-blue-200">
                  {children}
                </em>
              ),
              
              hr: () => (
                <hr className="my-4 border-blue-300 dark:border-blue-700" />
              ),
              
              // Enhanced link styling
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-600 hover:decoration-blue-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              
              // Image styling
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || ''}
                  className="max-w-full h-auto rounded-lg border border-blue-200 dark:border-blue-700 my-2"
                  loading="lazy"
                />
              ),
            }}
          >
            {processedResponse}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}