"use client"

import { useEffect, type RefObject } from "react"

/**
 * Triggers a form submit when Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux) is pressed
 * while focus is inside the form.
 */
export function useKeyboardSubmit(formRef: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const form = formRef.current
        if (form && form.contains(document.activeElement)) {
          e.preventDefault()
          form.requestSubmit()
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [formRef])
}
