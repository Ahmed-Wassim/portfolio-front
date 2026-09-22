"use client"

import { useId, useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  swrFetcher,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  ADMIN_SKILL_CATEGORIES_KEY,
  ADMIN_SKILLS_KEY,
} from "@/lib/api"
import { EmptyState } from "@/components/admin/EmptyState"
import { ApiErrorBanner } from "@/components/admin/ApiErrorBanner"
import type { SkillCategory, Skill } from "@/types/api"

const catSchema = z.object({ name: z.string().min(1, "Required"), sort: z.number() })
const skillSchema = z.object({
  name: z.string().min(1, "Required"),
  sort: z.number(),
})

type CatValues = z.infer<typeof catSchema>
type SkillValues = z.infer<typeof skillSchema>

export default function AdminSkillsPage() {
  const { mutate } = useSWRConfig()
  const { data: categories, isLoading, error: catError } = useSWR<SkillCategory[]>(
    ADMIN_SKILL_CATEGORIES_KEY, swrFetcher, { shouldRetryOnError: false }
  )
  const { data: skills } = useSWR<Skill[]>(
    ADMIN_SKILLS_KEY, swrFetcher, { shouldRetryOnError: false }
  )

  const [expanded, setExpanded] = useState<number | null>(null)
  const [deletingCat, setDeletingCat] = useState<number | null>(null)
  const [deletingSkill, setDeletingSkill] = useState<number | null>(null)
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null)

  // Category form. Default sort = max existing + 1, so new categories append to the end
  const nextCatSort = categories?.length
    ? Math.max(...categories.map((c) => c.sort)) + 1
    : 0
  const catNameId = useId()
  const catSortId = useId()
  const catForm = useForm<CatValues>({
    resolver: zodResolver(catSchema),
    defaultValues: { name: "", sort: nextCatSort },
  })

  // When categories resolve from SWR (async), sync the sort field to the next value
  useEffect(() => {
    catForm.reset((prev) => ({ ...prev, sort: nextCatSort }))
  }, [nextCatSort, catForm])

  async function onAddCategory(values: CatValues) {
    const result = await createSkillCategory({ name: values.name, sort: values.sort })
    if (result.ok) {
      toast.success("Category created.")
      catForm.reset({ name: "", sort: nextCatSort })
      mutate(ADMIN_SKILL_CATEGORIES_KEY)
    } else {
      toast.error(result.error || "Failed to create category.")
    }
  }

  async function onDeleteCategory(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? Skills inside it will also be deleted.`)) return
    setDeletingCat(id)
    const result = await deleteSkillCategory(id)
    setDeletingCat(null)
    if (result.ok) {
      toast.success("Category deleted.")
      mutate(ADMIN_SKILL_CATEGORIES_KEY)
      mutate(ADMIN_SKILLS_KEY)
    } else {
      toast.error(result.error || "Delete failed.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="border-b-2 border-[var(--ink)] pb-4 mb-6 sm:mb-8">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">ADMIN</p>
        <h1 className="font-mono font-black text-2xl tracking-tight">SKILLS</h1>
      </div>

      {/* Add category form */}
      <form
        onSubmit={catForm.handleSubmit(onAddCategory)}
        noValidate
        className="flex flex-wrap gap-3 items-end mb-8 border-brutal p-4 bg-[var(--panel)]"
      >
        <div className="flex-1 min-w-40">
          <label htmlFor={catNameId} className="block font-mono text-xs font-bold tracking-widest mb-1">
            NEW CATEGORY
          </label>
          <input
            id={catNameId}
            {...catForm.register("name")}
            placeholder="e.g. LANGUAGES"
            className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none"
          />
          {catForm.formState.errors.name && (
            <p className="font-mono text-xs text-[var(--danger)] mt-1">{catForm.formState.errors.name.message}</p>
          )}
        </div>
        <div className="w-20">
          <label htmlFor={catSortId} className="block font-mono text-xs font-bold tracking-widest mb-1">
            SORT
          </label>
          <input
            id={catSortId}
            type="number"
            min={0}
            {...catForm.register("sort", { valueAsNumber: true })}
            className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={catForm.formState.isSubmitting}
          className="btn-brutal btn-brutal-main focus-brutal inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={13} aria-hidden="true" /> ADD
        </button>
      </form>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-brutal bg-[var(--panel)] p-4 animate-pulse h-14" />
          ))}
        </div>
      )}

      {catError && !isLoading && <ApiErrorBanner />}

      {!isLoading && !catError && (!categories || categories.length === 0) && (
        <EmptyState label="No skill categories yet." />
      )}

      {!isLoading && !catError && categories && categories.length > 0 && (
        <div className="border-brutal overflow-hidden">
          {categories.map((cat, i) => {
            const catSkills = (skills ?? []).filter((s) => s.category_id === cat.id)
            const isOpen = expanded === cat.id
            return (
              <div key={cat.id} className={i !== categories.length - 1 ? "border-b-2 border-[var(--ink)]" : ""}>
                {/* Category row */}
                {editingCatId === cat.id ? (
                  <EditCategoryInline
                    category={cat}
                    onDone={() => setEditingCatId(null)}
                    onSaved={() => {
                      setEditingCatId(null)
                      mutate(ADMIN_SKILL_CATEGORIES_KEY)
                    }}
                  />
                ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="font-mono text-xs text-[var(--muted)] w-6 shrink-0">{cat.sort}</span>
                  <span className="font-mono font-bold text-sm flex-1 min-w-0 truncate">{cat.name.toUpperCase()}</span>
                  <span className="font-mono text-xs text-[var(--muted)]">{catSkills.length} skills</span>
                  <button
                    onClick={() => setExpanded(isOpen ? null : cat.id)}
                    className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <button
                    onClick={() => setEditingCatId(cat.id)}
                    className="btn-brutal btn-brutal-panel focus-brutal p-1.5"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id, cat.name)}
                    disabled={deletingCat === cat.id}
                    className="btn-brutal focus-brutal p-1.5 bg-[var(--danger)] text-white disabled:opacity-50"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                )}

                {/* Skills list */}
                {isOpen && (
                  <div className="border-t-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-4">
                    {catSkills.length === 0 && (
                      <p className="font-mono text-xs text-[var(--muted)] mb-4">No skills yet.</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {catSkills.map((skill) => (
                        editingSkillId === skill.id ? (
                          <EditSkillInline
                            key={skill.id}
                            skill={skill}
                            onDone={() => setEditingSkillId(null)}
                            onSaved={() => {
                              setEditingSkillId(null)
                              mutate(ADMIN_SKILLS_KEY)
                              mutate(ADMIN_SKILL_CATEGORIES_KEY)
                            }}
                          />
                        ) : (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 border-brutal px-2 py-1 font-mono text-xs font-bold bg-[var(--panel)]"
                        >
                          {skill.name}
                          <button
                            onClick={() => setEditingSkillId(skill.id)}
                            className="text-[var(--muted)] focus-brutal"
                            aria-label={`Edit ${skill.name}`}
                          >
                            <Pencil size={10} />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete skill "${skill.name}"?`)) return
                              setDeletingSkill(skill.id)
                              await deleteSkill(skill.id)
                              setDeletingSkill(null)
                              mutate(ADMIN_SKILLS_KEY)
                              mutate(ADMIN_SKILL_CATEGORIES_KEY)
                            }}
                            disabled={deletingSkill === skill.id}
                            className="text-[var(--danger)] focus-brutal disabled:opacity-50"
                            aria-label={`Remove ${skill.name}`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </span>
                        )
                      ))}
                    </div>

                    {/* Add skill inline */}
                    <AddSkillInline
                      categoryId={cat.id}
                      nextSort={catSkills.length ? Math.max(...catSkills.map((s) => s.sort)) + 1 : 0}
                      onAdded={() => {
                        mutate(ADMIN_SKILLS_KEY)
                        mutate(ADMIN_SKILL_CATEGORIES_KEY)
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AddSkillInline({ categoryId, nextSort = 0, onAdded }: { categoryId: number; nextSort?: number; onAdded: () => void }) {
  const nameId = useId()
  const sortId = useId()
  const form = useForm<SkillValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { name: "", sort: nextSort },
  })

  async function onSubmit(values: SkillValues) {
    const result = await createSkill({ name: values.name, category_id: categoryId, sort: values.sort })
    if (result.ok) {
      toast.success("Skill added.")
      form.reset({ name: "", sort: values.sort + 1 })
      onAdded()
    } else {
      toast.error(result.error || "Failed to add skill.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex gap-2 items-end flex-wrap">
      <div>
        <label htmlFor={nameId} className="block font-mono text-xs font-bold tracking-widest mb-1">
          NEW SKILL
        </label>
        <input
          id={nameId}
          {...form.register("name")}
          placeholder="e.g. Go"
          className="border-brutal bg-[var(--panel)] px-3 py-1.5 font-mono text-sm focus-brutal outline-none w-36"
        />
      </div>
      <div>
        <label htmlFor={sortId} className="block font-mono text-xs font-bold tracking-widest mb-1">SORT</label>
        <input
          id={sortId}
          type="number"
          min={0}
          {...form.register("sort", { valueAsNumber: true })}
          className="border-brutal bg-[var(--panel)] px-3 py-1.5 font-mono text-sm focus-brutal outline-none w-16"
        />
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="btn-brutal btn-brutal-panel focus-brutal inline-flex items-center gap-1 text-xs px-3 py-1.5 disabled:opacity-50"
      >
        <Plus size={12} /> ADD
      </button>
    </form>
  )
}

function EditCategoryInline({ category, onDone, onSaved }: { category: SkillCategory; onDone: () => void; onSaved: () => void }) {
  const form = useForm<CatValues>({
    resolver: zodResolver(catSchema),
    defaultValues: { name: category.name, sort: category.sort },
  })

  async function onSubmit(values: CatValues) {
    const result = await updateSkillCategory(category.id, values)
    if (result.ok) {
      toast.success("Category updated.")
      onSaved()
    } else {
      toast.error(result.error || "Update failed.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-wrap gap-3 items-end px-4 py-3">
      <div className="flex-1 min-w-40">
        <input
          {...form.register("name")}
          aria-label="Category name"
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm font-bold focus-brutal outline-none"
        />
      </div>
      <div className="w-20">
        <input
          type="number"
          min={0}
          {...form.register("sort", { valueAsNumber: true })}
          aria-label="Sort"
          className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="btn-brutal btn-brutal-ink focus-brutal text-xs px-3 py-2 disabled:opacity-50"
      >
        SAVE
      </button>
      <button
        type="button"
        onClick={onDone}
        className="btn-brutal btn-brutal-panel focus-brutal text-xs px-3 py-2"
      >
        CANCEL
      </button>
    </form>
  )
}

function EditSkillInline({ skill, onDone, onSaved }: { skill: Skill; onDone: () => void; onSaved: () => void }) {
  const form = useForm<SkillValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { name: skill.name, sort: skill.sort },
  })

  async function onSubmit(values: SkillValues) {
    const result = await updateSkill(skill.id, { ...values, category_id: skill.category_id })
    if (result.ok) {
      toast.success("Skill updated.")
      onSaved()
    } else {
      toast.error(result.error || "Update failed.")
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="inline-flex items-center gap-1.5 border-brutal px-2 py-1 bg-[var(--bg)]"
    >
      <input
        {...form.register("name")}
        aria-label="Skill name"
        className="w-24 bg-transparent font-mono text-xs font-bold focus-brutal outline-none"
      />
      <input
        type="number"
        min={0}
        {...form.register("sort", { valueAsNumber: true })}
        aria-label="Sort"
        className="w-12 bg-transparent font-mono text-xs focus-brutal outline-none"
      />
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="font-mono text-xs font-bold focus-brutal disabled:opacity-50"
      >
        SAVE
      </button>
      <button type="button" onClick={onDone} className="font-mono text-xs text-[var(--muted)] focus-brutal">
        ✕
      </button>
    </form>
  )
}
