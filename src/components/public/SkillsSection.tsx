import { Section } from "@/components/ui/Section"
import { Reveal } from "@/components/ui/Reveal"
import type { SkillCategory } from "@/types/api"

interface SkillsSectionProps {
  categories: SkillCategory[]
}

export function SkillsSection({ categories }: SkillsSectionProps) {
  return (
    <Section id="skills" title="SKILLS">
      {categories.length === 0 ? (
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
          No skills listed yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
    </Section>
  )
}
