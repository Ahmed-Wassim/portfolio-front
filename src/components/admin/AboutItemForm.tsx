"use client"

import { useId, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { createAboutItem, updateAboutItem, ADMIN_ABOUT_KEY } from "@/lib/api"
import type { AboutItem } from "@/types/api"

const schema = z.object({
  title: z.string(),
  content: z.string().min(1, "Content is required"),
  sort: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface AboutItemFormProps {
  item?: AboutItem
  /** Pre-computed next sort value for new items (max existing + 1) */
  nextSort?: number
}

export function AboutItemForm({ item, nextSort = 0 }: AboutItemFormProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const titleId = useId()
  const contentId = useId()
  const sortId = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? "",
      content: item?.content ?? "",
      sort: item?.sort ?? nextSort,
    },
  })

  // When nextSort resolves from SWR (async), update the sort field if this is a new item
  useEffect(() => {
    if (!item) {
      reset((prev) => ({ ...prev, sort: nextSort }))
    }
  }, [nextSort, item, reset])

  async function onSubmit(values: FormValues) {
    const input = {
      title: values.title || undefined,
      content: values.content,
      sort: values.sort,
    }

    const result = item
      ? await updateAboutItem(item.id, input)
      : await createAboutItem(input)

    if (result.ok) {
      toast.success(item ? "About item updated." : "About item created.")
      await mutate(ADMIN_ABOUT_KEY)
      router.push("/admin/about")
    } else {
      toast.error(result.error || "Failed to save.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 max-w-xl">
      {/* Title (optional) */}
      <div>
        <label
          htmlFor={titleId}
          className="block font-mono text-xs font-bold tracking-widest mb-1"
        >
          TITLE <span className="text-[var(--muted)] font-normal">(optional)</span>
        </label>
        <input
          id={titleId}
          disabled={isSubmitting}
          {...register("title")}
          placeholder="e.g. Background"
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor={contentId}
          className="block font-mono text-xs font-bold tracking-widest mb-1"
        >
          CONTENT
        </label>
        <textarea
          id={contentId}
          rows={5}
          disabled={isSubmitting}
          {...register("content")}
          placeholder="Write a paragraph about yourself…"
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none resize-y disabled:opacity-50"
          aria-invalid={!!errors.content}
        />
        {errors.content && (
          <p className="font-mono text-xs text-[var(--danger)] mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Sort order */}
      <div>
        <label
          htmlFor={sortId}
          className="block font-mono text-xs font-bold tracking-widest mb-1"
        >
          SORT ORDER
        </label>
        <input
          id={sortId}
          type="number"
          min={0}
          disabled={isSubmitting}
          {...register("sort", { valueAsNumber: true })}
          className="w-24 border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
        <p className="font-mono text-xs text-[var(--muted)] mt-1">
          Lower numbers appear first (0, 1, 2…)
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
        >
          {isSubmitting ? "SAVING…" : item ? "UPDATE" : "CREATE"}
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
