"use client"

import { useRef, useState } from "react"
import { z } from "zod"

import { FormShell } from "@/components/admin/FormShell"
import { ImagePicker } from "@/components/admin/ImagePicker"
import { TagInput } from "@/components/admin/TagInput"
import { CheckboxField, TextAreaField, TextField } from "@/components/ui/Field"
import { useCrudForm } from "@/hooks/useCrudForm"
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning"
import { useKeyboardSubmit } from "@/hooks/useKeyboardSubmit"
import {
  ADMIN_PROJECTS_KEY,
  createProject,
  updateProject,
} from "@/lib/api"
import type { Project, ProjectInput } from "@/types/api"

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  link: z.string().url("Must be a valid URL").or(z.literal("")),
  github: z.string().url("Must be a valid URL").or(z.literal("")),
  featured: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>(project?.tags ?? [])

  const { form, submit } = useCrudForm<FormValues, ProjectInput, Project>({
    schema,
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      link: project?.link ?? "",
      github: project?.github ?? "",
      featured: project?.featured ?? false,
    },
    editingId: project?.id,
    create: createProject,
    update: (_id, input) => updateProject(project!.id, input),
    toInput: (values) => ({ ...values, image: imageFile, tags }),
    listKeys: [ADMIN_PROJECTS_KEY],
    redirectTo: "/admin/projects",
    labels: { create: "Project created.", update: "Project updated." },
  })

  const {
    register,
    formState: { errors, isSubmitting, isDirty },
  } = form
  useUnsavedWarning(isDirty && !isSubmitting)
  useKeyboardSubmit(formRef)

  return (
    <FormShell
      onSubmit={submit}
      isSubmitting={isSubmitting}
      submitLabel={project ? "UPDATE" : "CREATE"}
      formRef={formRef}
    >
      <ImagePicker
        existing={project?.image}
        file={imageFile}
        onChange={setImageFile}
      />

      <TextField
        label="TITLE"
        disabled={isSubmitting}
        error={errors.title?.message}
        {...register("title")}
      />

      <TextAreaField
        label="DESCRIPTION"
        disabled={isSubmitting}
        error={errors.description?.message}
        {...register("description")}
      />

      <TextField
        label="LIVE LINK"
        type="url"
        disabled={isSubmitting}
        error={errors.link?.message}
        {...register("link")}
      />

      <TextField
        label="GITHUB"
        type="url"
        disabled={isSubmitting}
        error={errors.github?.message}
        {...register("github")}
      />

      <CheckboxField
        label="FEATURED"
        disabled={isSubmitting}
        {...register("featured")}
      />

      <TagInput
        tags={tags}
        onChange={setTags}
        disabled={isSubmitting}
      />
    </FormShell>
  )
}
