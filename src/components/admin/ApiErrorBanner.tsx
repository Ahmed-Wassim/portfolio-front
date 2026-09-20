import { AlertTriangle } from "lucide-react"

interface ApiErrorBannerProps {
  message?: string
}

export function ApiErrorBanner({ message }: ApiErrorBannerProps) {
  return (
    <div className="border-2 border-[var(--danger)] bg-[var(--panel)] px-4 py-3 flex items-center gap-3">
      <AlertTriangle size={16} className="text-[var(--danger)] shrink-0" aria-hidden="true" />
      <p className="font-mono text-xs text-[var(--danger)] font-bold tracking-wide">
        {message ?? "Failed to load data. Check your connection or try refreshing."}
      </p>
    </div>
  )
}
