import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getArticleBySlug, uploadUrl } from "@/lib/api"
import { Markdown } from "@/lib/markdown"
import { TagList } from "@/components/public/Tags"
import { formatLogDate, readingTime } from "@/lib/utils"
import { ScrollProgress } from "@/components/ui/ScrollProgress"

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug, { revalidate: 60 })
  if (!result.ok) return {}
  const article = result.data
  const img = uploadUrl(article.image)
  return {
    title: `${article.title} — AHMEDWASSIM.exe`,
    description: article.content.slice(0, 160).replace(/[#*`>\n]/g, " ").trim(),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160).replace(/[#*`>\n]/g, " ").trim(),
      type: "article",
      publishedTime: article.created_at,
      ...(img ? { images: [{ url: img }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug, { revalidate: 60 })

  if (!result.ok) notFound()

  const article = result.data
  const imgSrc = uploadUrl(article.image)
  const estimate = readingTime(article.content)

  return (
    <>
      <ScrollProgress />
      <main id="main" className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/#logs"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest flash-blue focus-brutal mb-8"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          BACK
        </Link>

        {/* Date + reading time + title */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
              [{formatLogDate(article.created_at)}]
            </p>
            <span className="font-mono text-xs text-[var(--muted)] tracking-widest">
              · {estimate}
            </span>
          </div>
          <h1 className="font-mono font-black text-3xl sm:text-4xl tracking-tight">
            {article.title}
          </h1>
          {article.tags.length > 0 && (
            <TagList tags={article.tags} linkBase="/articles" className="mt-3" />
          )}
        </div>

        {/* Cover image */}
        {imgSrc && (
          <div className="border-brutal shadow-brutal mb-8 overflow-hidden aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Markdown content */}
        <article className="prose-brutal">
          <Markdown>{article.content}</Markdown>
        </article>
      </main>
    </>
  )
}
