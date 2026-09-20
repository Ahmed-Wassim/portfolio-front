"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { Sidebar } from "@/components/admin/Sidebar"
import { swrFetcher } from "@/lib/api"
import type { Dashboard } from "@/types/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPath = useRef(pathname)
  const [navigating, setNavigating] = useState(false)

  // Show a top-of-content-area progress strip while the new page mounts
  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname
    setNavigating(true)
    // The new page's own skeleton takes over immediately after mount
    const t = setTimeout(() => setNavigating(false), 600)
    return () => clearTimeout(t)
  }, [pathname])

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
        {/* Thin progress strip at top of content during navigation */}
        {navigating && (
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--main)] z-20"
            style={{ animation: "nav-strip 0.6s ease-out forwards" }}
          />
        )}
        {children}
      </div>
    </div>
  )
}
