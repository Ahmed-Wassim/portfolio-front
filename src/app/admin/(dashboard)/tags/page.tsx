"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { DataList } from "@/components/admin/DataList"
import {
  ADMIN_TAGS_KEY,
  TAG_DEPENDENT_KEYS,
  swrFetcher,
  renameTag,
  deleteTag,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Tag } from "@/types/api"

export default function AdminTagsPage() {
  const { data, isLoading, error } = useSWR<Tag[]>(
    ADMIN_TAGS_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )
  // Global mutate so sibling collections can be revalidated by key; the bound
  // mutate above is typed to Tag[] only.
  const { mutate } = useSWRConfig()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setDraft(tag.name)
  }

  /**
   * Content lists embed tag names rather than tag ids, so a rename or delete
   * has to revalidate them too. Without this the admin kept showing the old
   * name until a manual refresh.
   */
  async function revalidateTags() {
    await mutate(ADMIN_TAGS_KEY)
    await Promise.all(
      TAG_DEPENDENT_KEYS.map((key) => mutate(key as string)),
    )
  }

  async function save(id: number) {
    setBusy(true)
    const result = await renameTag(id, draft)
    setBusy(false)

    if (result.ok) {
      toast.success("Tag renamed.")
      setEditingId(null)
      await revalidateTags()
    } else if (result.status === 409) {
      toast.error("That tag name is already taken.")
    } else {
      toast.error(result.error || "Failed to rename tag.")
    }
  }

  async function remove(tag: Tag) {
    const used = tag.article_count + tag.project_count
    const message = used
      ? `Delete "${tag.name}"? It will be removed from ${used} item${used > 1 ? "s" : ""}.`
      : `Delete "${tag.name}"?`

    if (!window.confirm(message)) return

    const result = await deleteTag(tag.id)
    if (result.ok) {
      toast.success("Tag deleted.")
      await revalidateTags()
    } else {
      toast.error(result.error || "Failed to delete tag.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="CONTENT" title="TAGS" />

      <p className="font-mono text-xs text-[var(--muted)] tracking-wide leading-relaxed max-w-2xl mb-6">
        Tags are created automatically when you save a project or article. Rename
        one here to change it everywhere, or delete it to remove it from all
        content.
      </p>

      <DataList
        isLoading={isLoading}
        error={error}
        count={data?.length ?? 0}
        emptyLabel="No tags yet. Add some from a project or article."
      >
        <ul className="max-w-2xl border-t-2 border-[var(--ink)]">
          {(data ?? []).map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-3 border-b border-[var(--ghost)] py-2.5"
            >
              {editingId === tag.id ? (
                <>
                  <input
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") save(tag.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    className="flex-1 border-brutal bg-[var(--bg)] px-2 py-1 font-mono text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--main)]"
                  />
                  <button
                    onClick={() => save(tag.id)}
                    disabled={busy}
                    aria-label="Save tag"
                    className="p-1.5 border-2 border-brutal bg-[var(--main)] focus-brutal disabled:opacity-50"
                  >
                    <Check size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                    className="p-1.5 border-2 border-brutal bg-[var(--panel)] focus-brutal"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 min-w-0">
                    <span className="font-mono text-sm font-bold tracking-tight">
                      {tag.name}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--muted)] ml-3">
                      {tag.article_count} article{tag.article_count === 1 ? "" : "s"} ·{" "}
                      {tag.project_count} project{tag.project_count === 1 ? "" : "s"}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-widest",
                      tag.article_count + tag.project_count === 0
                        ? "text-[var(--muted)]"
                        : "text-[var(--success)]",
                    )}
                  >
                    {tag.article_count + tag.project_count === 0 ? "UNUSED" : "IN USE"}
                  </span>

                  <button
                    onClick={() => startEdit(tag)}
                    aria-label={`Rename ${tag.name}`}
                    className="p-1.5 border-2 border-brutal bg-[var(--panel)] hover:bg-[var(--main)] focus-brutal"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => remove(tag)}
                    aria-label={`Delete ${tag.name}`}
                    className="p-1.5 border-2 border-brutal bg-[var(--panel)] hover:bg-[var(--danger)] hover:text-white focus-brutal"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </DataList>
    </div>
  )
}
