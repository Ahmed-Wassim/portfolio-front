interface PageHeaderProps {
  /** Small kicker above the title, e.g. "ADMIN" or "PROJECTS". */
  kicker?: string
  title: string
  /** Optional trailing action, usually a "NEW" link. */
  action?: React.ReactNode
}

/**
 * The header block at the top of every admin page. The border, type scale and
 * spacing are identical across ~15 pages, so they live here rather than being
 * restated per page.
 */
export function PageHeader({ kicker, title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
      <div>
        {kicker && (
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">
            {kicker}
          </p>
        )}
        <h1 className="font-mono font-black text-2xl tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  )
}
