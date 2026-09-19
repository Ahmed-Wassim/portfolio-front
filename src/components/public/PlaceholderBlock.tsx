import { cn } from "@/lib/utils"

interface PlaceholderBlockProps {
  className?: string
  /** Aspect ratio class e.g. "aspect-video" or "aspect-square" */
  aspect?: string
}

export function PlaceholderBlock({
  className,
  aspect = "aspect-video",
}: PlaceholderBlockProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "border-brutal bg-[var(--panel)] overflow-hidden",
        aspect,
        className
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 225"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background */}
        <rect width="400" height="225" fill="var(--panel)" />

        {/* Grid lines */}
        <line x1="0" y1="75" x2="400" y2="75" stroke="var(--ghost, #11111114)" strokeWidth="1" />
        <line x1="0" y1="150" x2="400" y2="150" stroke="var(--ghost, #11111114)" strokeWidth="1" />
        <line x1="133" y1="0" x2="133" y2="225" stroke="var(--ghost, #11111114)" strokeWidth="1" />
        <line x1="266" y1="0" x2="266" y2="225" stroke="var(--ghost, #11111114)" strokeWidth="1" />

        {/* Geometric shapes — tokens only */}
        <rect
          x="40" y="60"
          width="60" height="60"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <rect
          x="55" y="75"
          width="30" height="30"
          fill="var(--secondary)"
        />
        <circle
          cx="300" cy="112"
          r="40"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <circle
          cx="300" cy="112"
          r="18"
          fill="var(--small)"
        />
        <line
          x1="160" y1="90"
          x2="240" y2="90"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <line
          x1="160" y1="112"
          x2="220" y2="112"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <line
          x1="160" y1="134"
          x2="200" y2="134"
          stroke="var(--ink)"
          strokeWidth="2"
        />

        {/* Bottom border accent */}
        <rect x="0" y="221" width="400" height="4" fill="var(--ink)" />
      </svg>
    </div>
  )
}
