"use client"

import { useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { X } from "lucide-react"
import { swrFetcher, ADMIN_TAGS_KEY } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Tag } from "@/types/api"

const MAX_TAGS = 8
const MAX_LEN = 24

/** Names of every tag already in use, straight from the tags table. */
function useExistingTags(): string[] {
  const { data: tags } = useSWR<Tag[]>(ADMIN_TAGS_KEY, swrFetcher)
  return useMemo(() => (tags ?? []).map((t) => t.name), [tags])
}

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function TagInput({
  tags,
  onChange,
  disabled,
  id,
  label = "TAGS",
}: TagInputProps) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const existing = useExistingTags()

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return existing
      .filter((t) => !tags.includes(t) && (!q || t.includes(q)))
      .slice(0, 6)
  }, [draft, existing, tags])

  function add(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return
    onChange([...tags, tag.slice(0, MAX_LEN)])
    setDraft("")
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add(draft)
      return
    }
    // Backspace on an empty field removes the last chip.
    if (e.key === "Backspace" && !draft && tags.length > 0) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs font-bold tracking-widest mb-1">
        {label}
      </label>

      {/* Chips + input */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1.5 border-brutal bg-[var(--bg)] px-2 py-2 cursor-text focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--main)]"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 border-brutal bg-[var(--main)] px-2 py-0.5 font-mono text-[11px] font-bold text-[#111111]"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                remove(tag)
              }}
              aria-label={`Remove tag ${tag}`}
              className="focus-brutal"
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id={id}
          ref={inputRef}
          value={draft}
          disabled={disabled || tags.length >= MAX_TAGS}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={tags.length >= MAX_TAGS ? `Max ${MAX_TAGS} tags` : "Type and press Enter…"}
          className="min-w-[10rem] flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
        />
      </div>

      {/* Suggestions from tags already in use */}
      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className={cn(
                "border-brutal bg-[var(--panel)] px-2 py-0.5 font-mono text-[10px]",
                "hover:bg-[var(--main)] focus-brutal",
              )}
            >
              + {tag}
            </button>
          ))}
        </div>
      )}

      <p className="font-mono text-[10px] text-[var(--muted)] mt-1">
        {tags.length}/{MAX_TAGS} · lowercase, max {MAX_LEN} chars
      </p>
    </div>
  )
}
