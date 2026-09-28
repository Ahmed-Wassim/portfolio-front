"use client"

import { use } from "react"
import useSWR from "swr"

import { AboutItemForm } from "@/components/admin/AboutItemForm"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { adminAboutKey, swrFetcher } from "@/lib/api"
import type { AboutItem } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditAboutItemPage({ params }: Props) {
  const { id } = use(params)
  const { data: item, isLoading, error } = useSWR<AboutItem>(
    adminAboutKey(id),
    swrFetcher,
    { shouldRetryOnError: false },
  )

  if (isLoading) return <FormSkeleton />

  if (error || !item) {
    return (
      <div className="p-4 sm:p-8">
        <p className="font-mono text-sm text-[var(--danger)]">About item not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ABOUT" title="EDIT PARAGRAPH" />
      <AboutItemForm item={item} />
    </div>
  )
}
