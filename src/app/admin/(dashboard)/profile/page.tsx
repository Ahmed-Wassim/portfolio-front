"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"
import useSWR, { useSWRConfig } from "swr"

import { PageHeader } from "@/components/admin/PageHeader"
import { FormSkeleton } from "@/components/admin/FormSkeleton"
import { TextField } from "@/components/ui/Field"
import { ADMIN_PROFILE_KEY, swrFetcher, updateProfile } from "@/lib/api"
import type { Profile } from "@/types/api"

const schema = z.object({
  tagline: z.string().min(1, "Required"),
})

type FormValues = z.infer<typeof schema>

export default function AdminProfilePage() {
  const { data: profile, isLoading } = useSWR<Profile>(
    ADMIN_PROFILE_KEY,
    swrFetcher,
    { shouldRetryOnError: false },
  )
  const { mutate } = useSWRConfig()

  // Seeded once from the fetched profile, then owned by this form. Syncing it
  // in an effect would wipe the user's edits on every background revalidate.
  const [stack, setStack] = useState<string[]>(profile?.stack ?? [])
  const [stackInput, setStackInput] = useState("")
  const [seededFor, setSeededFor] = useState<number | null>(null)
  if (profile && seededFor === null) {
    setSeededFor(profile.id)
    setStack(profile.stack)
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tagline: profile?.tagline ?? "" },
  })

  function addStackItem() {
    const val = stackInput.trim()
    if (!val || stack.includes(val)) return
    setStack((prev) => [...prev, val])
    setStackInput("")
  }

  function removeStackItem(item: string) {
    setStack((prev) => prev.filter((s) => s !== item))
  }

  async function onSubmit(values: FormValues) {
    if (stack.length === 0) {
      toast.error("Add at least one stack item.")
      return
    }
    const result = await updateProfile({ tagline: values.tagline, stack })
    if (result.ok) {
      toast.success("Profile updated.")
      mutate(ADMIN_PROFILE_KEY)
    } else {
      toast.error(result.error || "Failed to update profile.")
    }
  }

  if (isLoading) return <FormSkeleton />

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ADMIN" title="PROFILE" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-xl">
        <TextField
          label="TAGLINE"
          disabled={isSubmitting}
          error={errors.tagline?.message}
          {...register("tagline")}
        />

        {/* Stack */}
        <div>
          <p className="font-mono text-xs font-bold tracking-widest mb-2">STACK</p>

          {/* Current items */}
          <div className="flex flex-wrap gap-2 mb-3">
            {stack.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 border-brutal px-2 py-1 font-mono text-xs font-bold bg-[var(--panel)]"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeStackItem(item)}
                  className="text-[var(--danger)] focus-brutal"
                  aria-label={`Remove ${item}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {stack.length === 0 && (
              <span className="font-mono text-xs text-[var(--muted)]">No items yet.</span>
            )}
          </div>

          {/* Add item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addStackItem() }
              }}
              placeholder="e.g. Go"
              className="flex-1 border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none"
            />
            <button
              type="button"
              onClick={addStackItem}
              className="btn-brutal btn-brutal-panel focus-brutal inline-flex items-center gap-1 px-3"
            >
              <Plus size={13} aria-hidden="true" />
              ADD
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
        >
          {isSubmitting ? "SAVING…" : "SAVE PROFILE"}
        </button>
      </form>
    </div>
  )
}
