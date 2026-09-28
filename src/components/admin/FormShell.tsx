"use client"

import { useRouter } from "next/navigation"
import type { ReactNode, RefObject } from "react"

interface FormShellProps {
  onSubmit: () => void
  isSubmitting: boolean
  /** Shown on the primary button: "CREATE" when editing a new record. */
  submitLabel: string
  children: ReactNode
  /** Attached by useKeyboardSubmit so Cmd/Ctrl+Enter submits the form. */
  formRef?: RefObject<HTMLFormElement | null>
  className?: string
}

/**
 * Wraps an admin form with the submit/cancel pair and keyboard submit. The pair
 * was repeated identically in all five forms, so the button states can no
 * longer drift between them.
 */
export function FormShell({
  onSubmit,
  isSubmitting,
  submitLabel,
  children,
  formRef,
  className = "space-y-5 max-w-xl",
}: FormShellProps) {
  const router = useRouter()

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={className}>
      {children}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
        >
          {isSubmitting ? "SAVING…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-brutal btn-brutal-panel focus-brutal"
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}
