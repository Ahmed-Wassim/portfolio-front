"use client"

import { use } from "react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { SocialForm } from "@/components/admin/SocialForm"
import type { Social } from "@/types/api"

export default function EditSocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<Social>(
    `/api/admin/socials/${id}`, swrFetcher, { shouldRetryOnError: false }
  )

  if (isLoading) return (
    <div className="p-8 space-y-4 max-w-xl">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />)}
    </div>
  )

  if (error || !item) return (
    <div className="p-8"><p className="font-mono text-sm text-[var(--danger)]">Social not found.</p></div>
  )

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">SOCIALS</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">EDIT SOCIAL</h1>
      </div>
      <SocialForm item={item} />
    </div>
  )
}
