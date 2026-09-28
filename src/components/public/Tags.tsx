"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

/** Row of tag chips. Pass `linkBase` to make them link to a filtered index. */
export function TagList({
  tags,
  linkBase,
  className,
}: {
  tags: string[]
  linkBase?: string
  className?: string
}) {
  if (!tags || tags.length === 0) return null

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => {
        const body = (
          <span className="inline-block border-2 border-[var(--ink)] bg-[var(--panel)] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[var(--ink)] transition-colors hover:bg-[var(--main)]">
            {tag}
          </span>
        )
        return (
          <li key={tag}>
            {linkBase ? (
              <Link href={`${linkBase}?tag=${encodeURIComponent(tag)}`} className="focus-brutal">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Click-to-filter bar. `active` is null when no filter is applied. */
export function TagFilter({
  tags,
  active,
  onChange,
}: {
  tags: string[]
  active: string | null
  onChange: (tag: string | null) => void
}) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-6">
      <span className="font-mono text-[10px] font-bold tracking-widest text-[var(--muted)] mr-1">
        FILTER
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className={cn(
          "border-2 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider focus-brutal",
          active === null
            ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
            : "border-[var(--ink)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--main)]",
        )}
      >
        ALL
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(active === tag ? null : tag)}
          aria-pressed={active === tag}
          className={cn(
            "border-2 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider focus-brutal",
            active === tag
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
              : "border-[var(--ink)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--main)]",
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}

/** Distinct tags across a list, sorted for a stable filter bar. */
export function collectTags(items: { tags: string[] }[]): string[] {
  return [...new Set(items.flatMap((i) => i.tags))].sort()
}
