"use client"

import { Toaster } from "sonner"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { DashboardShell } from "@/components/admin/DashboardShell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <Toaster position="bottom-right" richColors />
      <DashboardShell>{children}</DashboardShell>
    </AdminGuard>
  )
}
