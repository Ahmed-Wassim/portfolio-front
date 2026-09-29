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

  if (isLoading || !profile) return <FormSkeleton />

  return (
    <div className="p-4 sm:p-8">
      <PageHeader kicker="ADMIN" title="PROFILE" />
      {/* Mounted only once the profile has loaded, so react-hook-form captures
          the real tagline as its default value. Seeding it from a parent that
          renders first with `profile === undefined` leaves the field empty —
          defaultValues are only read on mount. */}
      <ProfileForm profile={profile} />
    </div>
  )
}

function ProfileForm({ profile }: { profile: Profile }) {
  const { mutate } = useSWRConfig()

  // Guarded on the shape: a bad payload must not leave these undefined and
  // crash the render.
  const initialStack = Array.isArray(profile.stack) ? profile.stack : []

  const [stack, setStack] = useState<string[]>(initialStack)
  const [stackInput, setStackInput] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tagline: profile.tagline },
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
      await mutate(ADMIN_PROFILE_KEY)
    } else {
      toast.error(result.error || "Failed to update profile.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-xl">
      <TextField
        label="TAGLINE"
        disabled={isSubmitting}
        error={errors.tagline?.message}
        {...register("tagline")}
      />

      <div>
        <p className="font-mono text-xs font-bold tracking-widest mb-2">STACK</p>

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
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
          {stack.length === 0 && (
            <span className="font-mono text-xs text-[var(--muted)]">No items yet.</span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Add a stack item"
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addStackItem()
              }
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
  )
}
