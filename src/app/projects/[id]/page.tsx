import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, GitFork } from "lucide-react"
import { getProject, uploadUrl } from "@/lib/api"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { Header } from "@/components/public/Header"
import { Footer } from "@/components/public/Footer"
import { BackToTop } from "@/components/ui/BackToTop"

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const result = await getProject(id)
  if (!result.ok) return {}
  const p = result.data
  const img = uploadUrl(p.image)
  return {
    title: `${p.title} — AHMEDWASSIM.exe`,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.description.slice(0, 160),
      type: "website",
      ...(img ? { images: [{ url: img }] } : {}),
    },
    twitter: { card: "summary_large_image", title: p.title },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const result = await getProject(id)

  if (!result.ok) notFound()

  const project = result.data
  const imgSrc = uploadUrl(project.image)

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest flash-blue focus-brutal mb-8"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          BACK
        </Link>

        {/* Image */}
        <div className="border-brutal shadow-brutal-lg mb-8 overflow-hidden">
          {imgSrc ? (
            <ProjectImage src={imgSrc} alt={project.title} />
          ) : (
            <PlaceholderBlock aspect="aspect-video" className="w-full" />
          )}
        </div>

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {project.featured && (
            <span className="border-brutal px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-[var(--small)]">
              FEATURED
            </span>
          )}
        </div>

        <h1 className="font-mono font-black text-3xl sm:text-4xl tracking-tight mb-4">
          {project.title.toUpperCase()}
        </h1>
        <p className="font-sans text-base leading-relaxed text-[var(--muted)] mb-8 max-w-2xl">
          {project.description}
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-4">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal btn-brutal-ink focus-brutal inline-flex items-center gap-2"
            >
              <ExternalLink size={14} aria-hidden="true" />
              LIVE SITE
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal btn-brutal-panel focus-brutal inline-flex items-center gap-2"
            >
              <GitFork size={14} aria-hidden="true" />
              GITHUB
            </a>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-video relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={undefined}
      />
    </div>
  )
}
