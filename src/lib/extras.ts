/**
 * Endpoints that don't fit the entity registry: auth, bulk image upload, and
 * the CV file URLs. Kept separate so `resources.ts` stays purely declarative.
 */

import { asString } from "@/lib/coerce"
import { setToken } from "@/lib/auth"
import { apiBase, fail, ok, request } from "@/lib/http"
import { normalizeCV, normalizeMessage } from "@/lib/normalize"
import { ADMIN_CV_KEY } from "@/lib/resources"
import type { ContactInput, CV, Message } from "@/types/api"

export async function login(email: string, password: string) {
  const res = await request<{ token?: unknown }>("/api/admin/login", {
    method: "POST",
    json: { email, password },
  })
  if (!res.ok) return res
  const token = asString(res.data.token)
  if (!token) return fail("invalid request data", res.status)
  setToken(token)
  return ok(token, res.status)
}

export async function createContact(input: ContactInput) {
  const res = await request<{ message?: unknown }>("/api/contact", {
    method: "POST",
    json: input,
  })
  if (!res.ok) return res
  return ok(normalizeMessage(res.data.message), res.status)
}

/**
 * Upload one or more images and get back their public paths
 * (e.g. ["/uploads/abc.png"]). The paths are relative on purpose so they can be
 * embedded in article markdown without hardcoding the API host.
 */
export async function uploadImages(files: File[]) {
  const data = new FormData()
  for (const file of files) {
    data.append("images", file)
  }

  const res = await request<{ images?: unknown }>("/api/admin/uploads/images", {
    method: "POST",
    auth: true,
    body: data,
  })
  if (!res.ok) return res

  const list = Array.isArray(res.data.images) ? res.data.images : []
  return ok(list.map(asString), res.status)
}

export async function uploadCV(file: File) {
  const data = new FormData()
  data.append("cv", file)
  const res = await request<{ cv?: unknown }>(ADMIN_CV_KEY, {
    method: "POST",
    auth: true,
    body: data,
  })
  if (!res.ok) return res
  return ok(normalizeCV(res.data.cv), res.status)
}

export function cvDownloadUrl(): string {
  return `${apiBase()}/api/cv`
}

/**
 * The stored PDF lives on the public /uploads static route, which serves it with
 * no Content-Disposition — so a browser renders it inline rather than
 * downloading it. GET /api/cv cannot be used for a preview because it forces an
 * attachment.
 */
export function cvPreviewUrl(fileName?: string | null): string | null {
  return fileName ? `${apiBase()}/uploads/${fileName}` : null
}

export type { CV, Message }
