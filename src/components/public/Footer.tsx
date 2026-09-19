import { site } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--ink)] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-[var(--muted)] tracking-wide">
          {site.footerCredit}
        </span>
        <div className="flex items-center gap-4">
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold tracking-widest flash-blue focus-brutal"
            >
              {s.label.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
