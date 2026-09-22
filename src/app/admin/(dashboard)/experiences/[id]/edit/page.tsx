"use client"

import { use } from "react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { ExperienceForm } from "@/components/admin/ExperienceForm"
import type { Experience } from "@/types/api"

export default function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<Experience>(
    `/api/admin/experiences/${id}`, swrFetcher, { shouldRetryOnError: false }
  )

  if (isLoading) return (
    <div className="p-4 sm:p-8 space-y-4 max-w-xl">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />)}
    </div>
  )

  if (error || !item) return (
    <div className="p-4 sm:p-8"><p className="font-mono text-sm text-[var(--danger)]">Entry not found.</p></div>
  )

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">EXPERIENCE</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">EDIT ENTRY</h1>
      </div>
      <ExperienceForm item={item} />
    </div>
  )
}
