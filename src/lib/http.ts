/**
 * The single HTTP entry point.
 *
 * `request` never throws and never rejects on a non-2xx: it resolves to an
 * ApiResult so callers can branch on `.ok` without try/catch. Server components
 * rely on that — an offline API must degrade one section, not blank the page.
 */

import type { ApiResult } from "@/types/api"
import { getToken, handleUnauthorized } from "@/lib/auth"
import { asRecord, asString, pick } from "@/lib/coerce"

const DEFAULT_API_URL = "http://localhost:9999"

export type RequestOptions = {
  method?: string
  body?: BodyInit | null
  auth?: boolean
  headers?: HeadersInit
  json?: unknown
  /**
   * Seconds of CDN/route cache. Server Components set this so public reads are
   * cached; client fetches always pass `no-store` to stay live.
   */
  revalidate?: number
}

export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
  return base.replace(/\/$/, "")
}

/**
 * Resolves a stored filename to a displayable URL.
 *
 * Content stores paths relative on purpose (e.g. "/uploads/a.png") so a
 * database move or a change of API host does not invalidate existing markdown.
 */
export function uploadUrl(filename?: string | null): string | null {
  if (!filename) return null
  if (/^https?:\/\//i.test(filename)) return filename
  if (filename.startsWith("/")) return `${apiBase()}${filename}`
  return `${apiBase()}/uploads/${filename}`
}

export function fail<T>(error: string, status: number): ApiResult<T> {
  return { ok: false, data: null, error, status }
}

export function ok<T>(data: T, status: number): ApiResult<T> {
  return { ok: true, data, error: null, status }
}

function errorMessage(payload: unknown, fallback: string) {
  const raw = asRecord(payload)
  const err = pick(raw, "error")
  return err ? asString(err) : fallback
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers)
  const revalidate = options.revalidate
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: options.method ?? "GET",
    cache: revalidate === undefined ? "no-store" : undefined,
    headers,
  }

  // Next rejects `cache` and `next.revalidate` set together, so only one is used.
  if (revalidate !== undefined) init.next = { revalidate }

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json")
    init.body = JSON.stringify(options.json)
  } else if (options.body !== undefined) {
    init.body = options.body
  }

  if (options.auth) {
    const token = getToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  let res: Response
  try {
    res = await fetch(`${apiBase()}${path}`, init)
  } catch {
    // Network failure or aborted server render — treat as "not found" rather
    // than throwing, so one dead endpoint cannot take down a whole page.
    return fail("not found", 0)
  }

  let payload: unknown = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = { error: text }
    }
  }

  if (res.status === 401 && options.auth) {
    handleUnauthorized()
    return fail(errorMessage(payload, "unauthorized"), 401)
  }

  if (!res.ok) {
    return fail(errorMessage(payload, "invalid request data"), res.status)
  }

  return ok(payload as T, res.status)
}

/** Reads one item out of its envelope, e.g. `{ project: {...} }` → the project. */
export function unwrapOne<T>(payload: unknown, envelope: string): T {
  return asRecord(payload)[envelope] as T
}

/** Reads a collection out of its envelope, defaulting to an empty list. */
export function unwrapList<T>(payload: unknown, envelope: string): T[] {
  const list = asRecord(payload)[envelope]
  return Array.isArray(list) ? (list as T[]) : []
}
