"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, Row, RowList } from "@/components/admin/DataList"
import { RowActions } from "@/components/admin/RowActions"
import { useDeleteResource } from "@/hooks/useDeleteResource"
import {
  ADMIN_EXPERIENCES_KEY,
  deleteExperience,
  swrFetcher,
} from "@/lib/api"
import type { Experience } from "@/types/api"

export default function AdminExperiencesPage() {
  const { data: items, isLoading, error, mutate } = useSWR<Experience[]>(
    ADMIN_EXPERIENCES_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const { handleDelete, deletingId } = useDeleteResource<Experience>({
    deleteFn: (row) => deleteExperience(row.id),
    confirm: (e) => `Delete "${e.company}"? This cannot be undone.`,
    success: "Deleted.",
    onDeleted: () => mutate(),
  })

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        kicker="ADMIN"
        title="EXPERIENCE"
        action={
          <Link
            href="/admin/experiences/new"
            className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2"
          >
            <Plus size={14} aria-hidden="true" />
            NEW
          </Link>
        }
      />

      <DataList
        isLoading={isLoading}
        error={error}
        count={items?.length ?? 0}
        emptyLabel="No experience entries yet."
      >
        <RowList>
          {(items ?? []).map((item, i) => (
            <Row key={item.id} last={i === (items?.length ?? 0) - 1} className="flex items-center gap-4 py-4">
              <span className="font-mono text-xs text-[var(--muted)] w-6 shrink-0">
                {item.sort_order}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm">{item.company.toUpperCase()}</p>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {item.role} · {item.period}
                </p>
              </div>
              <RowActions
                editHref={`/admin/experiences/${item.id}/edit`}
                deleting={deletingId === item.id}
                onDelete={() => handleDelete(item)}
              />
            </Row>
          ))}
        </RowList>
      </DataList>
    </div>
  )
}
