/**
 * Placeholder shown while an edit page fetches the record it is editing.
 * Previously restated in five edit pages, with the row count differing between
 * them.
 */
export function FormSkeleton() {
  return (
    <div className="p-4 sm:p-8">
      <div className="h-6 w-32 bg-[var(--ghost)] animate-pulse mb-8" />
      <div className="space-y-4 max-w-xl">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 border-brutal bg-[var(--panel)] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
