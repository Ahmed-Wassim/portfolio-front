"use client"

import { Sidebar } from "@/components/admin/Sidebar"
import { useDashboard } from "@/hooks/useDashboard"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data } = useDashboard()
  const unreadCount = data?.unread_messages ?? 0

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <Sidebar unreadCount={unreadCount} />

      <div className="flex-1 overflow-auto relative">{children}</div>
    </div>
  )
}
