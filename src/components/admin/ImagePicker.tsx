"use client"

import { useEffect, useId, useMemo } from "react"
import { toast } from "sonner"

import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { uploadUrl } from "@/lib/api"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

interface ImagePickerProps {
  /** Filename of the already-saved image, if any. */
  existing?: string
  /** Newly selected file, held by the parent form. */
  file: File | null
  onChange: (file: File | null) => void
  label?: string
}

/**
 * Image chooser with preview, shared by the project and article forms.
 *
 * The preview URL is derived rather than stored, so no effect is needed to keep
 * it in sync with the selected file. The one effect only revokes the previous
 * object URL, which is external cleanup rather than state synchronisation.
 */
export function ImagePicker({
  existing,
  file,
  onChange,
  label = "IMAGE",
}: ImagePickerProps) {
  const inputId = useId()

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : existing ? uploadUrl(existing) : null),
    [file, existing],
  )

  useEffect(() => {
    if (!preview?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    if (!IMAGE_TYPES.includes(picked.type)) {
      toast.error("Unsupported image format. Use JPG, PNG, WEBP, or GIF.")
      e.target.value = ""
      return
    }
    onChange(picked)
  }

  return (
    <div>
      <p className="font-mono text-xs font-bold tracking-widest mb-1">{label}</p>
      <div className="border-brutal mb-3 overflow-hidden w-full aspect-video">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <PlaceholderBlock aspect="aspect-video" className="w-full" />
        )}
      </div>
      <label
        htmlFor={inputId}
        className="btn-brutal btn-brutal-panel focus-brutal text-xs cursor-pointer"
      >
        {file ? file.name : "CHOOSE IMAGE"}
      </label>
      <input
        id={inputId}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  )
}
