"use client"

import { useEffect } from "react"
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import type { z } from "zod"

import type { ApiResult } from "@/types/api"

type Failed<T> = Extract<ApiResult<T>, { ok: false }>

interface UseCrudFormOptions<TValues extends FieldValues, TInput, TResult> {
  // z.ZodType's output/input generics are contravariant, so a plain
  // z.ZodType<TValues> rejects the concrete schema objects at call sites.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  schema: z.ZodType<TValues, any, any>
  /* eslint-enable @typescript-eslint/no-explicit-any */
  defaultValues: TValues
  create: (input: TInput) => Promise<ApiResult<TResult>>
  /** Called with the edited record's id when editing, otherwise undefined. */
  update: (id: number | undefined, input: TInput) => Promise<ApiResult<TResult>>
  /** Presence of the record being edited selects update over create. */
  editingId?: number
  /** Maps form values to the API payload. Use for multipart or field renames. */
  toInput?: (values: TValues) => TInput
  /** SWR keys to revalidate on success. */
  listKeys: string[]
  /** Where to navigate after a successful save. */
  redirectTo: string
  labels: { create: string; update: string }
  /**
   * Claims a failure to handle it inline (e.g. on a field) instead of as a
   * toast. Return true to suppress the toast.
   */
  onError?: (result: Failed<TResult>) => boolean | void
}

/**
 * The create-or-update submit logic shared by every admin form.
 *
 * Each form previously branched on `item ? update : create`, built its own
 * toast, and revalidated its own keys, so a new form could easily forget the
 * redirect or the revalidation.
 */
export function useCrudForm<TValues extends FieldValues, TInput, TResult>({
  schema,
  defaultValues,
  create,
  update,
  editingId,
  toInput,
  listKeys,
  redirectTo,
  labels,
  onError,
}: UseCrudFormOptions<TValues, TInput, TResult>) {
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const form = useForm<TValues>({
    resolver: zodResolver(schema),
    // RHF widens TValues to FieldValues internally, so its defaultValues type
    // will not accept a bare generic. Narrow, not `never` — a broad cast here
    // previously hid a real bug in useNextSort.
    defaultValues: defaultValues as DefaultValues<TValues>,
  })

  const submit: SubmitHandler<TValues> = async (values) => {
    const input = toInput ? toInput(values) : (values as unknown as TInput)
    const isEdit = editingId !== undefined
    const result = isEdit ? await update(editingId, input) : await create(input)

    if (result.ok) {
      toast.success(isEdit ? labels.update : labels.create)
      await Promise.all(listKeys.map((key) => mutate(key)))
      router.push(redirectTo)
      return
    }

    if (onError?.(result) === true) return
    toast.error(result.error || "Failed to save.")
  }

  return {
    form,
    // Same widening as above: the handler is over TValues, RHF wants the
    // widened FieldValues. Cast to the call-site-facing shape so FormShell
    // gets a plain submit function.
    submit: form.handleSubmit(submit as SubmitHandler<FieldValues>) as (
      e?: React.BaseSyntheticEvent,
    ) => Promise<void>,
  }
}

/**
 * Keeps a sort field in step with `nextSort` once the existing collection
 * resolves from SWR. Without this, a new record briefly shows 0 before the list
 * arrives, and submits 0.
 *
 * Takes the form handle (not its `reset` function) and is generic over the form
 * values, so each call site keeps its own field types instead of needing a cast.
 */
export function useNextSort<TValues extends FieldValues>(
  form: Pick<UseFormReturn<TValues>, "reset">,
  field: string,
  nextSort: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (enabled) {
      form.reset((prev: TValues) => ({ ...prev, [field]: nextSort }))
    }
  }, [nextSort, field, enabled, form])
}

/** max(sortField) + 1, or 0 for an empty collection. */
export function useNextSortValue<T>(items: T[] | undefined, field: keyof T) {
  if (!items?.length) return 0
  return Math.max(...items.map((i) => Number(i[field]) || 0)) + 1
}
