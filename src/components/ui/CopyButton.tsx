"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy code"}
      className="absolute top-2 right-2 p-1.5 border-2 border-[var(--ink)] bg-[var(--panel)] focus-brutal opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ transition: "opacity 120ms ease" }}
    >
      {copied ? (
        <Check size={12} className="text-[var(--success)]" aria-hidden="true" />
      ) : (
        <Copy size={12} aria-hidden="true" />
      )}
    </button>
  )
}
