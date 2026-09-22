"use client"

import useSWR from "swr"
import { swrFetcher, ADMIN_EXPERIENCES_KEY } from "@/lib/api"
import { ExperienceForm } from "@/components/admin/ExperienceForm"
import type { Experience } from "@/types/api"

export default function NewExperiencePage() {
  const { data: items } = useSWR<Experience[]>(ADMIN_EXPERIENCES_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })

  // Default sort = max existing sort + 1, so new items append to the end automatically
  const nextSort = items?.length
    ? Math.max(...items.map((i) => i.sort_order)) + 1
    : 0

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">EXPERIENCE</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW ENTRY</h1>
      </div>
      <ExperienceForm nextSort={nextSort} />
    </div>
  )
}
