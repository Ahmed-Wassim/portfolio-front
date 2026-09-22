"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { swrFetcher, deleteProject, ADMIN_PROJECTS_KEY } from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import { useSearchFocus } from "@/hooks/useSearchFocus"
import type { Project } from "@/types/api"

export default function AdminProjectsPage() {
  const { data: projects, isLoading, error, mutate } = useSWR<Project[]>(
    ADMIN_PROJECTS_KEY,
    swrFetcher,
    { shouldRetryOnError: false }
  )
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchFocus(searchRef)

  const filtered = (projects ?? []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    const result = await deleteProject(id)
    setDeletingId(null)
    if (result.ok) {
      toast.success("Project deleted.")
      mutate()
    } else {
      toast.error(result.error || "Delete failed.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <div>
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">PROJECTS</h1>
        </div>
        <Link href="/admin/projects/new" className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2">
          <Plus size={14} aria-hidden="true" />
          NEW
        </Link>
      </div>

      <input
        ref={searchRef}
        type="search"
        placeholder="SEARCH… (Ctrl+K)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none w-full max-w-sm mb-6"
      />

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-[var(--ghost)]" />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && <ApiErrorBanner />}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState label={search ? "No projects match your search." : "No projects yet."} />
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {filtered.map((project, i) => (
            <div
              key={project.id}
              className={`flex items-center gap-4 px-4 py-3 ${i !== filtered.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm truncate">{project.title}</p>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {project.featured ? "FEATURED · " : ""}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                  aria-label={`Edit ${project.title}`}
                >
                  <Pencil size={13} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => handleDelete(project.id, project.title)}
                  disabled={deletingId === project.id}
                  className="btn-brutal focus-brutal p-1.5 bg-[var(--danger)] text-white disabled:opacity-50"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
