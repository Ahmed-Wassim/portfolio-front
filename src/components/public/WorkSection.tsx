import Link from "next/link"
import { site } from "@/config/site"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { StatusPill } from "@/components/public/StatusPill"
import { Reveal } from "@/components/ui/Reveal"
import { uploadUrl } from "@/lib/api"
import type { Project } from "@/types/api"

interface WorkSectionProps {
  projects: Project[] | null
  offline: boolean
}

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function ProjectImage({
  image,
  title,
}: {
  image: string
  title: string
}) {
  const src = uploadUrl(image)
  if (!src) return <PlaceholderBlock className="w-full" aspect="aspect-video" />

  return (
    <div className="aspect-video w-full overflow-hidden border-b-2 border-[var(--ink)] relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = "none"
          const placeholder = target.nextElementSibling as HTMLElement | null
          if (placeholder) placeholder.style.display = "block"
        }}
      />
      <div style={{ display: "none" }} className="absolute inset-0">
        <PlaceholderBlock className="w-full h-full" aspect="" />
      </div>
    </div>
  )
}

export function WorkSection({ projects, offline }: WorkSectionProps) {
  const sorted = projects ? sortProjects(projects) : []
  const isEmpty = sorted.length === 0

  return (
    <section id="work" className="section-anchor border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10 border-b-2 border-[var(--ink)] pb-4">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ WORK</h2>
          {offline && (
            <StatusPill status="offline" label={site.statusOffline} />
          )}
        </div>

        {isEmpty ? (
          <>
            <p className="font-mono text-xs text-[var(--muted)] mb-8 tracking-widest">
              {site.workEmpty}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="border-brutal shadow-brutal bg-[var(--panel)]">
                    <PlaceholderBlock aspect="aspect-video" className="w-full" />
                    <div className="p-4">
                      <div className="h-3 bg-[var(--ghost)] w-1/3 mb-2" />
                      <div className="h-5 bg-[var(--ghost)] w-3/4 mb-1" />
                      <div className="h-3 bg-[var(--ghost)] w-full" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((project, i) => (
              <Reveal key={project.id} delay={i * 80}>
                <Link
                  href={`/projects/${project.id}`}
                  className="block border-brutal shadow-brutal bg-[var(--panel)] hover:shadow-brutal-lg transition-shadow focus-brutal group"
                >
                  <ProjectImage image={project.image} title={project.title} />
                  <div className="p-4">
                    <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">
                      {String(i + 1).padStart(2, "0")} /
                      {project.featured && (
                        <span className="ml-2 text-[var(--small)]">FEATURED</span>
                      )}
                    </p>
                    <h3 className="font-mono font-bold text-sm tracking-tight line-clamp-2 group-hover:text-[var(--secondary)] transition-colors">
                      {project.title.toUpperCase()}
                    </h3>
                    <p className="font-sans text-xs text-[var(--muted)] mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
