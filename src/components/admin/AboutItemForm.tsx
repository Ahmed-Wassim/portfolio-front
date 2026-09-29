"use client"

import useSWR from "swr"
import { z } from "zod"

import { FormShell } from "@/components/admin/FormShell"
import { TextAreaField, TextField, NumberField } from "@/components/ui/Field"
import { useCrudForm, useNextSort, useNextSortValue } from "@/hooks/useCrudForm"
import {
  ADMIN_ABOUT_KEY,
  createAboutItem,
  swrFetcher,
  updateAboutItem,
} from "@/lib/api"
import type { AboutItem } from "@/types/api"

const schema = z.object({
  title: z.string(),
  content: z.string().min(1, "Content is required"),
  sort: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface AboutItemFormProps {
  item?: AboutItem
}

export function AboutItemForm({ item }: AboutItemFormProps) {
  // Only needed when creating: new items append to the end of the list.
  const { data: items } = useSWR<AboutItem[]>(ADMIN_ABOUT_KEY, swrFetcher, {
    shouldRetryOnError: false,
  })
  const nextSort = useNextSortValue(items, "sort")

  const { form, submit } = useCrudForm<FormValues, FormValues, AboutItem>({
    schema,
    defaultValues: {
      title: item?.title ?? "",
      content: item?.content ?? "",
      sort: item?.sort ?? nextSort,
    },
    editingId: item?.id,
    create: createAboutItem,
    update: (_id, input) => updateAboutItem(item!.id, input),
    listKeys: [ADMIN_ABOUT_KEY],
    redirectTo: "/admin/about",
    labels: { create: "About item created.", update: "About item updated." },
  })

  const { register, formState } = form

  useNextSort(form, "sort", nextSort, !item)

  const { errors, isSubmitting } = formState

  return (
    <FormShell onSubmit={submit} isSubmitting={isSubmitting} submitLabel={item ? "UPDATE" : "CREATE"}>
      <TextField
        label="TITLE"
        hint="(optional)"
        disabled={isSubmitting}
        error={errors.title?.message}
        placeholder="e.g. Background"
        {...register("title")}
      />

      <TextAreaField
        label="CONTENT"
        rows={5}
        disabled={isSubmitting}
        error={errors.content?.message}
        placeholder="Write a paragraph about yourself…"
        aria-invalid={!!errors.content}
        {...register("content")}
      />

      <NumberField
        label="SORT ORDER"
        disabled={isSubmitting}
        hint="(lower first)"
        error={errors.sort?.message}
        {...register("sort", { valueAsNumber: true })}
      />
    </FormShell>
  )
}
