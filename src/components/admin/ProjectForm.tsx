"use client"

import { useId, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { createProject, updateProject, uploadUrl, ADMIN_PROJECTS_KEY } from "@/lib/api"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { TagInput } from "@/components/admin/TagInput"
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning"
import { useKeyboardSubmit } from "@/hooks/useKeyboardSubmit"
import type { Project } from "@/types/api"

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  link: z.string().url("Must be a valid URL").or(z.literal("")),
  github: z.string().url("Must be a valid URL").or(z.literal("")),
  featured: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const formRef = useRef<HTMLFormElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    project?.image ? uploadUrl(project.image) : null
  )
  const [tags, setTags] = useState<string[]>(project?.tags ?? [])

  const titleId = useId()
  const descId = useId()
  const linkId = useId()
  const githubId = useId()
  const featuredId = useId()
  const imageId = useId()
  const tagsId = useId()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      link: project?.link ?? "",
      github: project?.github ?? "",
      featured: project?.featured ?? false,
    },
  })

  useUnsavedWarning(isDirty && !isSubmitting)
  useKeyboardSubmit(formRef)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported image format. Use JPG, PNG, WEBP, or GIF.")
      e.target.value = ""
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    const input = { ...values, image: imageFile ?? undefined, tags }
    const result = project
      ? await updateProject(project.id, input)
      : await createProject(input)

    if (result.ok) {
      toast.success(project ? "Project updated." : "Project created.")
      await mutate(ADMIN_PROJECTS_KEY)
      router.push("/admin/projects")
    } else {
      toast.error(result.error || "Failed to save project.")
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 max-w-xl">
      {/* Image preview */}
      <div>
        <p className="font-mono text-xs font-bold tracking-widest mb-1">IMAGE</p>
        <div className="border-brutal mb-3 overflow-hidden w-full aspect-video">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <PlaceholderBlock aspect="aspect-video" className="w-full" />
          )}
        </div>
        <label htmlFor={imageId} className="btn-brutal btn-brutal-panel focus-brutal text-xs cursor-pointer">
          {imageFile ? imageFile.name : "CHOOSE IMAGE"}
        </label>
        <input
          id={imageId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleImageChange}
        />
      </div>

      <Field id={titleId} label="TITLE" error={errors.title?.message}>
        <input
          id={titleId}
          disabled={isSubmitting}
          {...register("title")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </Field>

      <Field id={descId} label="DESCRIPTION" error={errors.description?.message}>
        <textarea
          id={descId}
          rows={4}
          disabled={isSubmitting}
          {...register("description")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none resize-y disabled:opacity-50"
        />
      </Field>

      <Field id={linkId} label="LIVE LINK" error={errors.link?.message}>
        <input
          id={linkId}
          type="url"
          disabled={isSubmitting}
          {...register("link")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </Field>

      <Field id={githubId} label="GITHUB" error={errors.github?.message}>
        <input
          id={githubId}
          type="url"
          disabled={isSubmitting}
          {...register("github")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </Field>

      <div className="flex items-center gap-3">
        <input
          id={featuredId}
          type="checkbox"
          disabled={isSubmitting}
          {...register("featured")}
          className="w-4 h-4 border-brutal focus-brutal"
        />
        <label htmlFor={featuredId} className="font-mono text-xs font-bold tracking-widest">
          FEATURED
        </label>
      </div>

      <TagInput
        id={tagsId}
        tags={tags}
        onChange={setTags}
        disabled={isSubmitting}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
          title="Cmd/Ctrl + Enter"
        >
          {isSubmitting ? "SAVING…" : project ? "UPDATE" : "CREATE"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-brutal btn-brutal-panel focus-brutal"
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}

function Field({
  id, label, error, children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs font-bold tracking-widest mb-1">
        {label}
      </label>
      {children}
      {error && <p className="font-mono text-xs text-[var(--danger)] mt-1">{error}</p>}
    </div>
  )
}
