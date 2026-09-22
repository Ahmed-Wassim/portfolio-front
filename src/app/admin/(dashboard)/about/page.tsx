"use client"

import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { swrFetcher, deleteAboutItem, ADMIN_ABOUT_KEY } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import type { AboutItem } from "@/types/api"

export default function AdminAboutPage() {
  const { data: items, isLoading, error, mutate } = useSWR<AboutItem[]>(
    ADMIN_ABOUT_KEY,
    swrFetcher,
    { shouldRetryOnError: false }
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number, preview: string) {
    if (!confirm(`Delete this about item?\n\n"${preview}"?\n\nThis cannot be undone.`)) return
    setDeletingId(id)
    const result = await deleteAboutItem(id)
    setDeletingId(null)
    if (result.ok) {
      toast.success("About item deleted.")
      mutate()
    } else {
      toast.error(result.error || "Delete failed.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">ABOUT</h1>
        </div>
        <Link
          href="/admin/about/new"
          className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2"
        >
          <Plus size={14} aria-hidden="true" />
          NEW
        </Link>
      </div>

      <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-6">
        Items are shown in order of the SORT field (ascending). Each item is a paragraph in the About section.
      </p>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-[var(--ghost)]" />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && <ApiErrorBanner />}

      {!isLoading && !error && (!items || items.length === 0) && (
        <EmptyState label="No about items yet. Add your first paragraph." />
      )}

      {!isLoading && !error && items && items.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 px-4 py-4 ${i !== items.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}`}
            >
              {/* Sort badge */}
              <span className="font-mono text-xs text-[var(--muted)] tracking-widest shrink-0 w-8 pt-0.5">
                {String(item.sort).padStart(2, "0")}
              </span>

              <div className="flex-1 min-w-0">
                {item.title && (
                  <p className="font-mono text-xs font-bold tracking-widest text-[var(--muted)] mb-1">
                    {item.title}
                  </p>
                )}
                <p className="font-sans text-sm leading-relaxed line-clamp-2 text-[var(--ink)]">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/about/${item.id}/edit`}
                  className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                  aria-label="Edit"
                >
                  <Pencil size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id, item.content.slice(0, 60))}
                  disabled={deletingId === item.id}
                  className="btn-brutal focus-brutal p-1.5 bg-[var(--danger)] text-white disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
