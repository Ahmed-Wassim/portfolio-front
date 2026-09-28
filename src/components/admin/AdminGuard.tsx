"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, setUnauthorizedHandler } from "@/lib/api"
import { PageLoader } from "@/components/ui/PageLoader"

/** "unknown" during SSR and the first client render, then a definite answer. */
type AuthState = "unknown" | "authed" | "rejected"

const getSnapshot = (): AuthState => (getToken() ? "authed" : "rejected")

/** What the server rendered. localStorage does not exist there. */
const getServerSnapshot = (): AuthState => "unknown"

/**
 * Subscribe to cross-tab logout as well as this tab's own changes, so signing
 * out in one tab drops the others.
 */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

/**
 * Gate for the admin dashboard.
 *
 * `useSyncExternalStore` rather than reading localStorage during render: a
 * `typeof window` branch in render makes the server emit the loader while the
 * client emits the dashboard, which is a hydration mismatch. This hook is
 * explicitly built for that — React uses the server snapshot for the hydration
 * render and swaps to the client snapshot immediately after.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const auth = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (auth === "rejected") {
      router.replace("/admin/login")
      return
    }
    if (auth === "unknown") return

    // Registered for the lifetime of the guard so a 401 on any request below
    // can clear the token and bounce the user out.
    setUnauthorizedHandler(() => {
      toast.error("Session expired. Please log in again.")
      router.replace("/admin/login")
    })

    return () => setUnauthorizedHandler(null)
  }, [auth, router])

  // Loader until the token is known — the dashboard is never flashed to an
  // unauthenticated visitor, and matches what the server rendered.
  if (auth !== "authed") return <PageLoader />

  return <>{children}</>
}
