"use client"

import { use } from "react"
import useSWR from "swr"

import { ExperienceForm } from "@/components/admin/ExperienceForm"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { adminExperienceKey, swrFetcher } from "@/lib/api"
import type { Experience } from "@/types/api"

export default function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<Experience>(
    adminExperienceKey(id),
    swrFetcher,
    { shouldRetryOnError: false },
  )

  if (isLoading) return <FormSkeleton />

  if (error || !item) {
    return (
      <div className="p-4 sm:p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Entry not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="EXPERIENCE" title="EDIT ENTRY" />
      <ExperienceForm item={item} />
    </div>
  )
}
