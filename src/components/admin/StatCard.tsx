interface StatCardProps {
  label: string
  value: number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="border-brutal shadow-brutal bg-[var(--panel)] p-6">
      <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-2">{label}</p>
      <p className="font-mono font-black text-4xl tracking-tight">{value}</p>
    </div>
  )
}
