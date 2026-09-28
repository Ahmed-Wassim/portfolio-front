"use client"

import { useMemo, useState } from "react"

import { ArticleRow } from "@/components/public/ArticleRow"
import { TagFilter, collectTags } from "@/components/public/Tags"
import type { Article } from "@/types/api"

/** Tag-filterable article list. The filter is the only interactive part. */
export function ArticleList({ articles }: { articles: Article[] }) {
  const [tag, setTag] = useState<string | null>(null)

  const allTags = useMemo(() => collectTags(articles), [articles])
  const visible = useMemo(
    () => (tag ? articles.filter((a) => a.tags.includes(tag)) : articles),
    [articles, tag],
  )

  return (
    <>
      <TagFilter tags={allTags} active={tag} onChange={setTag} />

      {visible.length === 0 ? (
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
          No articles tagged “{tag}”.
        </p>
      ) : (
        <ul className="space-y-0">
          {visible.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              showTags
              asListItem
            />
          ))}
        </ul>
      )}
    </>
  )
}
