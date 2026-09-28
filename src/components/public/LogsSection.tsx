import Link from "next/link"
import { site } from "@/config/site"
import { Section } from "@/components/ui/Section"
import { StatusPill } from "@/components/public/StatusPill"
import { Reveal } from "@/components/ui/Reveal"
import { ArticleRow } from "@/components/public/ArticleRow"
import type { Article } from "@/types/api"

interface LogsSectionProps {
  articles: Article[] | null
  offline: boolean
}

export function LogsSection({ articles, offline }: LogsSectionProps) {
  const isEmpty = !articles || articles.length === 0

  return (
    <Section
      id="logs"
      title="LOGS"
      aside={
        <div className="flex items-center gap-4">
          {!isEmpty && (
            <Link
              href="/articles"
              className="font-mono text-xs font-bold tracking-widest flash-blue focus-brutal"
            >
              ALL LOGS →
            </Link>
          )}
          {offline && <StatusPill status="offline" label={site.statusOffline} />}
        </div>
      }
    >
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
              <ArticleRow article={article} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
