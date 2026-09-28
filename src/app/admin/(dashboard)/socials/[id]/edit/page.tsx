"use client"

import { use } from "react"
import useSWR from "swr"

import { SocialForm } from "@/components/admin/SocialForm"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { adminSocialKey, swrFetcher } from "@/lib/api"
import type { Social } from "@/types/api"

export default function EditSocialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<Social>(
    adminSocialKey(id),
    swrFetcher,
    { shouldRetryOnError: false },
  )

  if (isLoading) return <FormSkeleton />

  if (error || !item) {
    return (
      <div className="p-4 sm:p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Social not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="SOCIALS" title="EDIT SOCIAL" />
      <SocialForm item={item} />
    </div>
  )
}
