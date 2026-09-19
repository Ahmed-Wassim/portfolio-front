"use client"

import { useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { createContact } from "@/lib/api"

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  subject: z.string().min(1).max(120),
  body: z.string().min(1).max(4000),
})

type FormValues = z.infer<typeof schema>

export function HireMeSection() {
  const nameId = useId()
  const emailId = useId()
  const subjectId = useId()
  const bodyId = useId()

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
      const msg =
        result.error === "invalid request data"
          ? "Invalid request data. Check your fields."
          : result.error || "Something went wrong."
      toast.error(msg)
    }
  }

  return (
    <section id="hire" className="section-anchor border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="border-b-2 border-[var(--ink)] pb-4 mb-10">
          <h2 className="font-mono font-black text-2xl tracking-tight">/ HIRE ME</h2>
        </div>

        <div className="max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor={nameId}
                className="block font-mono text-xs font-bold tracking-widest mb-1"
              >
                NAME
              </label>
              <input
                id={nameId}
                type="text"
                autoComplete="name"
                disabled={isSubmitting}
                {...register("name")}
                className="w-full border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${nameId}-err` : undefined}
              />
              {errors.name && (
                <p id={`${nameId}-err`} className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor={emailId}
                className="block font-mono text-xs font-bold tracking-widest mb-1"
              >
                EMAIL
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
                className="w-full border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${emailId}-err` : undefined}
              />
              {errors.email && (
                <p id={`${emailId}-err`} className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor={subjectId}
                className="block font-mono text-xs font-bold tracking-widest mb-1"
              >
                SUBJECT
              </label>
              <input
                id={subjectId}
                type="text"
                disabled={isSubmitting}
                {...register("subject")}
                className="w-full border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? `${subjectId}-err` : undefined}
              />
              {errors.subject && (
                <p id={`${subjectId}-err`} className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Body */}
            <div>
              <label
                htmlFor={bodyId}
                className="block font-mono text-xs font-bold tracking-widest mb-1"
              >
                MESSAGE
              </label>
              <textarea
                id={bodyId}
                rows={6}
                disabled={isSubmitting}
                {...register("body")}
                className="w-full border-brutal bg-[var(--panel)] px-3 py-2 font-mono text-sm focus-brutal outline-none resize-y disabled:opacity-50"
                aria-invalid={!!errors.body}
                aria-describedby={errors.body ? `${bodyId}-err` : undefined}
              />
              {errors.body && (
                <p id={`${bodyId}-err`} className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.body.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-brutal btn-brutal-main focus-brutal disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal"
            >
              {isSubmitting ? "SENDING…" : "SEND MESSAGE"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
