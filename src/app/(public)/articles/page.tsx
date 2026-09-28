import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { listArticles } from "@/lib/api"
import { ArticleList } from "@/components/public/ArticleList"
import { site } from "@/config/site"
import type { Article } from "@/types/api"

// Server-rendered so the list is in the HTML for search engines and no-JS
// visitors; only the tag filter is interactive.
export const revalidate = 60

export async function generateMetadata() {
  return {
    title: `Logs — AHMEDWASSIM.exe`,
    description: "Notes on backend engineering, Go, Laravel and the systems I build.",
    openGraph: {
      title: "Logs — AHMEDWASSIM.exe",
      description: "Notes on backend engineering, Go, Laravel and the systems I build.",
      type: "website",
    },
  }
}

export default async function ArticlesIndexPage() {
  const result = await listArticles({ revalidate: 60 })
  const articles: Article[] = result.ok ? result.data : []

  return (
    <>
      <main id="main" className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/#logs"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest flash-blue focus-brutal mb-8"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          BACK
        </Link>

        <div className="border-b-2 border-[var(--ink)] pb-4 mb-6">
          <h1 className="font-mono font-black text-3xl tracking-tight">/ LOGS</h1>
        </div>

        {articles.length === 0 ? (
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
            {site.logsEmpty}
          </p>
        ) : (
          <ArticleList articles={articles} />
        )}
      </main>
    </>
  )
}
