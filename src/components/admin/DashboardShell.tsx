"use client"

import { Sidebar } from "@/components/admin/Sidebar"
import { useDashboard } from "@/hooks/useDashboard"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data } = useDashboard()
  const unreadCount = data?.unread_messages ?? 0

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      <Sidebar unreadCount={unreadCount} />

      {/* id="main" is the target of the skip-to-content link in the root
          layout. Without it that link is dead on every admin page. */}
      <main id="main" className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  )
}
