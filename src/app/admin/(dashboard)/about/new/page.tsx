"use client"

import useSWR from "swr"
import { swrFetcher, ADMIN_ABOUT_KEY } from "@/lib/api"
import { AboutItemForm } from "@/components/admin/AboutItemForm"
import type { AboutItem } from "@/types/api"

export default function NewAboutItemPage() {
  const { data: items } = useSWR<AboutItem[]>(ADMIN_ABOUT_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })

  // Default sort = max existing sort + 1, so new items append to the end automatically
  const nextSort = items?.length
    ? Math.max(...items.map((i) => i.sort)) + 1
    : 0

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ABOUT</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW PARAGRAPH</h1>
      </div>
      <AboutItemForm nextSort={nextSort} />
    </div>
  )
}
