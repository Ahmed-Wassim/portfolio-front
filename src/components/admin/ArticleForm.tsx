"use client"

import { useId, useState, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { createArticle, updateArticle, uploadUrl } from "@/lib/api"
import { PlaceholderBlock } from "@/components/public/PlaceholderBlock"
import { MarkdownEditor } from "@/components/admin/MarkdownEditor"
import { TagInput } from "@/components/admin/TagInput"
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning"
import { useKeyboardSubmit } from "@/hooks/useKeyboardSubmit"
import type { Article } from "@/types/api"

const ARTICLES_KEY = "/api/admin/articles"

const schema = z.object({
  title: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  content: z.string(),
  published: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ArticleFormProps {
  article?: Article
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const formRef = useRef<HTMLFormElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    article?.image ? uploadUrl(article.image) : null
  )
  const [slugError, setSlugError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(article?.tags ?? [])

  const titleId = useId()
  const slugId = useId()
  const contentId = useId()
  const publishedId = useId()
  const imageId = useId()
  const tagsId = useId()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      content: article?.content ?? "",
      published: article?.published ?? false,
    },
  })

  // The editor is a controlled component, so content is tracked via useWatch
  // rather than registered on an input element.
  const content = useWatch({ control, name: "content" })

  useUnsavedWarning(isDirty && !isSubmitting)
  useKeyboardSubmit(formRef)

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!article) {
      setValue("slug", autoSlug(e.target.value), { shouldValidate: false })
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported image format.")
      e.target.value = ""
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    setSlugError(null)
    const input = { ...values, image: imageFile ?? undefined, tags }
    const result = article
      ? await updateArticle(article.id, input)
      : await createArticle(input)

    if (result.ok) {
      toast.success(article ? "Article updated." : "Article created.")
      await mutate(ARTICLES_KEY)
      router.push("/admin/articles")
    } else if (result.status === 409 || result.error === "slug already exists") {
      setSlugError("This slug is already taken.")
    } else {
      toast.error(result.error || "Failed to save article.")
    }
  }

  return (
    // The editor gets the full form width (so split view has room); the metadata
    // fields stay in a narrower column so inputs and the cover don't stretch.
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-6xl">
      <div className="max-w-2xl space-y-5">
        {/* Image */}
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
            {...register("title", { onChange: handleTitleChange })}
            className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
          />
        </Field>

        <Field id={slugId} label="SLUG" error={errors.slug?.message ?? slugError ?? undefined}>
          <input
            id={slugId}
            disabled={isSubmitting}
            {...register("slug")}
            className={`w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50 ${slugError ? "border-[var(--danger)]" : ""}`}
            aria-invalid={!!(errors.slug || slugError)}
          />
        </Field>

        <TagInput
          id={tagsId}
          tags={tags}
          onChange={setTags}
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-3">
          <input
            id={publishedId}
            type="checkbox"
            disabled={isSubmitting}
            {...register("published")}
            className="w-4 h-4 border-brutal focus-brutal"
          />
          <label htmlFor={publishedId} className="font-mono text-xs font-bold tracking-widest">
            PUBLISHED
          </label>
        </div>
      </div>

      <div className="mt-5">
        <MarkdownEditor
          id={contentId}
          value={content ?? ""}
          onChange={(v) => setValue("content", v, { shouldDirty: true, shouldValidate: true })}
          disabled={isSubmitting}
          error={errors.content?.message}
        />
      </div>

      <div className="max-w-2xl flex gap-3 mt-5 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
        >
          {isSubmitting ? "SAVING…" : article ? "UPDATE" : "CREATE"}
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
