"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, RowList } from "@/components/admin/DataList"
import { formatLogDate, timeAgo } from "@/lib/utils"
import { ADMIN_MESSAGES_KEY, markMessageRead, swrFetcher } from "@/lib/api"
import type { Message } from "@/types/api"

export default function AdminMessagesPage() {
  const { data: messages, isLoading, error, mutate } = useSWR<Message[]>(
    ADMIN_MESSAGES_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const [expanded, setExpanded] = useState<number | null>(null)
  const [marking, setMarking] = useState<number | null>(null)

  async function handleMarkRead(msg: Message) {
    if (msg.is_read) return
    setMarking(msg.id)

    // Optimistic: show it as read immediately, revert if the call fails.
    mutate(
      (current: Message[] | undefined) =>
        current?.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      false,
    )

    const result = await markMessageRead(msg.id)
    setMarking(null)

    if (result.ok) {
      mutate()
    } else {
      mutate(
        (current: Message[] | undefined) =>
          current?.map((m) => (m.id === msg.id ? { ...m, is_read: false } : m)),
        false,
      )
      toast.error(result.error || "Failed to mark as read.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ADMIN" title="MESSAGES" />

      <DataList
        isLoading={isLoading}
        error={error}
        count={messages?.length ?? 0}
        emptyLabel="No messages yet."
      >
        <RowList>
          {(messages ?? []).map((msg, i) => {
            const isExpanded = expanded === msg.id
            return (
              <div
                key={msg.id}
                className={
                  (i === (messages?.length ?? 0) - 1
                    ? ""
                    : "border-b-2 border-[var(--ink)] ") +
                  (!msg.is_read ? "bg-[var(--panel)]" : "")
                }
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      msg.is_read
                        ? "bg-transparent border border-[var(--muted)]"
                        : "bg-[var(--danger)]"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`font-mono text-sm font-bold truncate ${
                          msg.is_read ? "text-[var(--muted)]" : ""
                        }`}
                      >
                        {msg.name}
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)] truncate">
                        {msg.email}
                      </span>
                      <span
                        className="font-mono text-xs text-[var(--muted)] shrink-0"
                        title={formatLogDate(msg.created_at)}
                      >
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                    <p
                      className={`font-mono text-xs truncate mt-0.5 ${
                        msg.is_read ? "text-[var(--muted)]" : "font-bold"
                      }`}
                    >
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
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp size={13} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={13} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

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
        </RowList>
      </DataList>
    </div>
  )
}
