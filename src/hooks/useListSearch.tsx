"use client"

import { useMemo, useRef, useState, type RefObject } from "react"

import { useSearchFocus } from "@/hooks/useSearchFocus"

/**
 * Search state plus the Ctrl/Cmd+K focus shortcut used by admin index pages.
 *
 * `fields` is called per item rather than passed as a dependency, because
 * call sites pass a fresh arrow function each render; keying the memo on its
 * identity would defeat the cache.
 */
export function useListSearch<T>(items: T[], fields: (item: T) => string[]) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  useSearchFocus(inputRef)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => fields(item).some((f) => f.toLowerCase().includes(q)))
    // `fields` is a fresh arrow function at each call site, so depending on its
    // identity would recompute every render. Depend on the search input and the
    // collection instead, which is what actually changes the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query])

  return { query, setQuery, inputRef, filtered }
}

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** The search box markup, shared so every admin list styles it identically. */
export function SearchInput({
  inputRef,
  value,
  onChange,
  placeholder = "SEARCH… (Ctrl+K)",
  className,
}: SearchInputProps) {
  return (
    <input
      ref={inputRef}
      type="search"
      aria-label="Search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        "border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none w-full max-w-sm mb-6"
      }
    />
  )
}
