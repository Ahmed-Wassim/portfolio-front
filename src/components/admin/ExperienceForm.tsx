"use client"

import useSWR from "swr"
import { z } from "zod"

import { FormShell } from "@/components/admin/FormShell"
import { NumberField, TextAreaField, TextField } from "@/components/ui/Field"
import { useCrudForm, useNextSort, useNextSortValue } from "@/hooks/useCrudForm"
import {
  ADMIN_EXPERIENCES_KEY,
  createExperience,
  swrFetcher,
  updateExperience,
} from "@/lib/api"
import type { Experience, ExperienceInput } from "@/types/api"

const schema = z.object({
  company: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  period: z.string().min(1, "Required"),
  description: z.string(),
  sort_order: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

export function ExperienceForm({ item }: { item?: Experience }) {
  const { data: items } = useSWR<Experience[]>(ADMIN_EXPERIENCES_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })
  const nextSort = useNextSortValue(items, "sort_order")

  const { form, submit } = useCrudForm<FormValues, ExperienceInput, Experience>({
    schema,
    defaultValues: {
      company: item?.company ?? "",
      role: item?.role ?? "",
      period: item?.period ?? "",
      description: item?.description ?? "",
      sort_order: item?.sort_order ?? nextSort,
    },
    editingId: item?.id,
    create: createExperience,
    update: (_id, input) => updateExperience(item!.id, input),
    toInput: (values) => ({
      ...values,
      description: values.description || undefined,
    }),
    listKeys: [ADMIN_EXPERIENCES_KEY],
    redirectTo: "/admin/experiences",
    labels: { create: "Experience created.", update: "Experience updated." },
  })

  const { register, formState, reset } = form

  useNextSort(reset as never, "sort_order", nextSort, !item)

  const { errors, isSubmitting } = formState

  return (
    <FormShell onSubmit={submit} isSubmitting={isSubmitting} submitLabel={item ? "UPDATE" : "CREATE"}>
      <TextField
        label="COMPANY"
        disabled={isSubmitting}
        error={errors.company?.message}
        aria-invalid={!!errors.company}
        {...register("company")}
      />

      <TextField
        label="ROLE"
        disabled={isSubmitting}
        error={errors.role?.message}
        aria-invalid={!!errors.role}
        {...register("role")}
      />

      <TextField
        label="PERIOD"
        placeholder="e.g. 2025 — PRESENT"
        disabled={isSubmitting}
        error={errors.period?.message}
        aria-invalid={!!errors.period}
        {...register("period")}
      />

      <TextAreaField
        label="DESCRIPTION"
        hint="(optional)"
        rows={3}
        disabled={isSubmitting}
        {...register("description")}
      />

      <NumberField
        label="SORT ORDER"
        disabled={isSubmitting}
        {...register("sort_order", { valueAsNumber: true })}
      />
    </FormShell>
  )
}
