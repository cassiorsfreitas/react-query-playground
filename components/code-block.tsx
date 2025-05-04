"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "typescript",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group", className)}>
      <pre
        className={cn(
          "p-4 rounded-md bg-background border text-sm overflow-x-auto",
          "text-foreground/90 font-mono",
          "dark:bg-gray-950"
        )}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
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
    </div>
  );
}
