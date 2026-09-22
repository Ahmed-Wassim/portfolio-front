import { Reveal } from "@/components/ui/Reveal"
import type { SkillCategory } from "@/types/api"

interface SkillsSectionProps {
  categories: SkillCategory[]
}

export function SkillsSection({ categories }: SkillsSectionProps) {
  return (
    <section id="skills" className="section-anchor border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="border-b-2 border-[var(--ink)] pb-4 mb-10">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ SKILLS</h2>
        </div>

        {categories.length === 0 ? (
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
            No skills listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((group, i) => (
              <Reveal key={group.id} delay={i * 60}>
                <div className="border-brutal bg-[var(--panel)] p-4 shadow-brutal">
                  <p className="font-mono text-xs font-bold tracking-widest text-[var(--muted)] mb-3">
                    {group.name.toUpperCase()}
                  </p>
                  <ul className="space-y-1">
                    {group.skills.map((skill) => (
                      <li key={skill.id} className="font-mono text-sm font-bold">
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
