"use client"

import { useId, type ReactNode } from "react"

/**
 * Form field primitives.
 *
 * The `Field` wrapper was previously declared byte-identically in ProjectForm
 * and ArticleForm and hand-inlined in four more components, with the label and
 * error class strings repeated around 25 times. The input classes below are the
 * single definition; callers override via className only when they genuinely
 * differ.
 */

interface FieldProps {
  label: string
  /** Rendered after the label, e.g. "(optional)". */
  hint?: string
  error?: string
  children: (props: { id: string; "aria-describedby"?: string }) => ReactNode
}

/**
 * Wraps a control with its label and validation message, wiring up
 * `aria-describedby` so the error is announced rather than only shown.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()
  const errorId = `${id}-err`

  return (
    <div>
      <label htmlFor={id} className="label-brutal">
        {label}
        {hint && <span className="text-[var(--muted)] font-normal"> {hint}</span>}
      </label>
      {children({ id, "aria-describedby": error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="error-brutal">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = "input-brutal"

interface TextFieldProps {
  label: string
  hint?: string
  error?: string
  disabled?: boolean
  className?: string
  [key: string]: unknown
}

/** Standard single-line input. Spread register() props onto it. */
export function TextField({
  label,
  hint,
  error,
  disabled,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, ...aria }) => (
        <input
          id={id}
          disabled={disabled}
          {...props}
          {...aria}
          className={`${inputClass} ${className ?? ""}`}
        />
      )}
    </Field>
  )
}

interface TextAreaFieldProps extends TextFieldProps {
  rows?: number
  resize?: boolean
}

export function TextAreaField({
  label,
  hint,
  error,
  disabled,
  className,
  rows = 4,
  resize = true,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, ...aria }) => (
        <textarea
          id={id}
          rows={rows}
          disabled={disabled}
          {...props}
          {...aria}
          className={`${inputClass} ${resize ? "resize-y" : "resize-none"} ${className ?? ""}`}
        />
      )}
    </Field>
  )
}

interface NumberFieldProps {
  label: string
  hint?: string
  error?: string
  disabled?: boolean
  className?: string
  [key: string]: unknown
}

/** Sort-order style input. `register(..., { valueAsNumber: true })` is expected. */
export function NumberField({
  label,
  hint,
  error,
  disabled,
  className,
  ...props
}: NumberFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, ...aria }) => (
        <input
          id={id}
          type="number"
          min={0}
          disabled={disabled}
          {...props}
          {...aria}
          className={`${inputClass} w-24 ${className ?? ""}`}
        />
      )}
    </Field>
  )
}

interface CheckboxFieldProps {
  label: string
  disabled?: boolean
  [key: string]: unknown
}

export function CheckboxField({ label, disabled, ...props }: CheckboxFieldProps) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        disabled={disabled}
        {...props}
        className="w-4 h-4 border-brutal focus-brutal"
      />
      <label htmlFor={id} className="font-mono text-xs font-bold tracking-widest">
        {label}
      </label>    </div>
  )
}
