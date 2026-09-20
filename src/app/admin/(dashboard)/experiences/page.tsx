"use client"

import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { swrFetcher, deleteExperience, ADMIN_EXPERIENCES_KEY } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import type { Experience } from "@/types/api"

export default function AdminExperiencesPage() {
  const { data: items, isLoading, error, mutate } = useSWR<Experience[]>(
    ADMIN_EXPERIENCES_KEY, swrFetcher, { shouldRetryOnError: false }
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number, company: string) {
    if (!confirm(`Delete "${company}"? This cannot be undone.`)) return
    setDeletingId(id)
    const result = await deleteExperience(id)
    setDeletingId(null)
    if (result.ok) { toast.success("Deleted."); mutate() }
    else toast.error(result.error || "Delete failed.")
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-8">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">EXPERIENCE</h1>
        </div>
        <Link href="/admin/experiences/new" className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2">
          <Plus size={14} aria-hidden="true" /> NEW
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse h-16" />
          ))}
        </div>
      )}

      {error && !isLoading && <ApiErrorBanner />}

      {!isLoading && !error && (!items || items.length === 0) && (
        <EmptyState label="No experience entries yet." />
      )}

      {!isLoading && !error && items && items.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-4 ${i !== items.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}`}
            >
              <span className="font-mono text-xs text-[var(--muted)] w-6 shrink-0">{item.sort_order}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm">{item.company.toUpperCase()}</p>
                <p className="font-mono text-xs text-[var(--muted)]">{item.role} · {item.period}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/experiences/${item.id}/edit`} className="btn-brutal btn-brutal-panel focus-brutal p-1.5" aria-label="Edit">
                  <Pencil size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id, item.company)}
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
