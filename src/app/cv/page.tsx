"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { cvDownloadUrl } from "@/lib/api"
import { Header } from "@/components/public/Header"
import { Footer } from "@/components/public/Footer"
import { PageLoader } from "@/components/ui/PageLoader"

type State = "loading" | "ready" | "failed"

export default function CVPage() {
  const [state, setState] = useState<State>("loading")
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const cvUrl = cvDownloadUrl()

  useEffect(() => {
    let objectUrl: string | null = null

    fetch(cvUrl)
      .then((res) => {
        if (!res.ok) throw new Error("not found")
        return res.blob()
      })
      .then((blob) => {
        // Force inline display — override the server's Content-Disposition: attachment
        const inlineBlob = new Blob([blob], { type: "application/pdf" })
        objectUrl = URL.createObjectURL(inlineBlob)
        setBlobUrl(objectUrl)
        setState("ready")
      })
      .catch(() => setState("failed"))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [cvUrl])

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
            download="AhmedWassim_CV.pdf"
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
        <div
          className="border-brutal shadow-brutal-lg bg-[var(--panel)] overflow-hidden relative"
          style={{ minHeight: "82vh" }}
        >
          {/* Loading */}
          {state === "loading" && (
            <div className="absolute inset-0 z-10">
              <PageLoader variant="inline" />
            </div>
          )}

          {/* Failed */}
          {state === "failed" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--panel)] z-10 p-8">
              <p className="font-mono text-sm font-bold text-[var(--danger)]">CV NOT AVAILABLE</p>
              <p className="font-mono text-xs text-[var(--muted)] text-center">
                No CV has been uploaded yet. Check back later or contact me directly.
              </p>
              <Link href="/#hire" className="btn-brutal btn-brutal-main focus-brutal mt-2">
                CONTACT ME
              </Link>
            </div>
          )}

          {/* Inline PDF viewer via blob URL */}
          {state === "ready" && blobUrl && (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
              title="Curriculum Vitae"
              className="w-full border-0"
              style={{ height: "82vh" }}
            />
          )}
        </div>

        {state === "ready" && (
          <p className="font-mono text-xs text-[var(--muted)] mt-4 text-center tracking-wide">
            Having trouble viewing?{" "}
            <a
              href={cvUrl}
              download="AhmedWassim_CV.pdf"
              className="flash-blue focus-brutal"
            >
              Download PDF directly ↓
            </a>
          </p>
        )}
      </main>
      <Footer />
    </>
  )
}
