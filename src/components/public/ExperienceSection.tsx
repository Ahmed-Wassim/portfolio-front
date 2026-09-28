import { Section } from "@/components/ui/Section"
import { Reveal } from "@/components/ui/Reveal"
import type { Experience } from "@/types/api"

interface ExperienceSectionProps {
  experiences: Experience[]
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <Section title="EXPERIENCE">
      {experiences.length === 0 ? (
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
          No experience listed yet.
        </p>
      ) : (
        <div className="space-y-0">
          {experiences.map((row, i) => (
            <Reveal key={row.id} delay={i * 80}>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-[var(--ghost)] py-5">
                <span className="font-mono text-xs text-[var(--muted)] tracking-widest shrink-0 w-36">
                  {row.period}
                </span>
                <span className="font-mono font-black text-lg tracking-tight">
                  {row.company.toUpperCase()}
                </span>
                <span className="font-mono text-sm font-bold tracking-widest text-[var(--muted)]">
                  {row.role.toUpperCase()}
                </span>
              </div>
              {row.description && (
                <p className="font-sans text-sm text-[var(--muted)] pt-3 pb-5 max-w-xl">
                  {row.description}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
