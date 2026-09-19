import { cn } from "@/lib/utils"

interface StatusPillProps {
  status: "online" | "offline"
  label: string
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const online = status === "online"
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-1",
        "font-mono text-xs font-bold tracking-widest uppercase",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block w-2 h-2 rounded-full",
          online
            ? "bg-[var(--status-online)] led-blink"
            : "bg-[var(--danger)]"
        )}
      />
      <span>{label}</span>
    </div>
  )
}
