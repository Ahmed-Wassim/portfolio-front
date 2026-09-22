export function AdminPageSkeleton() {
  return (
    <div className="p-4 sm:p-8 animate-pulse">
      {/* Header */}
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-[var(--ghost)] rounded-none" />
          <div className="h-7 w-40 bg-[var(--ghost)] rounded-none" />
        </div>
        <div className="h-9 w-20 bg-[var(--ghost)] rounded-none" />
      </div>
      {/* Rows */}
      <div className="border-brutal overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-4 py-4 ${i !== 4 ? "border-b-2 border-[var(--ink)]" : ""}`}
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-[var(--ghost)]" />
              <div className="h-3 w-1/5 bg-[var(--ghost)]" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-[var(--ghost)]" />
              <div className="h-8 w-8 bg-[var(--ghost)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
