"use client"

import { use } from "react"
import useSWR from "swr"

import { ProjectForm } from "@/components/admin/ProjectForm"
import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { adminProjectKey, swrFetcher } from "@/lib/api"
import type { Project } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProjectPage({ params }: Props) {
  const { id } = use(params)
  const { data: project, isLoading, error } = useSWR<Project>(
    adminProjectKey(id),
    swrFetcher,
    { shouldRetryOnError: false },
  )

  if (isLoading) return <FormSkeleton />

  if (error || !project) {
    return (
      <div className="p-4 sm:p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="PROJECTS" title="EDIT PROJECT" />
      <ProjectForm project={project} />
    </div>
  )
}
