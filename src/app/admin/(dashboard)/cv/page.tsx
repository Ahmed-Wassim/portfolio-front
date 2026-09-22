"use client"

import { useId, useState } from "react"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { uploadCV, cvDownloadUrl } from "@/lib/api"

export default function AdminCVPage() {
  const inputId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedAt, setUploadedAt] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.")
      e.target.value = ""
      return
    }
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    const result = await uploadCV(file)
    setUploading(false)
    if (result.ok) {
      toast.success("CV uploaded successfully.")
      setUploadedAt(new Date().toLocaleString())
      setFile(null)
    } else {
      toast.error(result.error || "Upload failed.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">CV</h1>
      </div>

      <div className="max-w-md space-y-6">
        <p className="font-mono text-xs text-[var(--muted)] tracking-wide leading-relaxed">
          Upload a new PDF to replace the current CV. The file is served at{" "}
          <code className="font-mono text-xs bg-[var(--panel)] border border-[var(--ghost)] px-1">/api/cv</code>
          {" "}and linked from the DOWNLOAD CV button on the public page.
        </p>

        {/* Current CV link */}
        <div className="border-brutal bg-[var(--panel)] p-4">
          <p className="font-mono text-xs font-bold tracking-widest mb-2">CURRENT CV</p>
          <a
            href={cvDownloadUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs flash-blue focus-brutal break-all"
          >
            {cvDownloadUrl()}
          </a>
          {uploadedAt && (
            <p className="font-mono text-xs text-[var(--success)] mt-2">
              Last uploaded: {uploadedAt}
            </p>
          )}
        </div>

        {/* Upload */}
        <div>
          <p className="font-mono text-xs font-bold tracking-widest mb-2">UPLOAD NEW CV</p>
          <div className="border-brutal bg-[var(--panel)] p-4 space-y-4">
            <label
              htmlFor={inputId}
              className="btn-brutal btn-brutal-panel focus-brutal inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload size={13} aria-hidden="true" />
              {file ? file.name : "CHOOSE PDF"}
            </label>
            <input
              id={inputId}
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
                  disabled={uploading}
                  className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Upload size={13} aria-hidden="true" />
                  {uploading ? "UPLOADING…" : "UPLOAD"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
