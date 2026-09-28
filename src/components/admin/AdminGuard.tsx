"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, setUnauthorizedHandler } from "@/lib/api"
import { PageLoader } from "@/components/ui/PageLoader"

/**
 * Gate for the admin dashboard.
 *
 * Auth is decided once during the first render rather than in an effect: the
 * token cannot change without a navigation, which remounts this component.
 * Deciding during render means the dashboard is never flashed to an
 * unauthenticated visitor, and avoids a setState-in-effect cascade.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // On the server there is no localStorage, so render the loader and let the
  // client decide on hydration.
  const [hasToken] = useState(() =>
    typeof window === "undefined" ? null : Boolean(getToken()),
  )

  useEffect(() => {
    if (hasToken === false) {
      router.replace("/admin/login")
      return
    }

    // Registered for the lifetime of the guard so a 401 on any request below
    // can clear the token and bounce the user out.
    setUnauthorizedHandler(() => {
      toast.error("Session expired. Please log in again.")
      router.replace("/admin/login")
    })

    return () => setUnauthorizedHandler(null)
  }, [hasToken, router])

  if (hasToken !== true) return <PageLoader />

  return <>{children}</>
}
