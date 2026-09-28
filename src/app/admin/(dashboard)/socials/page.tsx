"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { DataList, Row, RowList } from "@/components/admin/DataList"
import { RowActions } from "@/components/admin/RowActions"
import { useDeleteResource } from "@/hooks/useDeleteResource"
import { getSocialIcon } from "@/lib/social-icons"
import { ADMIN_SOCIALS_KEY, deleteSocial, swrFetcher } from "@/lib/api"
import type { Social } from "@/types/api"

export default function AdminSocialsPage() {
  const { data: items, isLoading, error, mutate } = useSWR<Social[]>(
    ADMIN_SOCIALS_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )

  const { handleDelete, deletingId } = useDeleteResource<Social>({
    deleteFn: (row) => deleteSocial(row.id),
    confirm: (s) => `Delete "${s.platform}"?`,
    success: "Deleted.",
    onDeleted: () => mutate(),
  })

  return (
    <div className="p-4 sm:p-8">
      <PageHeader
        kicker="ADMIN"
        title="SOCIALS"
        action={
          <Link
            href="/admin/socials/new"
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
        emptyLabel="No socials yet."
      >
        <RowList>
          {(items ?? []).map((item, i) => {
            const Icon = getSocialIcon(item.platform, item.icon)
            return (
              <Row
                key={item.id}
                last={i === (items?.length ?? 0) - 1}
                className="flex items-center gap-4"
              >
                <span className="font-mono text-xs text-[var(--muted)] w-6 shrink-0">
                  {item.sort_order}
                </span>
                <Icon size={14} aria-hidden="true" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-sm">{item.platform}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[var(--muted)] flash-blue truncate block"
                  >
                    {item.url}
                  </a>
                </div>
                <RowActions
                  editHref={`/admin/socials/${item.id}/edit`}
                  deleting={deletingId === item.id}
                  onDelete={() => handleDelete(item)}
                />
              </Row>
            )
          })}
        </RowList>
      </DataList>
    </div>
  )
}
