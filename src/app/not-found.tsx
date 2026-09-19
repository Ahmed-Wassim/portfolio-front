import Link from "next/link"

export default function NotFound() {
  return (
    <main
      id="main"
      className="min-h-dvh bg-[var(--bg)] flex items-center justify-center px-4"
    >
      <div className="border-brutal shadow-brutal-lg bg-[var(--panel)] p-10 max-w-md w-full">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-2">
          ERROR 404
        </p>
        <h1 className="font-mono font-black text-5xl tracking-tight mb-1">
          NOT
        </h1>
        <h1 className="font-mono font-black text-5xl tracking-tight outline-text mb-6">
          FOUND
        </h1>
        <p className="font-sans text-sm text-[var(--muted)] mb-8">
          This page does not exist or was moved. Check the URL and try again.
        </p>
        <Link href="/" className="btn-brutal btn-brutal-ink focus-brutal">
          BACK HOME
        </Link>
      </div>
    </main>
  )
}
