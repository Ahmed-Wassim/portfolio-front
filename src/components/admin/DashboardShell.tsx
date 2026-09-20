"use client"

import useSWR from "swr"
import { Sidebar } from "@/components/admin/Sidebar"
import { swrFetcher } from "@/lib/api"
import type { Dashboard } from "@/types/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // Only runs after AdminGuard confirms token exists
  const { data } = useSWR<Dashboard>("/api/admin/dashboard", swrFetcher, {
    refreshInterval: 30000,
    shouldRetryOnError: false,
    // Don't throw on error — sidebar just shows 0 for unread
    onError: () => {},
  })

  const unreadCount = data?.unread_messages ?? 0

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <Sidebar unreadCount={unreadCount} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
