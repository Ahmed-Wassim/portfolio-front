"use client"

import { Toaster } from "sonner"
import useSWR from "swr"
import { Sidebar } from "@/components/admin/Sidebar"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { swrFetcher } from "@/lib/api"
import type { Dashboard } from "@/types/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data } = useSWR<Dashboard>("/api/admin/dashboard", swrFetcher, {
    refreshInterval: 30000,
    shouldRetryOnError: false,
  })

  const unreadCount = data?.unread_messages ?? 0

  return (
    <AdminGuard>
      <Toaster position="bottom-right" richColors />
      <div className="flex min-h-dvh bg-[var(--bg)]">
        <Sidebar unreadCount={unreadCount} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </AdminGuard>
  )
}
