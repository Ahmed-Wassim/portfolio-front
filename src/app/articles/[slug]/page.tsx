import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { getArticleBySlug, uploadUrl } from "@/lib/api"
import { formatLogDate } from "@/lib/utils"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { Header } from "@/components/public/Header"
import { Footer } from "@/components/public/Footer"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)

  if (!result.ok) notFound()

  const article = result.data
  const imgSrc = uploadUrl(article.image)

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href="/#logs"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest flash-blue focus-brutal mb-8"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          BACK
        </Link>

        {/* Date + title */}
        <div className="mb-6">
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-2">
            [{formatLogDate(article.created_at)}]
          </p>
          <h1 className="font-mono font-black text-3xl sm:text-4xl tracking-tight">
            {article.title}
          </h1>
        </div>

        {/* Cover image */}
        {imgSrc && (
          <div className="border-brutal shadow-brutal mb-8 overflow-hidden aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget
                el.style.display = "none"
                const ph = el.nextElementSibling as HTMLElement | null
                if (ph) ph.style.display = "block"
              }}
            />
            <div style={{ display: "none" }}>
              <PlaceholderBlock aspect="aspect-video" className="w-full" />
            </div>
          </div>
        )}

        {/* Markdown content */}
        <article className="prose-brutal">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a({ href, children, ...rest }) {
                const isExternal = href && /^https?:\/\//i.test(href)
                return (
                  <a
                    href={href}
                    {...(isExternal
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {})}
                    className="flash-blue focus-brutal"
                    {...rest}
                  >
                    {children}
                  </a>
                )
              },
              code({ children, className, ...rest }) {
                return (
                  <code
                    className={className}
                    style={{ overflowX: "auto", display: "block" }}
                    {...rest}
                  >
                    {children}
                  </code>
                )
              },
              img({ src, alt, ...rest }) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt ?? ""}
                    style={{ maxWidth: "100%" }}
                    {...rest}
                  />
                )
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </>
  )
}
