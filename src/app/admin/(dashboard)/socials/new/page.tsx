"use client"

import useSWR from "swr"
import { swrFetcher, ADMIN_SOCIALS_KEY } from "@/lib/api"
import { SocialForm } from "@/components/admin/SocialForm"
import type { Social } from "@/types/api"

export default function NewSocialPage() {
  const { data: items } = useSWR<Social[]>(ADMIN_SOCIALS_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })

  // Default sort = max existing sort + 1, so new items append to the end automatically
  const nextSort = items?.length
    ? Math.max(...items.map((i) => i.sort_order)) + 1
    : 0

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">SOCIALS</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">NEW SOCIAL</h1>
      </div>
      <SocialForm nextSort={nextSort} />
    </div>
  )
}
