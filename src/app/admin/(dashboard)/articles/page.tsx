"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, Row, RowList } from "@/components/admin/DataList"
import { RowActions } from "@/components/admin/RowActions"
import { SearchInput, useListSearch } from "@/hooks/useListSearch"
import { useDeleteResource } from "@/hooks/useDeleteResource"
import { TagList } from "@/components/public/Tags"
import {
  ADMIN_ARTICLES_KEY,
  deleteArticle,
  swrFetcher,
} from "@/lib/api"
import type { Article } from "@/types/api"

export default function AdminArticlesPage() {
  const { data: articles, isLoading, error, mutate } = useSWR<Article[]>(
    ADMIN_ARTICLES_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const { query, setQuery, inputRef, filtered } = useListSearch(articles ?? [], (a) => [
    a.title,
    a.slug,
  ])

  const { handleDelete, deletingId } = useDeleteResource<Article>({
    deleteFn: (row) => deleteArticle(row.id),
    confirm: (a) => `Delete "${a.title}"? This cannot be undone.`,
    success: "Article deleted.",
    onDeleted: () => mutate(),
  })

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        kicker="ADMIN"
        title="ARTICLES"
        action={
          <Link
            href="/admin/articles/new"
            className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2"
          >
            <Plus size={14} aria-hidden="true" />
            NEW
          </Link>
        }
      />

      <SearchInput inputRef={inputRef} value={query} onChange={setQuery} />

      <DataList
        isLoading={isLoading}
        error={error}
        count={filtered.length}
        emptyLabel={query ? "No articles match your search." : "No articles yet."}
      >
        <RowList>
          {filtered.map((article, i) => (
            <Row key={article.id} last={i === filtered.length - 1} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs tracking-widest ${
                      article.published ? "text-[var(--success)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {article.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                  <span className="font-mono font-bold text-sm truncate">
                    {article.title}
                  </span>
                </div>
                <p className="font-mono text-xs text-[var(--muted)] truncate">
                  /{article.slug}
                </p>
                {article.tags.length > 0 && <TagList tags={article.tags} className="mt-1.5" />}
              </div>
              <RowActions
                editHref={`/admin/articles/${article.id}/edit`}
                editLabel={`Edit ${article.title}`}
                deleteLabel={`Delete ${article.title}`}
                deleting={deletingId === article.id}
                onDelete={() => handleDelete(article)}
              />
            </Row>
          ))}
        </RowList>
      </DataList>
    </div>
  )
}
