import { site } from "@/config/site"
import { getSocialIcon } from "@/lib/social-icons"

export type FooterSocial = { label: string; href: string; iconKey?: string }

interface FooterProps {
  socials?: FooterSocial[]
}

export function Footer({ socials = [...site.socials] }: FooterProps) {
  return (
    <footer className="border-t-2 border-[var(--ink)] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-[var(--muted)] tracking-wide">
          {site.footerCredit}
        </span>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-wrap">
          {socials.map((s) => {
            const Icon = getSocialIcon(s.label, s.iconKey)
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs font-bold tracking-widest flash-blue focus-brutal inline-flex items-center gap-1.5"
              >
                <Icon size={12} aria-hidden="true" />
                {s.label.toUpperCase()}
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
