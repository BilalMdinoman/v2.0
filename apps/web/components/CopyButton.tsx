"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      title="Copy token address"
      className={`inline-flex items-center justify-center rounded p-0.5 text-slate-500 transition hover:bg-terminal-border hover:text-accent-cyan ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-accent-green" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
