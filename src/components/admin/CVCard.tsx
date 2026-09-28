"use client"

import { useRef, useState } from "react"
import { Download, ExternalLink, FileText, Upload } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

import { ADMIN_CV_KEY, cvDownloadUrl, cvPreviewUrl, swrFetcher, uploadCV } from "@/lib/api"
import { formatLogDate } from "@/lib/utils"
import type { CV } from "@/types/api"

interface CVCardProps {
  /** "panel" shows an inline preview (dashboard); "page" adds the uploader. */
  variant?: "panel" | "page"
}

/**
 * The single implementation of "what is the current CV, and how do I get it".
 *
 * Previously CVPanel (on the dashboard) and the /admin/cv page were separate
 * implementations, and the panel pointed users at the page for uploading.
 */
export function CVCard({ variant = "panel" }: CVCardProps) {
  const { data: cv, isLoading, mutate } = useSWR<CV>(ADMIN_CV_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setUploading] = useState(false)

  const preview = cv ? cvPreviewUrl(cv.file_name) : null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (picked.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.")
      e.target.value = ""
      return
    }
    setFile(picked)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    const result = await uploadCV(file)
    setUploading(false)
    if (result.ok) {
      toast.success("CV uploaded successfully.")
      await mutate()
      setFile(null)
      // Clear the native input so re-picking the same file fires onChange.
      if (inputRef.current) inputRef.current.value = ""
    } else {
      toast.error(result.error || "Upload failed.")
    }
  }

  if (isLoading) {
    return (
      <div className="border-brutal bg-[var(--panel)] p-5 animate-pulse">
        <div className="h-3 w-24 bg-[var(--ghost)] mb-3" />
        <div className="h-4 w-64 bg-[var(--ghost)]" />
      </div>
    )
  }

  return (
    <div className={variant === "page" ? "max-w-md space-y-6" : ""}>
      {variant === "page" && (
        <p className="font-mono text-xs text-[var(--muted)] tracking-wide leading-relaxed">
          Upload a new PDF to replace the current CV. It is served at{" "}
          <code className="font-mono text-xs bg-[var(--panel)] border border-[var(--ghost)] px-1">
            /api/cv
          </code>{" "}
          and linked from the public page.
        </p>
      )}

      <div className="border-brutal bg-[var(--panel)]">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
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

        {/* Chrome refuses to render cross-origin PDFs in an iframe, so the OPEN
            button above is the reliable path there. */}
        {preview && variant === "panel" && (
          <iframe
            src={preview}
            title="CV preview"
            className="block h-[70vh] w-full border-0 border-t-2 border-[var(--ink)] bg-[var(--bg)]"
          />
        )}

        {!cv && (
          <div className="flex items-center gap-3 p-5">
            <FileText size={16} aria-hidden="true" className="text-[var(--muted)]" />
            <p className="font-mono text-xs text-[var(--muted)]">
              Upload one to make it available on the public site.
            </p>
          </div>
        )}
      </div>

      {variant === "page" && (
        <div>
          <p className="font-mono text-xs font-bold tracking-widest mb-2">
            UPLOAD NEW CV
          </p>
          <div className="border-brutal bg-[var(--panel)] p-4 space-y-4">
            <label
              htmlFor="cv-upload"
              className="btn-brutal btn-brutal-panel focus-brutal inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload size={13} aria-hidden="true" />
              {file ? file.name : "CHOOSE PDF"}
            </label>
            <input
              ref={inputRef}
              id="cv-upload"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
            />

            {file && (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Upload size={13} aria-hidden="true" />
                  {isUploading ? "UPLOADING…" : "UPLOAD"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
