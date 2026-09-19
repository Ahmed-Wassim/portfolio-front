import type {
  ApiResult,
  Article,
  ArticleInput,
  ContactInput,
  Dashboard,
  Message,
  Project,
  ProjectInput,
} from "../types/api"
import { ApiError } from "../types/api"

export const TOKEN_KEY = "portfolio.token"

const DEFAULT_API_URL = "http://localhost:9999"

type RequestOptions = {
  method?: string
  body?: BodyInit | null
  auth?: boolean
  headers?: HeadersInit
  json?: unknown
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
  return base.replace(/\/$/, "")
}

export function uploadUrl(filename?: string | null) {
  if (!filename) return null
  if (/^https?:\/\//i.test(filename)) return filename
  if (filename.startsWith("/")) return `${apiBase()}${filename}`
  return `${apiBase()}/uploads/${filename}`
}

export function getToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}

function fail<T>(error: string, status: number): ApiResult<T> {
  return { ok: false, data: null, error, status }
}

function ok<T>(data: T, status: number): ApiResult<T> {
  return { ok: true, data, error: null, status }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function pick(raw: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  }
  return undefined
}

function asString(value: unknown) {
  if (value == null) return ""
  return String(value)
}

function asNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function asBool(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1
}

export function normalizeProject(rawUnknown: unknown): Project {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    title: asString(pick(raw, "title")),
    description: asString(pick(raw, "description")),
    image: asString(pick(raw, "image")),
    link: asString(pick(raw, "link")),
    github: asString(pick(raw, "github")),
    featured: asBool(pick(raw, "featured")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export function normalizeArticle(rawUnknown: unknown): Article {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    title: asString(pick(raw, "title")),
    slug: asString(pick(raw, "slug")),
    content: asString(pick(raw, "content")),
    image: asString(pick(raw, "image")),
    published: asBool(pick(raw, "published")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export function normalizeMessage(rawUnknown: unknown): Message {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    name: asString(pick(raw, "name")),
    email: asString(pick(raw, "email")),
    subject: asString(pick(raw, "subject")),
    body: asString(pick(raw, "body")),
    is_read: asBool(pick(raw, "is_read")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
  }
}

function errorMessage(payload: unknown, fallback: string) {
  const raw = asRecord(payload)
  const err = pick(raw, "error")
  return err ? asString(err) : fallback
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers)
  const init: RequestInit = {
    method: options.method ?? "GET",
    cache: "no-store",
    headers,
  }

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

  if (
    res.status === 401 &&
    options.auth &&
    path !== "/api/admin/login"
  ) {
    clearToken()
    unauthorizedHandler?.()
    return fail(errorMessage(payload, "unauthorized"), 401)
  }

  if (!res.ok) {
    return fail(errorMessage(payload, "invalid request data"), res.status)
  }

  return ok(payload as T, res.status)
}

export const ADMIN_PROJECTS_KEY = "/api/projects"

export function adminProjectKey(id: number | string) {
  return `/api/projects/${id}`
}

export async function listProjects(): Promise<ApiResult<Project[]>> {
  const res = await request<{ projects?: unknown }>("/api/projects")
  if (!res.ok) return res
  const list = Array.isArray(res.data.projects) ? res.data.projects : []
  return ok(list.map(normalizeProject), res.status)
}

export async function getProject(id: number | string): Promise<ApiResult<Project>> {
  const res = await request<{ project?: unknown }>(`/api/projects/${id}`)
  if (!res.ok) return res
  return ok(normalizeProject(res.data.project), res.status)
}

export const listAdminProjects = listProjects
export const getAdminProject = getProject

export async function listArticles(): Promise<ApiResult<Article[]>> {
  const res = await request<{ articles?: unknown }>("/api/articles")
  if (!res.ok) return res
  const list = Array.isArray(res.data.articles) ? res.data.articles : []
  return ok(list.map(normalizeArticle), res.status)
}

export async function getArticleBySlug(slug: string): Promise<ApiResult<Article>> {
  const res = await request<{ article?: unknown }>(
    `/api/articles/${encodeURIComponent(slug)}`,
  )
  if (!res.ok) return res
  return ok(normalizeArticle(res.data.article), res.status)
}

export async function createContact(input: ContactInput): Promise<ApiResult<Message>> {
  const res = await request<{ message?: unknown }>("/api/contact", {
    method: "POST",
    json: input,
  })
  if (!res.ok) return res
  return ok(normalizeMessage(res.data.message), res.status)
}

export async function login(email: string, password: string): Promise<ApiResult<string>> {
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

export async function getDashboard(): Promise<ApiResult<Dashboard>> {
  const res = await request<Record<string, unknown>>("/api/admin/dashboard", {
    auth: true,
  })
  if (!res.ok) return res
  return ok(
    {
      projects: asNumber(pick(res.data, "projects")),
      articles: asNumber(pick(res.data, "articles")),
      unread_messages: asNumber(pick(res.data, "unread_messages")),
    },
    res.status,
  )
}

function projectFormData(input: ProjectInput) {
  const data = new FormData()
  data.append("title", input.title)
  data.append("description", input.description)
  data.append("link", input.link ?? "")
  data.append("github", input.github ?? "")
  data.append("featured", input.featured ? "true" : "false")
  if (input.image) data.append("image", input.image)
  return data
}

function articleFormData(input: ArticleInput) {
  const data = new FormData()
  data.append("title", input.title)
  data.append("slug", input.slug)
  data.append("content", input.content ?? "")
  data.append("published", input.published ? "true" : "false")
  if (input.image) data.append("image", input.image)
  return data
}

export async function createProject(input: ProjectInput): Promise<ApiResult<Project>> {
  const res = await request<{ project?: unknown }>("/api/admin/projects", {
    method: "POST",
    auth: true,
    body: projectFormData(input),
  })
  if (!res.ok) return res
  return ok(normalizeProject(res.data.project), res.status)
}

export async function updateProject(
  id: number | string,
  input: ProjectInput,
): Promise<ApiResult<Project>> {
  const res = await request<{ project?: unknown }>(`/api/admin/projects/${id}`, {
    method: "PUT",
    auth: true,
    body: projectFormData(input),
  })
  if (!res.ok) return res
  return ok(normalizeProject(res.data.project), res.status)
}

export async function deleteProject(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/projects/${id}`, { method: "DELETE", auth: true })
}

export async function listArticlesAdmin(): Promise<ApiResult<Article[]>> {
  const res = await request<{ articles?: unknown }>("/api/admin/articles", {
    auth: true,
  })
  if (!res.ok) return res
  const list = Array.isArray(res.data.articles) ? res.data.articles : []
  return ok(list.map(normalizeArticle), res.status)
}

export async function getArticleAdmin(id: number | string): Promise<ApiResult<Article>> {
  const res = await request<{ article?: unknown }>(`/api/admin/articles/${id}`, {
    auth: true,
  })
  if (!res.ok) return res
  return ok(normalizeArticle(res.data.article), res.status)
}

export async function createArticle(input: ArticleInput): Promise<ApiResult<Article>> {
  const res = await request<{ article?: unknown }>("/api/admin/articles", {
    method: "POST",
    auth: true,
    body: articleFormData(input),
  })
  if (!res.ok) return res
  return ok(normalizeArticle(res.data.article), res.status)
}

export async function updateArticle(
  id: number | string,
  input: ArticleInput,
): Promise<ApiResult<Article>> {
  const res = await request<{ article?: unknown }>(`/api/admin/articles/${id}`, {
    method: "PUT",
    auth: true,
    body: articleFormData(input),
  })
  if (!res.ok) return res
  return ok(normalizeArticle(res.data.article), res.status)
}

export async function deleteArticle(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/articles/${id}`, { method: "DELETE", auth: true })
}

export async function listMessages(): Promise<ApiResult<Message[]>> {
  const res = await request<{ messages?: unknown }>("/api/admin/messages", {
    auth: true,
  })
  if (!res.ok) return res
  const list = Array.isArray(res.data.messages) ? res.data.messages : []
  return ok(list.map(normalizeMessage), res.status)
}

export async function markMessageRead(id: number | string): Promise<ApiResult<Message>> {
  const res = await request<{ message?: unknown }>(`/api/admin/messages/${id}`, {
    method: "PATCH",
    auth: true,
  })
  if (!res.ok) return res
  return ok(normalizeMessage(res.data.message), res.status)
}

export async function swrFetcher<T>(
  key: string | [string, ...unknown[]],
): Promise<T> {
  const path = Array.isArray(key) ? key[0] : key
  const auth = path.startsWith("/api/admin/") && path !== "/api/admin/login"
  const res = await request<unknown>(path, { auth })
  if (!res.ok) throw new ApiError(res.error, res.status)
  return unwrapSWR<T>(path, res.data)
}

function unwrapSWR<T>(path: string, payload: unknown): T {
  const raw = asRecord(payload)
  if (path === "/api/projects") {
    const list = Array.isArray(raw.projects) ? raw.projects : []
    return list.map(normalizeProject) as T
  }
  if (path.startsWith("/api/projects/")) {
    return normalizeProject(raw.project) as T
  }
  if (path === "/api/admin/articles" || path === "/api/articles") {
    const list = Array.isArray(raw.articles) ? raw.articles : []
    return list.map(normalizeArticle) as T
  }
  if (path.startsWith("/api/admin/articles/") || path.startsWith("/api/articles/")) {
    return normalizeArticle(raw.article) as T
  }
  if (path === "/api/admin/messages") {
    const list = Array.isArray(raw.messages) ? raw.messages : []
    return list.map(normalizeMessage) as T
  }
  if (path.startsWith("/api/admin/messages/")) {
    return normalizeMessage(raw.message) as T
  }
  if (path === "/api/admin/dashboard") {
    return {
      projects: asNumber(pick(raw, "projects")),
      articles: asNumber(pick(raw, "articles")),
      unread_messages: asNumber(pick(raw, "unread_messages")),
    } as T
  }
  return payload as T
}
