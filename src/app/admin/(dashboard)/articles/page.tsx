"use client"

import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { swrFetcher, deleteArticle } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import type { Article } from "@/types/api"

const ARTICLES_KEY = "/api/admin/articles"

export default function AdminArticlesPage() {
  const { data: articles, isLoading, mutate } = useSWR<Article[]>(
    ARTICLES_KEY,
    swrFetcher,
    { shouldRetryOnError: false }
  )
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = (articles ?? []).filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    const result = await deleteArticle(id)
    setDeletingId(null)
    if (result.ok) {
      toast.success("Article deleted.")
      mutate()
    } else {
      toast.error(result.error || "Delete failed.")
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-8">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">ARTICLES</h1>
        </div>
        <Link href="/admin/articles/new" className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2">
          <Plus size={14} aria-hidden="true" />
          NEW
        </Link>
      </div>

      <input
        type="search"
        placeholder="SEARCH…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none w-full max-w-sm mb-6"
      />

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-[var(--ghost)]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState label={search ? "No articles match your search." : "No articles yet."} />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {filtered.map((article, i) => (
            <div
              key={article.id}
              className={`flex items-center gap-4 px-4 py-3 ${i !== filtered.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm truncate">{article.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`font-mono text-xs tracking-widest ${article.published ? "text-[var(--success)]" : "text-[var(--muted)]"}`}
                  >
                    {article.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    · {article.slug}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                  aria-label={`Edit ${article.title}`}
                >
                  <Pencil size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(article.id, article.title)}
                  disabled={deletingId === article.id}
                  className="btn-brutal focus-brutal p-1.5 bg-[var(--danger)] text-white disabled:opacity-50"
                  aria-label={`Delete ${article.title}`}
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
