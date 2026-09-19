import Link from "next/link"
import { site } from "@/config/site"
import { StatusPill } from "@/components/public/StatusPill"
import { Reveal } from "@/components/ui/Reveal"
import { formatLogDate } from "@/lib/utils"
import type { Article } from "@/types/api"

interface LogsSectionProps {
  articles: Article[] | null
  offline: boolean
}

export function LogsSection({ articles, offline }: LogsSectionProps) {
  const isEmpty = !articles || articles.length === 0

  return (
    <section id="logs" className="section-anchor border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10 border-b-2 border-[var(--ink)] pb-4">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ LOGS</h2>
          {offline && (
            <StatusPill status="offline" label={site.statusOffline} />
          )}
        </div>

        {isEmpty ? (
          <>
            <div className="space-y-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 border-b border-[var(--ghost)] py-4"
                  style={{ opacity: 1 - i * 0.25 }}
                >
                  <div
                    className="font-mono text-xs text-[var(--muted)] shrink-0 w-28 h-3 bg-[var(--ghost)]"
                    aria-hidden="true"
                  />
                  <div
                    className="h-3 bg-[var(--ghost)] flex-1 max-w-xs"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-[var(--muted)] mt-6 tracking-widest">
              {site.logsEmpty}
            </p>
          </>
        ) : (
          <div className="space-y-0">
            {articles.map((article, i) => (
              <Reveal key={article.id} delay={i * 60}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="flex items-center gap-6 border-b border-[var(--ghost)] py-4 flash-blue focus-brutal group"
                >
                  <span className="font-mono text-xs text-[var(--muted)] shrink-0 tracking-widest">
                    [{formatLogDate(article.created_at)}]
                  </span>
                  <span className="font-mono text-sm font-bold tracking-tight group-hover:text-[var(--secondary)] transition-colors line-clamp-1">
                    {article.title}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
