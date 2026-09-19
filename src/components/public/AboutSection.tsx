import { site } from "@/config/site"
import { Reveal } from "@/components/ui/Reveal"

export function AboutSection() {
  return (
    <section id="about" className="section-anchor border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="border-b-2 border-[var(--ink)] pb-4 mb-10">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ ABOUT</h2>
        </div>
        <div className="max-w-2xl space-y-4">
          {site.about.map((para, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="font-sans text-base leading-relaxed">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
