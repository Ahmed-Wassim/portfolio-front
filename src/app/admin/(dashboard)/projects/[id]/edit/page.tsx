"use client"

import { use } from "react"
import useSWR from "swr"
import { swrFetcher, adminProjectKey } from "@/lib/api"
import { ProjectForm } from "@/components/admin/ProjectForm"
import type { Project } from "@/types/api"

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProjectPage({ params }: Props) {
  const { id } = use(params)
  const { data: project, isLoading, error } = useSWR<Project>(
    adminProjectKey(id),
    swrFetcher,
    { shouldRetryOnError: false }
  )

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-6 w-32 bg-[var(--ghost)] animate-pulse mb-8" />
        <div className="space-y-4 max-w-xl">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm text-[var(--danger)]">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">PROJECTS</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">EDIT PROJECT</h1>
      </div>
      <ProjectForm project={project} />
    </div>
  )
}
