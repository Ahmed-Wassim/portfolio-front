import type { ReactNode } from "react"

import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import { EmptyState } from "@/components/admin/EmptyState"

/**
 * Row-list primitives shared by every admin index page.
 *
 * The loading / error / empty / populated branching and the divider rhythm were
 * previously repeated in each page, which is why the pages drifted apart (some
 * checked `error && !isLoading`, some didn't). These components make the states
 * exhaustive by construction.
 */

interface ListSkeletonProps {
  rows?: number
  /** Row height in the skeleton, e.g. "h-14" or "h-16". */
  height?: string
}

export function ListSkeleton({ rows = 3, height = "h-14" }: ListSkeletonProps) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`border-brutal bg-[var(--panel)] p-4 animate-pulse ${height}`} />
      ))}
    </div>
  )
}

interface DataListProps {
  isLoading: boolean
  error: unknown
  /** Number of rows the skeleton should show. */
  skeletonRows?: number
  skeletonHeight?: string
  /** Shown when there are no rows. */
  emptyLabel: string
  /** Rendered when non-empty. */
  children: ReactNode
  /** Actual row count, used to decide empty vs populated. */
  count: number
}

/**
 * Handles the four list states in the order they can occur. Passing `children`
 * lazily via a function keeps rows from rendering during loading.
 */
export function DataList({
  isLoading,
  error,
  skeletonRows,
  skeletonHeight,
  emptyLabel,
  children,
  count,
}: DataListProps) {
  if (isLoading) return <ListSkeleton rows={skeletonRows} height={skeletonHeight} />
  if (error) return <ApiErrorBanner />
  if (count === 0) return <EmptyState label={emptyLabel} />
  return <>{children}</>
}

interface RowListProps {
  children: ReactNode
  className?: string
}

/**
 * The bordered container for admin rows. Rows opt into the divider via
 * `Row`, which handles the "not the last one" case.
 */
export function RowList({ children, className }: RowListProps) {
  return <div className={`border-brutal overflow-hidden ${className ?? ""}`}>{children}</div>
}

interface RowProps {
  children: ReactNode
  /** True for the final row, which gets no divider. */
  last?: boolean
  className?: string
}

export function Row({ children, last = false, className }: RowProps) {
  return (
    <div className={`px-4 py-3 ${last ? "" : "border-b-2 border-[var(--ink)]"} ${className ?? ""}`}>
      {children}
    </div>
  )
}
