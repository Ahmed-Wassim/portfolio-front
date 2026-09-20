"use client"

import { use } from "react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { AboutItemForm } from "@/components/admin/AboutItemForm"
import type { AboutItem } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditAboutItemPage({ params }: Props) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<AboutItem>(
    `/api/admin/about/${id}`,
    swrFetcher,
    { shouldRetryOnError: false }
  )

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-xl">
        <div className="h-6 w-32 bg-[var(--ghost)] animate-pulse" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm text-[var(--danger)]">About item not found.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ABOUT</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">EDIT PARAGRAPH</h1>
      </div>
      <AboutItemForm item={item} />
    </div>
  )
}
