"use client"

import { useEffect } from "react"

/**
 * Warns the user before leaving the page (browser close/reload) if `isDirty` is true.
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
