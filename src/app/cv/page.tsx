"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { cvDownloadUrl } from "@/lib/api"
import { Header } from "@/components/public/Header"
import { Footer } from "@/components/public/Footer"

export default function CVPage() {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const cvUrl = cvDownloadUrl()

  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest flash-blue focus-brutal"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            BACK
          </Link>

          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brutal btn-brutal-ink focus-brutal inline-flex items-center gap-2"
          >
            <Download size={14} aria-hidden="true" />
            DOWNLOAD PDF
          </a>
        </div>

        <div className="border-b-2 border-[var(--ink)] pb-4 mb-6">
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">AHMEDWASSIM.exe</p>
          <h1 className="font-mono font-black text-2xl tracking-tight">CURRICULUM VITAE</h1>
        </div>

        {/* Viewer */}
        <div className="border-brutal shadow-brutal-lg bg-[var(--panel)] overflow-hidden relative"
          style={{ minHeight: "80vh" }}
        >
          {/* Loader — shown while iframe loads */}
          {!loaded && !failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--panel)] z-10">
              <Loader2
                size={36}
                className="animate-spin text-[var(--ink)]"
                aria-hidden="true"
              />
              <p className="font-mono text-xs tracking-widest text-[var(--muted)]">
                LOADING CV…
              </p>
            </div>
          )}

          {/* Failed state */}
          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--panel)] z-10">
              <p className="font-mono text-sm font-bold text-[var(--danger)]">CV NOT FOUND</p>
              <p className="font-mono text-xs text-[var(--muted)]">No CV has been uploaded yet.</p>
              <a
                href="/"
                className="btn-brutal btn-brutal-panel focus-brutal mt-2"
              >
                GO HOME
              </a>
            </div>
          )}

          <iframe
            src={`${cvUrl}#toolbar=1&navpanes=0&view=FitH`}
            title="Curriculum Vitae"
            className="w-full border-0"
            style={{
              height: "80vh",
              display: failed ? "none" : "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 300ms ease",
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </div>

        <p className="font-mono text-xs text-[var(--muted)] mt-4 text-center tracking-wide">
          Having trouble viewing?{" "}
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flash-blue focus-brutal"
          >
            Open PDF directly ↗
          </a>
        </p>
      </main>
      <Footer />
    </>
  )
}
