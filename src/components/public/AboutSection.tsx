import { Section } from "@/components/ui/Section"
import { Reveal } from "@/components/ui/Reveal"

interface AboutSectionProps {
  paragraphs: string[]
}

export function AboutSection({ paragraphs }: AboutSectionProps) {
  return (
    <Section id="about" title="ABOUT">
      <div className="max-w-2xl space-y-4">
        {paragraphs.map((para, i) => (
          <Reveal key={i} delay={i * 80}>
            <p className="font-sans text-base leading-relaxed">{para}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
