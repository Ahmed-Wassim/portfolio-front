"use client"

import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { swrFetcher, deleteSocial, ADMIN_SOCIALS_KEY } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import type { Social } from "@/types/api"

export default function AdminSocialsPage() {
  const { data: items, isLoading, error, mutate } = useSWR<Social[]>(
    ADMIN_SOCIALS_KEY, swrFetcher, { shouldRetryOnError: false }
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number, platform: string) {
    if (!confirm(`Delete "${platform}"?`)) return
    setDeletingId(id)
    const result = await deleteSocial(id)
    setDeletingId(null)
    if (result.ok) { toast.success("Deleted."); mutate() }
    else toast.error(result.error || "Delete failed.")
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-8">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">SOCIALS</h1>
        </div>
        <Link href="/admin/socials/new" className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2">
          <Plus size={14} aria-hidden="true" /> NEW
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse h-14" />)}
        </div>
      )}

      {error && !isLoading && <ApiErrorBanner />}

      {!isLoading && !error && (!items || items.length === 0) && (
        <EmptyState label="No socials yet." />
      )}

      {!isLoading && !error && items && items.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-3 ${i !== items.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}`}
            >
              <span className="font-mono text-xs text-[var(--muted)] w-6 shrink-0">{item.sort_order}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm">{item.platform}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--muted)] flash-blue truncate block"
                >
                  {item.url}
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/socials/${item.id}/edit`} className="btn-brutal btn-brutal-panel focus-brutal p-1.5" aria-label="Edit">
                  <Pencil size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id, item.platform)}
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
