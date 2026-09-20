import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import type { Components } from "react-markdown"
import { getArticleBySlug, uploadUrl } from "@/lib/api"
import { formatLogDate, readingTime } from "@/lib/utils"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { Header } from "@/components/public/Header"
import { Footer } from "@/components/public/Footer"
import { BackToTop } from "@/components/ui/BackToTop"
import { ScrollProgress } from "@/components/ui/ScrollProgress"
import { CopyButton } from "@/components/ui/CopyButton"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)
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

// Custom markdown components with copy button on code blocks
function buildComponents(): Components {
  return {
    a({ href, children, ...rest }) {
      const isExternal = href && /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flash-blue focus-brutal"
          {...rest}
        >
          {children}
        </a>
      )
    },
    pre({ children, ...rest }) {
      // Extract text from nested code element for the copy button
      let codeText = ""
      try {
        const child = children as React.ReactElement<{ children?: unknown }>
        if (child?.props?.children != null) {
          codeText = String(child.props.children)
        }
      } catch {
        // ignore
      }
      return (
        <div className="relative group">
          <pre style={{ overflowX: "auto" }} {...rest}>
            {children}
          </pre>
          {codeText && <CopyButton text={codeText} />}
        </div>
      )
    },
    code({ children, className, ...rest }) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      )
    },
    img({ src, alt, ...rest }) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} style={{ maxWidth: "100%" }} {...rest} />
      )
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)

  if (!result.ok) notFound()

  const article = result.data
  const imgSrc = uploadUrl(article.image)
  const estimate = readingTime(article.content)

  return (
    <>
      <ScrollProgress />
      <Header />
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={buildComponents()}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
