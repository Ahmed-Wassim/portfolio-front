"use client"

import { useEffect, useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { createExperience, updateExperience, ADMIN_EXPERIENCES_KEY } from "@/lib/api"
import type { Experience } from "@/types/api"

const schema = z.object({
  company: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  period: z.string().min(1, "Required"),
  description: z.string(),
  sort_order: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

export function ExperienceForm({ item, nextSort = 0 }: { item?: Experience; nextSort?: number }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const companyId = useId()
  const roleId = useId()
  const periodId = useId()
  const descId = useId()
  const sortId = useId()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: item?.company ?? "",
      role: item?.role ?? "",
      period: item?.period ?? "",
      description: item?.description ?? "",
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
    const input = { ...values, description: values.description || undefined }
    const result = item
      ? await updateExperience(item.id, input)
      : await createExperience(input)

    if (result.ok) {
      toast.success(item ? "Experience updated." : "Experience created.")
      await mutate(ADMIN_EXPERIENCES_KEY)
      router.push("/admin/experiences")
    } else {
      toast.error(result.error || "Failed to save.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 max-w-xl">
      {[
        { id: companyId, label: "COMPANY", key: "company" as const },
        { id: roleId, label: "ROLE", key: "role" as const },
        { id: periodId, label: "PERIOD", key: "period" as const, placeholder: "e.g. 2025 — PRESENT" },
      ].map(({ id, label, key, placeholder }) => (
        <div key={key}>
          <label htmlFor={id} className="block font-mono text-xs font-bold tracking-widest mb-1">{label}</label>
          <input
            id={id}
            disabled={isSubmitting}
            placeholder={placeholder}
            {...register(key)}
            className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
            aria-invalid={!!errors[key]}
          />
          {errors[key] && <p className="font-mono text-xs text-[var(--danger)] mt-1">{errors[key]?.message}</p>}
        </div>
      ))}

      <div>
        <label htmlFor={descId} className="block font-mono text-xs font-bold tracking-widest mb-1">
          DESCRIPTION <span className="text-[var(--muted)] font-normal">(optional)</span>
        </label>
        <textarea
          id={descId}
          rows={3}
          disabled={isSubmitting}
          {...register("description")}
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none resize-y disabled:opacity-50"
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
