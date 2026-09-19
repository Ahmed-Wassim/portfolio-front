interface EmptyStateProps {
  label: string
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="border-brutal bg-[var(--panel)] p-8 text-center">
      <div className="inline-flex flex-col gap-2 items-center" aria-hidden="true">
        <div className="w-12 h-2 bg-[var(--ghost)]" />
        <div className="w-20 h-2 bg-[var(--ghost)]" />
        <div className="w-8 h-2 bg-[var(--ghost)]" />
      </div>
      <p className="font-mono text-xs text-[var(--muted)] tracking-widest mt-4">{label}</p>
    </div>
  )
}
