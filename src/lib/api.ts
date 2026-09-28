import type {
  ApiResult,
  Article,
  ArticleInput,
  ContactInput,
  Tag,
  Message,
  Project,
  ProjectInput,
  Profile,
  ProfileInput,
  AboutItem,
  AboutInput,
  SkillCategory,
  Skill,
  SkillCategoryInput,
  SkillInput,
  Experience,
  ExperienceInput,
  Social,
  SocialInput,
  CV,
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

// Tags come back as objects ([{ ID, name }]) from the tags table, but the UI only
// ever needs the names, so they are flattened here.
function asTagNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((tag) => asString(asRecord(tag).name)).filter(Boolean)
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
    tags: asTagNames(pick(raw, "tags")),
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
    tags: asTagNames(pick(raw, "tags")),
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

function projectFormData(input: ProjectInput) {
  const data = new FormData()
  data.append("title", input.title)
  data.append("description", input.description)
  data.append("link", input.link ?? "")
  data.append("github", input.github ?? "")
  data.append("featured", input.featured ? "true" : "false")
  for (const tag of input.tags ?? []) data.append("tags", tag)
  if (input.image) data.append("image", input.image)
  return data
}

function articleFormData(input: ArticleInput) {
  const data = new FormData()
  data.append("title", input.title)
  data.append("slug", input.slug)
  data.append("content", input.content ?? "")
  data.append("published", input.published ? "true" : "false")
  for (const tag of input.tags ?? []) data.append("tags", tag)
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

// ── Tags ───────────────────────────────────────────────────────────────────────

export const ADMIN_TAGS_KEY = "/api/admin/tags"

export function normalizeTag(rawUnknown: unknown): Tag {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    name: asString(pick(raw, "name")),
    article_count: asNumber(pick(raw, "article_count")),
    project_count: asNumber(pick(raw, "project_count")),
  }
}

export async function renameTag(id: number | string, name: string): Promise<ApiResult<Tag>> {
  // The handler binds `form:"name"`, so this must be sent as form data rather
  // than JSON.
  const data = new FormData()
  data.append("name", name)
  const res = await request<{ tag?: unknown }>(`/api/admin/tags/${id}`, {
    method: "PATCH",
    auth: true,
    body: data,
  })
  if (!res.ok) return res
  return ok(normalizeTag(res.data.tag), res.status)
}

export async function deleteTag(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/tags/${id}`, { method: "DELETE", auth: true })
}

/**
 * Upload one or more images and get back their public paths
 * (e.g. ["/uploads/abc.png"]). The paths are relative on purpose so they can be
 * embedded in article markdown without hardcoding the API host.
 */
export async function uploadImages(files: File[]): Promise<ApiResult<string[]>> {
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
  if (path === "/api/admin/cv") {
    return normalizeCV(raw.cv) as T
  }
  if (path === "/api/admin/tags") {
    const list = Array.isArray(raw.tags) ? raw.tags : []
    return list.map(normalizeTag) as T
  }
  if (path === "/api/admin/dashboard") {
    return {
      projects: asNumber(pick(raw, "projects")),
      articles: asNumber(pick(raw, "articles")),
      unread_messages: asNumber(pick(raw, "unread_messages")),
    } as T
  }
  if (path === "/api/profile" || path === "/api/admin/profile") {
    return normalizeProfile(raw.profile) as T
  }
  if (path === "/api/about" || path === "/api/admin/about") {
    const list = Array.isArray(raw.about) ? raw.about : []
    return list.map(normalizeAboutItem) as T
  }
  if (path.startsWith("/api/admin/about/")) {
    return normalizeAboutItem(raw.about) as T
  }
  if (path === "/api/skills") {
    const list = Array.isArray(raw.categories) ? raw.categories : []
    return list.map(normalizeSkillCategory) as T
  }
  if (path === "/api/admin/skill-categories") {
    const list = Array.isArray(raw.skill_categories) ? raw.skill_categories : []
    return list.map(normalizeSkillCategory) as T
  }
  if (path === "/api/admin/skills") {
    const list = Array.isArray(raw.skills) ? raw.skills : []
    return list.map(normalizeSkill) as T
  }
  if (path === "/api/experiences" || path === "/api/admin/experiences") {
    const list = Array.isArray(raw.experiences) ? raw.experiences : []
    return list.map(normalizeExperience) as T
  }
  if (path.startsWith("/api/admin/experiences/")) {
    return normalizeExperience(raw.experience) as T
  }
  if (path === "/api/socials" || path === "/api/admin/socials") {
    const list = Array.isArray(raw.socials) ? raw.socials : []
    return list.map(normalizeSocial) as T
  }
  if (path.startsWith("/api/admin/socials/")) {
    return normalizeSocial(raw.social) as T
  }
  return payload as T
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function normalizeProfile(rawUnknown: unknown): Profile {
  const raw = asRecord(rawUnknown)
  const stackRaw = raw.stack
  const stack = Array.isArray(stackRaw) ? stackRaw.map(asString) : []
  return {
    id: asNumber(pick(raw, "id", "ID")),
    tagline: asString(pick(raw, "tagline")),
    stack,
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export async function getProfile(): Promise<ApiResult<Profile>> {
  const res = await request<{ profile?: unknown }>("/api/profile")
  if (!res.ok) return res
  return ok(normalizeProfile(res.data.profile), res.status)
}

export async function updateProfile(input: ProfileInput): Promise<ApiResult<Profile>> {
  const res = await request<{ profile?: unknown }>("/api/admin/profile", {
    method: "PUT",
    auth: true,
    json: input,
  })
  if (!res.ok) return res
  return ok(normalizeProfile(res.data.profile), res.status)
}

// ── About ────────────────────────────────────────────────────────────────────

export function normalizeAboutItem(rawUnknown: unknown): AboutItem {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    title: asString(pick(raw, "title")),
    content: asString(pick(raw, "content")),
    sort: asNumber(pick(raw, "sort")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export async function listAbout(): Promise<ApiResult<AboutItem[]>> {
  const res = await request<{ about?: unknown }>("/api/about")
  if (!res.ok) return res
  const list = Array.isArray(res.data.about) ? res.data.about : []
  return ok(list.map(normalizeAboutItem), res.status)
}

export async function createAboutItem(input: AboutInput): Promise<ApiResult<AboutItem>> {
  const res = await request<{ about?: unknown }>("/api/admin/about", {
    method: "POST",
    auth: true,
    json: input,
  })
  if (!res.ok) return res
  return ok(normalizeAboutItem(res.data.about), res.status)
}

export async function updateAboutItem(
  id: number | string,
  input: AboutInput,
): Promise<ApiResult<AboutItem>> {
  const res = await request<{ about?: unknown }>(`/api/admin/about/${id}`, {
    method: "PUT",
    auth: true,
    json: input,
  })
  if (!res.ok) return res
  return ok(normalizeAboutItem(res.data.about), res.status)
}

export async function deleteAboutItem(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/about/${id}`, { method: "DELETE", auth: true })
}

export const ADMIN_ABOUT_KEY = "/api/admin/about"
export const ADMIN_PROFILE_KEY = "/api/admin/profile"

// ── Skills ───────────────────────────────────────────────────────────────────

export function normalizeSkill(rawUnknown: unknown): Skill {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    name: asString(pick(raw, "name")),
    category_id: asNumber(pick(raw, "category_id")),
    sort: asNumber(pick(raw, "sort")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export function normalizeSkillCategory(rawUnknown: unknown): SkillCategory {
  const raw = asRecord(rawUnknown)
  const skillsRaw = Array.isArray(raw.skills) ? raw.skills : []
  return {
    id: asNumber(pick(raw, "id", "ID")),
    name: asString(pick(raw, "name")),
    sort: asNumber(pick(raw, "sort")),
    skills: skillsRaw.map(normalizeSkill),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export async function listSkills(): Promise<ApiResult<SkillCategory[]>> {
  const res = await request<{ categories?: unknown }>("/api/skills")
  if (!res.ok) return res
  const list = Array.isArray(res.data.categories) ? res.data.categories : []
  return ok(list.map(normalizeSkillCategory), res.status)
}

export const ADMIN_SKILL_CATEGORIES_KEY = "/api/admin/skill-categories"
export const ADMIN_SKILLS_KEY = "/api/admin/skills"

export async function createSkillCategory(input: SkillCategoryInput): Promise<ApiResult<SkillCategory>> {
  const res = await request<{ skill_category?: unknown }>("/api/admin/skill-categories", {
    method: "POST", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSkillCategory(res.data.skill_category), res.status)
}

export async function updateSkillCategory(id: number | string, input: SkillCategoryInput): Promise<ApiResult<SkillCategory>> {
  const res = await request<{ skill_category?: unknown }>(`/api/admin/skill-categories/${id}`, {
    method: "PUT", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSkillCategory(res.data.skill_category), res.status)
}

export async function deleteSkillCategory(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/skill-categories/${id}`, { method: "DELETE", auth: true })
}

export async function createSkill(input: SkillInput): Promise<ApiResult<Skill>> {
  const res = await request<{ skill?: unknown }>("/api/admin/skills", {
    method: "POST", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSkill(res.data.skill), res.status)
}

export async function updateSkill(id: number | string, input: SkillInput): Promise<ApiResult<Skill>> {
  const res = await request<{ skill?: unknown }>(`/api/admin/skills/${id}`, {
    method: "PUT", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSkill(res.data.skill), res.status)
}

export async function deleteSkill(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/skills/${id}`, { method: "DELETE", auth: true })
}

// ── Experiences ───────────────────────────────────────────────────────────────

export function normalizeExperience(rawUnknown: unknown): Experience {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    company: asString(pick(raw, "company")),
    role: asString(pick(raw, "role")),
    period: asString(pick(raw, "period")),
    description: asString(pick(raw, "description")),
    sort_order: asNumber(pick(raw, "sort_order")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export const ADMIN_EXPERIENCES_KEY = "/api/admin/experiences"

export async function listExperiences(): Promise<ApiResult<Experience[]>> {
  const res = await request<{ experiences?: unknown }>("/api/experiences")
  if (!res.ok) return res
  const list = Array.isArray(res.data.experiences) ? res.data.experiences : []
  return ok(list.map(normalizeExperience), res.status)
}

export async function createExperience(input: ExperienceInput): Promise<ApiResult<Experience>> {
  const res = await request<{ experience?: unknown }>("/api/admin/experiences", {
    method: "POST", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeExperience(res.data.experience), res.status)
}

export async function updateExperience(id: number | string, input: ExperienceInput): Promise<ApiResult<Experience>> {
  const res = await request<{ experience?: unknown }>(`/api/admin/experiences/${id}`, {
    method: "PUT", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeExperience(res.data.experience), res.status)
}

export async function deleteExperience(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/experiences/${id}`, { method: "DELETE", auth: true })
}

// ── Socials ───────────────────────────────────────────────────────────────────

export function normalizeSocial(rawUnknown: unknown): Social {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    platform: asString(pick(raw, "platform")),
    url: asString(pick(raw, "url")),
    icon: asString(pick(raw, "icon")),
    sort_order: asNumber(pick(raw, "sort_order")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export const ADMIN_SOCIALS_KEY = "/api/admin/socials"

export async function listSocials(): Promise<ApiResult<Social[]>> {
  const res = await request<{ socials?: unknown }>("/api/socials")
  if (!res.ok) return res
  const list = Array.isArray(res.data.socials) ? res.data.socials : []
  return ok(list.map(normalizeSocial), res.status)
}

export async function createSocial(input: SocialInput): Promise<ApiResult<Social>> {
  const res = await request<{ social?: unknown }>("/api/admin/socials", {
    method: "POST", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSocial(res.data.social), res.status)
}

export async function updateSocial(id: number | string, input: SocialInput): Promise<ApiResult<Social>> {
  const res = await request<{ social?: unknown }>(`/api/admin/socials/${id}`, {
    method: "PUT", auth: true, json: input,
  })
  if (!res.ok) return res
  return ok(normalizeSocial(res.data.social), res.status)
}

export async function deleteSocial(id: number | string): Promise<ApiResult<unknown>> {
  return request(`/api/admin/socials/${id}`, { method: "DELETE", auth: true })
}

// ── CV ────────────────────────────────────────────────────────────────────────

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
  if (!fileName) return null
  return `${apiBase()}/uploads/${fileName}`
}

export function normalizeCV(rawUnknown: unknown): CV {
  const raw = asRecord(rawUnknown)
  return {
    id: asNumber(pick(raw, "id", "ID")),
    file_name: asString(pick(raw, "file_name", "FileName")),
    created_at: asString(pick(raw, "created_at", "CreatedAt")),
    updated_at: asString(pick(raw, "updated_at", "UpdatedAt")),
  }
}

export async function uploadCV(file: File): Promise<ApiResult<CV>> {
  const data = new FormData()
  data.append("cv", file)
  const res = await request<{ cv?: unknown }>("/api/admin/cv", {
    method: "POST", auth: true, body: data,
  })
  if (!res.ok) return res
  return ok(normalizeCV(res.data.cv), res.status)
}
