"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, Row, RowList } from "@/components/admin/DataList"
import { RowActions } from "@/components/admin/RowActions"
import { useDeleteResource } from "@/hooks/useDeleteResource"
import { ADMIN_ABOUT_KEY, deleteAboutItem, swrFetcher } from "@/lib/api"
import type { AboutItem } from "@/types/api"

export default function AdminAboutPage() {
  const { data: items, isLoading, error, mutate } = useSWR<AboutItem[]>(
    ADMIN_ABOUT_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const { handleDelete, deletingId } = useDeleteResource<AboutItem>({
    deleteFn: (row) => deleteAboutItem(row.id),
    confirm: (item) =>
      `Delete this about item?\n\n"${item.content.slice(0, 60)}"?\n\nThis cannot be undone.`,
    success: "About item deleted.",
    onDeleted: () => mutate(),
  })

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        kicker="ADMIN"
        title="ABOUT"
        action={
          <Link
            href="/admin/about/new"
            className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-2"
          >
            <Plus size={14} aria-hidden="true" />
            NEW
          </Link>
        }
      />

      <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-6">
        Shown in order of SORT (ascending). Each item is one paragraph.
      </p>

      <DataList
        isLoading={isLoading}
        error={error}
        count={items?.length ?? 0}
        emptyLabel="No about items yet. Add your first paragraph."
      >
        <RowList>
          {(items ?? []).map((item, i) => (
            <Row
              key={item.id}
              last={i === (items?.length ?? 0) - 1}
              className="flex items-start gap-4 py-4"
            >
              <span className="font-mono text-xs text-[var(--muted)] tracking-widest shrink-0 w-8 pt-0.5">
                {String(item.sort).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                {item.title && (
                  <p className="font-mono text-xs font-bold tracking-widest text-[var(--muted)] mb-1">
                    {item.title}
                  </p>
                )}
                <p className="font-sans text-sm leading-relaxed line-clamp-2 text-[var(--ink)]">
                  {item.content}
                </p>
              </div>
              <RowActions
                editHref={`/admin/about/${item.id}/edit`}
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
