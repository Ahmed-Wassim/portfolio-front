"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"
import { swrFetcher, markMessageRead } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import { formatLogDate } from "@/lib/utils"
import type { Message } from "@/types/api"

const MESSAGES_KEY = "/api/admin/messages"

export default function AdminMessagesPage() {
  const { data: messages, isLoading, error, mutate } = useSWR<Message[]>(
    MESSAGES_KEY,
    swrFetcher,
    { shouldRetryOnError: false }
  )
  const [expanded, setExpanded] = useState<number | null>(null)
  const [marking, setMarking] = useState<number | null>(null)

  async function handleMarkRead(msg: Message) {
    if (msg.is_read) return
    setMarking(msg.id)

    // Optimistic update
    mutate(
      (current: Message[] | undefined) =>
        current?.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      false
    )

    const result = await markMessageRead(msg.id)
    setMarking(null)

    if (result.ok) {
      mutate()
    } else {
      // Revert on failure
      mutate(
        (current: Message[] | undefined) =>
          current?.map((m) => (m.id === msg.id ? { ...m, is_read: false } : m)),
        false
      )
      toast.error(result.error || "Failed to mark as read.")
    }
  }

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">MESSAGES</h1>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-[var(--ghost)]" />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && <ApiErrorBanner />}

      {!isLoading && !error && (!messages || messages.length === 0) && (
        <EmptyState label="No messages yet." />
      )}

      {!isLoading && !error && messages && messages.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {messages.map((msg, i) => {
            const isExpanded = expanded === msg.id
            return (
              <div
                key={msg.id}
                className={`${i !== messages.length - 1 ? "border-b-2 border-[var(--ink)]" : ""} ${!msg.is_read ? "bg-[var(--panel)]" : ""}`}
              >
                {/* Header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Unread indicator */}
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full shrink-0 ${msg.is_read ? "bg-transparent border border-[var(--muted)]" : "bg-[var(--danger)]"}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`font-mono text-sm font-bold truncate ${!msg.is_read ? "" : "text-[var(--muted)]"}`}>
                        {msg.name}
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)] truncate">
                        {msg.email}
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)] shrink-0">
                        [{formatLogDate(msg.created_at)}]
                      </span>
                    </div>
                    <p className={`font-mono text-xs truncate mt-0.5 ${!msg.is_read ? "font-bold" : "text-[var(--muted)]"}`}>
                      {msg.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!msg.is_read && (
                      <button
                        onClick={() => handleMarkRead(msg)}
                        disabled={marking === msg.id}
                        className="btn-brutal btn-brutal-panel focus-brutal text-xs px-2 py-1 disabled:opacity-50"
                      >
                        MARK READ
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : msg.id)}
                      className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp size={13} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={13} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t-2 border-[var(--ink)] px-4 py-4 bg-[var(--bg)]">
                    <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-2">
                      MESSAGE
                    </p>
                    <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
