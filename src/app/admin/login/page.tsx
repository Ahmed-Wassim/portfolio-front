"use client"

import { useId, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { login, getToken } from "@/lib/api"
import { site } from "@/config/site"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()

  useEffect(() => {
    if (getToken()) router.push("/admin")
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const result = await login(values.email, values.password)
    if (result.ok) {
      router.push("/admin")
    } else {
      toast.error(result.error === "invalid credentials" ? "Invalid credentials." : result.error || "Login failed.")
    }
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <main
        id="main"
        className="min-h-dvh bg-[var(--bg)] flex items-center justify-center px-4 bg-dots"
      >
        <div className="border-brutal shadow-brutal-lg bg-[var(--panel)] p-8 w-full max-w-sm">
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest mb-1">
            ADMIN
          </p>
          <h1 className="font-mono font-black text-2xl tracking-tight mb-8">
            {site.windowTitle}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="block font-mono text-xs font-bold tracking-widest mb-1"
              >
                PASSWORD
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register("password")}
                className="w-full border-brutal bg-[var(--bg)] px-3 py-2 font-mono text-sm focus-brutal outline-none disabled:opacity-50"
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="font-mono text-xs text-[var(--danger)] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-brutal btn-brutal-ink focus-brutal disabled:opacity-50"
            >
              {isSubmitting ? "LOGGING IN…" : "LOGIN"}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
