"use client"

import { useRef, useState } from "react"
import { useWatch } from "react-hook-form"
import { z } from "zod"

import { FormShell } from "@/components/admin/FormShell"
import { ImagePicker } from "@/components/admin/ImagePicker"
import { MarkdownEditor } from "@/components/admin/MarkdownEditor"
import { TagInput } from "@/components/admin/TagInput"
import { CheckboxField, TextField } from "@/components/ui/Field"
import { useCrudForm } from "@/hooks/useCrudForm"
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning"
import { useKeyboardSubmit } from "@/hooks/useKeyboardSubmit"
import {
  ADMIN_ARTICLES_KEY,
  createArticle,
  updateArticle,
} from "@/lib/api"
import type { Article, ArticleInput } from "@/types/api"

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

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface ArticleFormProps {
  article?: Article
}

export function ArticleForm({ article }: ArticleFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>(article?.tags ?? [])
  const [slugError, setSlugError] = useState<string | null>(null)

  const { form, submit } = useCrudForm<FormValues, ArticleInput, Article>({
    schema,
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      content: article?.content ?? "",
      published: article?.published ?? false,
    },
    editingId: article?.id,
    create: createArticle,
    update: (_id, input) => updateArticle(article!.id, input),
    toInput: (values) => ({ ...values, image: imageFile, tags }),
    listKeys: [ADMIN_ARTICLES_KEY],
    redirectTo: "/admin/articles",
    labels: { create: "Article created.", update: "Article updated." },
    // A slug collision is shown on the field rather than as a toast, so the
    // user can see which field to change.
    onError: (result) => {
      if (result.status !== 409 && result.error !== "slug already exists") return
      setSlugError("This slug is already taken.")
      return true
    },
  })

  const { control, register, setValue, formState } = form

  // The editor is a controlled component, so content is tracked via useWatch
  // rather than registered on an input element.
  const content = useWatch({ control, name: "content" })

  const { errors, isSubmitting, isDirty } = formState
  useUnsavedWarning(isDirty && !isSubmitting)
  useKeyboardSubmit(formRef)

  return (
    // The editor gets the full form width (so split view has room); the metadata
    // fields stay in a narrower column so inputs and the cover don't stretch.
    <FormShell
      onSubmit={submit}
      isSubmitting={isSubmitting}
      submitLabel={article ? "UPDATE" : "CREATE"}
      formRef={formRef}
      className="max-w-6xl"
    >
      <div className="max-w-2xl space-y-5">
        <ImagePicker
          existing={article?.image}
          file={imageFile}
          onChange={setImageFile}
        />

        <TextField
          label="TITLE"
          disabled={isSubmitting}
          error={errors.title?.message}
          // Derive the slug from the title while creating, but leave an
          // existing article's slug alone once it has been published.
          {...register("title", {
            onChange: (e: { target: { value: string } }) => {
              setSlugError(null)
              if (!article) setValue("slug", autoSlug(e.target.value))
            },
          })}
        />

        <TextField
          label="SLUG"
          disabled={isSubmitting}
          error={errors.slug?.message ?? slugError ?? undefined}
          aria-invalid={!!(errors.slug || slugError)}
          {...register("slug", { onChange: () => setSlugError(null) })}
        />

        <TagInput
          tags={tags}
          onChange={setTags}
          disabled={isSubmitting}
        />

        <CheckboxField
          label="PUBLISHED"
          disabled={isSubmitting}
          {...register("published")}
        />
      </div>

      <div className="mt-5">
        <MarkdownEditor
          value={content ?? ""}
          onChange={(v) => setValue("content", v, { shouldDirty: true, shouldValidate: true })}
          disabled={isSubmitting}
          error={errors.content?.message}
        />
      </div>
    </FormShell>
  )
}
