import Link from "next/link"

import { formatLogDate, readingTime } from "@/lib/utils"
import { TagList } from "@/components/public/Tags"
import type { Article } from "@/types/api"

interface ArticleRowProps {
  article: Article
  /** Renders tags beneath the row (used on the /articles index). */
  showTags?: boolean
  /** Wraps in <li> so the component can be dropped into a <ul>. */
  asListItem?: boolean
}

/**
 * A single log line: date, title, reading time.
 *
 * LogsSection and ArticleList each rendered this row independently, which meant
 * a change to one (tag placement, hover colour) had to be made twice and they
 * drifted.
 */
export function ArticleRow({
  article,
  showTags = false,
  asListItem = false,
}: ArticleRowProps) {
  const body = (
    <Link
      href={`/articles/${article.slug}`}
      className="block border-b border-[var(--ghost)] py-4 flash-blue focus-brutal group"
    >
      <div className="flex items-center gap-6">
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
      {showTags && article.tags.length > 0 && (
        <TagList tags={article.tags} className="mt-2" />
      )}
    </Link>
  )

  return asListItem ? <li>{body}</li> : body
}
