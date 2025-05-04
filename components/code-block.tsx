"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import rehypePrettyCode from "rehype-pretty-code";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { getSingletonHighlighter } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  theme?: "light" | "dark" | string;
}

export function CodeBlock({
  code,
  language = "typescript",
  className,
  showLineNumbers = false,
  theme = "github-dark",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const highlightCode = async () => {
      setIsLoading(true);
      try {
        const processor = unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypePrettyCode, {
            theme,
            keepBackground: true,
            getSingletonHighlighter: (options) =>
              getSingletonHighlighter({
                ...options,
                langs: [language],
              }),
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node) {
              node.properties.className = ["highlighted"];
            },
            onVisitHighlightedWord(node) {
              node.properties.className = ["word-highlighted"];
            },
            lineNumbers: showLineNumbers,
          })
          .use(rehypeStringify);

        const codeHtml = `<pre><code class="language-${language}">${code}</code></pre>`;

        const result = await processor.process(codeHtml);
        setHighlightedCode(String(result.value));
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlightedCode(
          `<pre><code class="language-${language}">${code}</code></pre>`
        );
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [code, language, theme, showLineNumbers]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      {isLoading ? (
        <div className="p-4 rounded-md bg-background border text-sm overflow-x-auto animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-md bg-background border text-sm overflow-x-auto",
            "text-foreground/90 font-mono",
            "dark:bg-gray-950"
          )}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      )}
      <button
        onClick={copyToClipboard}
        className={cn(
          "absolute top-3 right-3 p-2 rounded-md",
          "bg-background/80 backdrop-blur-sm border",
          "text-muted-foreground hover:text-foreground",
          "transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        aria-label="Copy code to clipboard"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <style jsx global>{`
        .highlighted {
          background-color: rgba(200, 200, 255, 0.1);
          border-left: 2px solid hsl(var(--primary));
          padding-left: 0.5rem;
        }
        .word-highlighted {
          background-color: rgba(200, 200, 255, 0.2);
          padding: 0.2rem;
          border-radius: 0.25rem;
        }
        pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
        }
        code {
          counter-reset: line;
          display: grid;
        }
        code[data-line-numbers] > .line::before {
          counter-increment: line;
          content: counter(line);
          display: inline-block;
          width: 1.5rem;
          margin-right: 1rem;
          text-align: right;
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}
