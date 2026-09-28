import type { ReactNode } from "react"

/**
 * The section shell used across the public poster. The wrapper element, the
 * container width and the vertical rhythm were repeated in six sections, so a
 * change to the page gutters had to be made in six places.
 */
interface SectionProps {
  /** Anchor id, also used for header scroll-spy and skip links. */
  id?: string
  /** Rendered as the "/ NAME" heading. */
  title: string
  /** Trailing content in the header row, e.g. a link or status pill. */
  aside?: ReactNode
  /** Drops the divider for sections that intentionally follow another. */
  divided?: boolean
  children: ReactNode
  className?: string
}

export function Section({
  id,
  title,
  aside,
  divided = true,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={[
        id ? "section-anchor" : "",
        divided ? "border-b-2 border-[var(--ink)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 ${className ?? ""}`}>
        <div className="flex items-center justify-between mb-6 sm:mb-10 border-b-2 border-[var(--ink)] pb-4">
          <h2 className="font-mono font-black text-2xl tracking-tight">
            / {title}
          </h2>
          {aside}
        </div>
        {children}
      </div>
    </section>
  )
}
