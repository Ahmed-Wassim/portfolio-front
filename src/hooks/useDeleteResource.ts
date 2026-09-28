import { useState } from "react"
import { toast } from "sonner"

import type { ApiResult } from "@/types/api"

interface UseDeleteResourceOptions<T> {
  /** Performs the delete. Receives the row so the id and label can be derived. */
  deleteFn: (row: T) => Promise<ApiResult<unknown>>
  /** Confirmation text. Return null to skip the prompt. */
  confirm: (row: T) => string | null
  /** Toast on success. */
  success: string
  /** Revalidates the affected collection(s) after a successful delete. */
  onDeleted: () => void | Promise<unknown>
}

/**
 * Owns the confirm → in-flight → toast → revalidate sequence shared by every
 * admin delete button, and exposes the id currently being deleted so the row can
 * disable just that button rather than the whole table.
 */
export function useDeleteResource<T extends { id: number }>({
  deleteFn,
  confirm,
  success,
  onDeleted,
}: UseDeleteResourceOptions<T>) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(row: T) {
    const message = confirm(row)
    if (message && !window.confirm(message)) return

    setDeletingId(row.id)
    try {
      const result = await deleteFn(row)
      if (result.ok) {
        toast.success(success)
        await onDeleted()
      } else {
        toast.error(result.error || "Delete failed.")
      }
    } finally {
      setDeletingId(null)
    }
  }

  return { handleDelete, deletingId }
}
