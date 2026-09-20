"use client"

import { useEffect } from "react"

/**
 * Warns the user before leaving if `isDirty` is true.
 * Handles both browser beforeunload and Next.js client navigation.
 */
export function useUnsavedWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])
}
