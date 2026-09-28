import { site } from "@/config/site"
import { getSocialIcon } from "@/lib/social-icons"

export type FooterSocial = {
  label: string
  href: string
  /** Overrides icon lookup; falls back to `label`. */
  iconKey?: string
}

interface FooterProps {
  socials?: FooterSocial[]
}

/**
 * `socials` is passed by the (public) layout. An empty array falls back to the
 * static list, which happens when the API is unreachable — better a stale link
 * than a footer with no socials at all.
 */
export function Footer({ socials }: FooterProps) {
  // The static list is typed as const, so widen it to the prop shape.
  const fallback: FooterSocial[] = site.socials.map((s) => ({ ...s }))
  const links = socials && socials.length > 0 ? socials : fallback

  return (
    <footer className="border-t-2 border-[var(--ink)] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-[var(--muted)] tracking-wide">
          {site.footerCredit}
        </span>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-wrap">
          {links.map((s) => {
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
