export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)]">
      {/* Animated bars — brutalist mechanical feel */}
      <div className="flex items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 bg-[var(--ink)]"
            style={{
              height: "2rem",
              animation: `loader-bar 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-xs tracking-[0.3em] text-[var(--muted)] mt-6 uppercase">
        Loading
      </p>

      <style>{`
        @keyframes loader-bar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50%       { transform: scaleY(1);   opacity: 1;   }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes loader-bar {
            0%, 100% { transform: none; opacity: 0.8; }
          }
        }
      `}</style>
    </div>
  )
}
