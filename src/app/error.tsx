"use client"

import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <main
      id="main"
      className="min-h-dvh bg-[var(--bg)] flex items-center justify-center px-4"
    >
      <div className="border-brutal shadow-brutal-lg bg-[var(--panel)] p-10 max-w-md w-full">
        <p className="font-mono text-xs text-[var(--danger)] tracking-widest mb-2">
          RUNTIME ERROR
        </p>
        <h1 className="font-mono font-black text-5xl tracking-tight mb-6">
          CRASHED
        </h1>
        <p className="font-mono text-xs text-[var(--muted)] mb-6 break-all">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={reset} className="btn-brutal btn-brutal-main focus-brutal">
            TRY AGAIN
          </button>
          <Link href="/" className="btn-brutal btn-brutal-panel focus-brutal">
            HOME
          </Link>
        </div>
      </div>
    </main>
  )
}
