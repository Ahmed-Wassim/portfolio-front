interface PageLoaderProps {
  /** "full" = fixed overlay (initial page load), "inline" = fills parent container */
  variant?: "full" | "inline"
}

export function PageLoader({ variant = "full" }: PageLoaderProps) {
  const isInline = variant === "inline"

  return (
    <div
      className={
        isInline
          ? "flex flex-col items-center justify-center w-full h-full min-h-64 gap-5"
          : "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] gap-5"
      }
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-end gap-[5px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="loader-bar w-[7px] bg-[var(--ink)] rounded-none"
            style={{
              height: "28px",
              animation: "loader-bar 0.75s ease-in-out infinite",
              animationDelay: `${i * 0.11}s`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--muted)] uppercase select-none">
        Loading
      </p>
    </div>
  )
}
