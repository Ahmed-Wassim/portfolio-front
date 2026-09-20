"use client"

import { useEffect, type RefObject } from "react"

/**
 * Focuses the given input when Ctrl+K or Cmd+K is pressed.
 */
export function useSearchFocus(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [inputRef])
}
