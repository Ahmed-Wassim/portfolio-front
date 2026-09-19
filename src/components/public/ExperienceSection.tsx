import { site } from "@/config/site"
import { Reveal } from "@/components/ui/Reveal"

export function ExperienceSection() {
  return (
    <section className="border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="border-b-2 border-[var(--ink)] pb-4 mb-10">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ EXPERIENCE</h2>
        </div>
        <div className="space-y-0">
          {site.experience.map((row, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-[var(--ghost)] py-5">
                <span className="font-mono text-xs text-[var(--muted)] tracking-widest shrink-0 w-36">
                  {row.period}
                </span>
                <span className="font-mono font-black text-lg tracking-tight">
                  {row.company}
                </span>
                <span className="font-mono text-sm font-bold tracking-widest text-[var(--muted)]">
                  {row.role}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
