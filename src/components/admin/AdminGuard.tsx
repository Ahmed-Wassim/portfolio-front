"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, setUnauthorizedHandler } from "@/lib/api"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login")
      return
    }

    setUnauthorizedHandler(() => {
      toast.error("Session expired. Please log in again.")
      router.replace("/admin/login")
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [router])

  return <>{children}</>
}
