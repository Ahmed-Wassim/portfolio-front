"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Section } from "@/components/ui/Section"
import { TextAreaField, TextField } from "@/components/ui/Field"
import { createContact } from "@/lib/api"

const schema = z.object({
  name: z.string().min(1, "Required").max(80),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(1, "Required").max(120),
  body: z.string().min(1, "Required").max(4000),
})

type FormValues = z.infer<typeof schema>

export function HireMeSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const result = await createContact(values)
    if (result.ok) {
      toast.success("Message sent — I'll get back to you soon.")
      reset()
    } else {
      toast.error(result.error || "Something went wrong.")
    }
  }

  return (
    <Section id="hire" title="HIRE ME">
      <div className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <TextField
            label="NAME"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            error={errors.name?.message}
            aria-invalid={!!errors.name}
            {...register("name")}
          />

          <TextField
            label="EMAIL"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            aria-invalid={!!errors.email}
            {...register("email")}
          />

          <TextField
            label="SUBJECT"
            type="text"
            disabled={isSubmitting}
            error={errors.subject?.message}
            aria-invalid={!!errors.subject}
            {...register("subject")}
          />

          <TextAreaField
            label="MESSAGE"
            rows={6}
            disabled={isSubmitting}
            error={errors.body?.message}
            aria-invalid={!!errors.body}
            {...register("body")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-brutal btn-brutal-main focus-brutal disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal"
          >
            {isSubmitting ? "SENDING…" : "SEND MESSAGE"}
          </button>
        </form>
      </div>
    </Section>
  )
}
