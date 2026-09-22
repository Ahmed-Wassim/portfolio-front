"use client"

import useSWR from "swr"
import { Sidebar } from "@/components/admin/Sidebar"
import { swrFetcher } from "@/lib/api"
import type { Dashboard } from "@/types/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data } = useSWR<Dashboard>("/api/admin/dashboard", swrFetcher, {
    refreshInterval: 30_000,
    shouldRetryOnError: false,
    onError: () => {},
  })

  const unreadCount = data?.unread_messages ?? 0

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <Sidebar unreadCount={unreadCount} />

      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  )
}
