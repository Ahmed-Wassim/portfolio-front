"use client"

import useSWR from "swr"
import { FileText, ExternalLink, Download } from "lucide-react"
import { swrFetcher, cvDownloadUrl, cvPreviewUrl } from "@/lib/api"
import { formatLogDate } from "@/lib/utils"
import type { CV } from "@/types/api"

export function CVPanel() {
  const { data: cv, isLoading } = useSWR<CV>("/api/admin/cv", swrFetcher, {
    shouldRetryOnError: false,
  })

  if (isLoading) {
    return (
      <div className="border-brutal bg-[var(--panel)] p-5 animate-pulse">
        <div className="h-3 w-24 bg-[var(--ghost)] mb-3" />
        <div className="h-4 w-64 bg-[var(--ghost)]" />
      </div>
    )
  }

  const preview = cv ? cvPreviewUrl(cv.file_name) : null

  return (
    <div className="border-brutal bg-[var(--panel)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ink)] p-5">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold tracking-widest mb-1">CV</p>
          {cv ? (
            <p className="font-mono text-xs text-[var(--muted)] break-all">
              {cv.file_name} · uploaded {formatLogDate(cv.created_at)}
            </p>
          ) : (
            <p className="font-mono text-xs text-[var(--muted)]">
              No CV uploaded yet.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {preview && (
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal btn-brutal-panel focus-brutal text-xs inline-flex items-center gap-2"
            >
              <ExternalLink size={13} aria-hidden="true" />
              OPEN
            </a>
          )}
          <a
            href={cvDownloadUrl()}
            className="btn-brutal btn-brutal-ink focus-brutal text-xs inline-flex items-center gap-2"
          >
            <Download size={13} aria-hidden="true" />
            DOWNLOAD
          </a>
        </div>
      </div>

      {/* Inline preview. Chrome refuses to render cross-origin PDFs in an iframe,
          so the OPEN button above is the reliable path there. */}
      {preview && (
        <iframe
          src={preview}
          title="CV preview"
          className="block h-[70vh] w-full border-0 bg-[var(--bg)]"
        />
      )}

      {!cv && (
        <div className="flex items-center gap-3 p-5">
          <FileText size={16} aria-hidden="true" className="text-[var(--muted)]" />
          <p className="font-mono text-xs text-[var(--muted)]">
            Upload one from the CV page in the sidebar.
          </p>
        </div>
      )}
    </div>
  )
}
