"use client"

import useSWR from "swr"
import { swrFetcher } from "@/lib/api"
import { StatCard } from "@/components/admin/StatCard"
import { CVPanel } from "@/components/admin/CVPanel"
import type { Dashboard } from "@/types/api"

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useSWR<Dashboard>(
    "/api/admin/dashboard",
    swrFetcher,
    { shouldRetryOnError: false }
  )

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">OVERVIEW</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">DASHBOARD</h1>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-6 animate-pulse">
              <div className="h-3 w-20 bg-[var(--ghost)] mb-3" />
              <div className="h-10 w-16 bg-[var(--ghost)]" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="font-mono text-sm text-[var(--danger)]">Failed to load stats.</p>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="PROJECTS" value={data.projects} />
          <StatCard label="ARTICLES" value={data.articles} />
          <StatCard label="UNREAD MESSAGES" value={data.unread_messages} />
        </div>
      )}

      <div className="mt-6">
        <CVPanel />
      </div>
    </div>
  )
}
