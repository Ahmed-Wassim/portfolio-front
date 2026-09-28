"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { formatLogDate, readingTime } from "@/lib/utils"
import { TagFilter, TagList, collectTags } from "@/components/public/Tags"
import type { Article } from "@/types/api"

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
            <li key={article.id}>
              <Link
                href={`/articles/${article.slug}`}
                className="block border-b border-[var(--ghost)] py-4 flash-blue focus-brutal group"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[var(--muted)] shrink-0 tracking-widest">
                    [{formatLogDate(article.created_at)}]
                  </span>
                  <span className="font-mono text-sm font-bold tracking-tight group-hover:text-[var(--secondary)] transition-colors line-clamp-1 flex-1 min-w-0">
                    {article.title}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted)] shrink-0 hidden sm:block">
                    {readingTime(article.content)}
                  </span>
                </div>
                {article.tags.length > 0 && (
                  <TagList tags={article.tags} className="mt-2" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
