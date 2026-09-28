import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"

interface RowActionsProps {
  /** Omit to render the edit control as a button instead of a link. */
  editHref?: string
  onEdit?: () => void
  onDelete: () => void
  /** Disables only the delete button while that row's request is in flight. */
  deleting?: boolean
  /** Accessible names, since the icons alone carry no label. */
  editLabel?: string
  deleteLabel?: string
}

/**
 * The edit/delete control pair on a resource row. The button styling was
 * repeated verbatim across every admin list, which is why some rows drifted to
 * a different icon size or shadow.
 */
export function RowActions({
  editHref,
  onEdit,
  onDelete,
  deleting = false,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: RowActionsProps) {
  const editButton = (
    <Pencil size={13} aria-hidden="true" />
  )

  return (
    <div className="flex items-center gap-2 shrink-0">
      {editHref ? (
        <Link
          href={editHref}
          className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
          aria-label={editLabel}
        >
          {editButton}
        </Link>
      ) : onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
          aria-label={editLabel}
        >
          {editButton}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="btn-brutal focus-brutal p-1.5 bg-[var(--danger)] text-white disabled:opacity-50"
        aria-label={deleteLabel}
      >
        <Trash2 size={13} aria-hidden="true" />
      </button>
    </div>
  )
}
