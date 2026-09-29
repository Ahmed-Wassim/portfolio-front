"use client"

import useSWR from "swr"
import { z } from "zod"

import { FormShell } from "@/components/admin/FormShell"
import { NumberField, TextField } from "@/components/ui/Field"
import { useCrudForm, useNextSort, useNextSortValue } from "@/hooks/useCrudForm"
import {
  ADMIN_SOCIALS_KEY,
  createSocial,
  swrFetcher,
  updateSocial,
} from "@/lib/api"
import type { Social, SocialInput } from "@/types/api"

const schema = z.object({
  platform: z.string().min(1, "Required"),
  // Free-form: full URL, phone number, or handle — normalized to a working href on submit
  url: z.string().min(1, "Required"),
  icon: z.string(),
  sort_order: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

/** Normalizes a bare email or number into a working href. */
function toHref(raw: string): string {
  const value = raw.trim()
  if (z.string().email().safeParse(value).success) return `mailto:${value}`
  if (/^[+\d][\d\s\-().]{4,}$/.test(value)) {
    return `tel:${value.replace(/[\s\-.()]/g, "")}`
  }
  return value
}

export function SocialForm({ item }: { item?: Social }) {
  const { data: items } = useSWR<Social[]>(ADMIN_SOCIALS_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })
  const nextSort = useNextSortValue(items, "sort_order")

  const { form, submit } = useCrudForm<FormValues, SocialInput, Social>({
    schema,
    defaultValues: {
      platform: item?.platform ?? "",
      url: item?.url ?? "",
      icon: item?.icon ?? "",
      sort_order: item?.sort_order ?? nextSort,
    },
    editingId: item?.id,
    create: createSocial,
    update: (_id, input) => updateSocial(item!.id, input),
    toInput: (values) => ({
      ...values,
      url: toHref(values.url),
      icon: values.icon || undefined,
    }),
    listKeys: [ADMIN_SOCIALS_KEY],
    redirectTo: "/admin/socials",
    labels: { create: "Social created.", update: "Social updated." },
  })

  const { register, formState } = form

  useNextSort(form, "sort_order", nextSort, !item)

  const { errors, isSubmitting } = formState

  return (
    <FormShell onSubmit={submit} isSubmitting={isSubmitting} submitLabel={item ? "UPDATE" : "CREATE"}>
      <TextField
        label="PLATFORM"
        placeholder="e.g. GitHub"
        disabled={isSubmitting}
        error={errors.platform?.message}
        aria-invalid={!!errors.platform}
        {...register("platform")}
      />

      <TextField
        label="LINK / NUMBER"
        inputMode="url"
        placeholder="https://... or +20..."
        disabled={isSubmitting}
        error={errors.url?.message}
        aria-invalid={!!errors.url}
        {...register("url")}
      />

      <TextField
        label="ICON"
        hint="(optional, e.g. github)"
        disabled={isSubmitting}
        {...register("icon")}
      />

      <NumberField
        label="SORT ORDER"
        disabled={isSubmitting}
        {...register("sort_order", { valueAsNumber: true })}
      />
    </FormShell>
  )
}
