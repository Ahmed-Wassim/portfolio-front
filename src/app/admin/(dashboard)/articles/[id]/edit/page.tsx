"use client"

import { use } from "react"
import useSWR from "swr"

import { ArticleForm } from "@/components/admin/ArticleForm"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { adminArticleKey, swrFetcher } from "@/lib/api"
import type { Article } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditArticlePage({ params }: Props) {
  const { id } = use(params)
  const { data: article, isLoading, error } = useSWR<Article>(
    adminArticleKey(id),
    swrFetcher,
    { shouldRetryOnError: false },
  )

  if (isLoading) return <FormSkeleton />

  if (error || !article) {
    return (
      <div className="p-4 sm:p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Article not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ARTICLES" title="EDIT ARTICLE" />
      <ArticleForm article={article} />
    </div>
  )
}
