"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, setUnauthorizedHandler } from "@/lib/api"
import { PageLoader } from "@/components/ui/PageLoader"

type Status = "checking" | "authed" | "rejected"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login")
      setStatus("rejected")
      return
    }

    setStatus("authed")

    setUnauthorizedHandler(() => {
      toast.error("Session expired. Please log in again.")
      router.replace("/admin/login")
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [router])

  // Show loader while checking — never flash dashboard to unauthenticated users
  if (status === "checking" || status === "rejected") {
    return <PageLoader />
  }

  return <>{children}</>
}
