"use client"

import { useEffect, useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { createSocial, updateSocial, ADMIN_SOCIALS_KEY } from "@/lib/api"
import type { Social } from "@/types/api"

const schema = z.object({
  platform: z.string().min(1, "Required"),
  // Free-form: full URL, phone number, or handle — normalized to a working href on submit
  url: z.string().min(1, "Required"),
  icon: z.string(),
  sort_order: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

export function SocialForm({ item, nextSort = 0 }: { item?: Social; nextSort?: number }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const platformId = useId()
  const urlId = useId()
  const iconId = useId()
  const sortId = useId()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: item?.platform ?? "",
      url: item?.url ?? "",
      icon: item?.icon ?? "",
      sort_order: item?.sort_order ?? nextSort,
    },
  })

  // When nextSort resolves from SWR (async), update the sort field if this is a new item
  useEffect(() => {
    if (!item) {
      reset((prev) => ({ ...prev, sort_order: nextSort }))
    }
  }, [nextSort, item, reset])

  async function onSubmit(values: FormValues) {
    const rawUrl = values.url.trim()
    // Normalize to a working href: bare email → mailto:, bare number → tel:, else as-is
    let url = rawUrl
    if (z.string().email().safeParse(rawUrl).success) {
      url = `mailto:${rawUrl}`
    } else if (/^[+\d][\d\s\-().]{4,}$/.test(rawUrl)) {
      url = `tel:${rawUrl.replace(/[\s\-.()]/g, "")}`
    }
    const input = { ...values, url, icon: values.icon || undefined }
    const result = item
      ? await updateSocial(item.id, input)
      : await createSocial(input)

    if (result.ok) {
      toast.success(item ? "Social updated." : "Social created.")
      await mutate(ADMIN_SOCIALS_KEY)
      router.push("/admin/socials")
    } else {
      toast.error(result.error || "Failed to save.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 max-w-xl">
      <div>
        <label htmlFor={platformId} className="block font-mono text-xs font-bold tracking-widest mb-1">PLATFORM</label>
        <input
          id={platformId}
          disabled={isSubmitting}
          placeholder="e.g. GitHub"
          {...register("platform")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
          aria-invalid={!!errors.platform}
        />
        {errors.platform && <p className="font-mono text-xs text-[var(--danger)] mt-1">{errors.platform.message}</p>}
      </div>

      <div>
        <label htmlFor={urlId} className="block font-mono text-xs font-bold tracking-widest mb-1">LINK / NUMBER</label>
        <input
          id={urlId}
          type="text"
          inputMode="url"
          disabled={isSubmitting}
          placeholder="https://... or +20..."
          {...register("url")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
          aria-invalid={!!errors.url}
        />
        {errors.url && <p className="font-mono text-xs text-[var(--danger)] mt-1">{errors.url.message}</p>}
      </div>

      <div>
        <label htmlFor={iconId} className="block font-mono text-xs font-bold tracking-widest mb-1">
          ICON <span className="text-[var(--muted)] font-normal">(optional, e.g. github)</span>
        </label>
        <input
          id={iconId}
          disabled={isSubmitting}
          {...register("icon")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor={sortId} className="block font-mono text-xs font-bold tracking-widest mb-1">SORT ORDER</label>
        <input
          id={sortId}
          type="number"
          min={0}
          disabled={isSubmitting}
          {...register("sort_order", { valueAsNumber: true })}
          className="w-24 border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50">
          {isSubmitting ? "SAVING…" : item ? "UPDATE" : "CREATE"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-brutal btn-brutal-panel focus-brutal">
          CANCEL
        </button>
      </div>
    </form>
  )
}
