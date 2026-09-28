"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, Row, RowList } from "@/components/admin/DataList"
import { RowActions } from "@/components/admin/RowActions"
import { SearchInput, useListSearch } from "@/hooks/useListSearch"
import { useDeleteResource } from "@/hooks/useDeleteResource"
import {
  ADMIN_PROJECTS_KEY,
  deleteProject,
  swrFetcher,
} from "@/lib/api"
import type { Project } from "@/types/api"

export default function AdminProjectsPage() {
  const { data: projects, isLoading, error, mutate } = useSWR<Project[]>(
    ADMIN_PROJECTS_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const { query, setQuery, inputRef, filtered } = useListSearch(projects ?? [], (p) => [
    p.title,
    p.description,
  ])

  const { handleDelete, deletingId } = useDeleteResource<Project>({
    deleteFn: (row) => deleteProject(row.id),
    confirm: (p) => `Delete "${p.title}"? This cannot be undone.`,
    success: "Project deleted.",
    onDeleted: () => mutate(),
  })

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        kicker="ADMIN"
        title="PROJECTS"
        action={
          <Link
            href="/admin/projects/new"
            className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2"
          >
            <Plus size={14} aria-hidden="true" />
            NEW
          </Link>
        }
      />

      <SearchInput inputRef={inputRef} value={query} onChange={setQuery} />

      <DataList
        isLoading={isLoading}
        error={error}
        count={filtered.length}
        emptyLabel={
          query ? "No projects match your search." : "No projects yet."
        }
      >
        <RowList>
          {filtered.map((project, i) => (
            <Row key={project.id} last={i === filtered.length - 1} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm truncate">{project.title}</p>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {project.featured ? "FEATURED · " : ""}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <RowActions
                editHref={`/admin/projects/${project.id}/edit`}
                editLabel={`Edit ${project.title}`}
                deleteLabel={`Delete ${project.title}`}
                deleting={deletingId === project.id}
                onDelete={() => handleDelete(project)}
              />
            </Row>
          ))}
        </RowList>
      </DataList>
    </div>
  )
}
