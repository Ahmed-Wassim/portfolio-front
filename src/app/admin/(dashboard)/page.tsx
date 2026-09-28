"use client"

import { CVCard } from "@/components/admin/CVCard"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatCard } from "@/components/admin/StatCard"
import { useDashboard } from "@/hooks/useDashboard"

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useDashboard()

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="OVERVIEW" title="DASHBOARD" />

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
        <CVCard />
      </div>
    </div>
  )
}
