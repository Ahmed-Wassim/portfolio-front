"use client"

import { use } from "react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { ArticleForm } from "@/components/admin/ArticleForm"
import type { Article } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params)
  const { data: article, isLoading, error } = useSWR<Article>(
    `/api/admin/articles/${id}`,
    swrFetcher,
    { shouldRetryOnError: false }
  )

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-6 w-32 bg-[var(--ghost)] animate-pulse mb-8" />
        <div className="space-y-4 max-w-xl">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Article not found.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ARTICLES</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">EDIT ARTICLE</h1>
      </div>
      <ArticleForm article={article} />
    </div>
  )
}
