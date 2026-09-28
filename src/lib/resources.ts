/**
 * Resource registry.
 *
 * Every endpoint is declared once here: its path, the envelope the Go handlers
 * wrap it in, and the normalizer that shapes the row. SWR keys are derived from
 * the same declaration, so a key can never drift from the path it fetches, and
 * `swrFetcher` no longer needs to guess a normalizer from a URL string.
 */

import { asNumber, asRecord, pick } from "@/lib/coerce"
import { request, unwrapList, unwrapOne } from "@/lib/http"
import {
  normalizeAboutItem,
  normalizeArticle,
  normalizeCV,
  normalizeExperience,
  normalizeMessage,
  normalizeProfile,
  normalizeProject,
  normalizeSkill,
  normalizeSkillCategory,
  normalizeSocial,
  normalizeTag,
} from "@/lib/normalize"
import { ApiError } from "@/types/api"
import type {
  AboutItem,
  Article,
  CV,
  Experience,
  Message,
  Profile,
  Project,
  Skill,
  SkillCategory,
  Social,
  Tag,
} from "@/types/api"

/** A flat, unnormalized collection (dashboard counts, skills-by-category). */
type BareResource<T> = {
  /** Envelope key holding an array of rows. */
  list: string
  /** Envelope key holding a single row. */
  item: string
  normalize: (raw: unknown) => T
}

function resource<T>(list: string, item: string, normalize: (raw: unknown) => T): BareResource<T> {
  return { list, item, normalize }
}

/**
 * Read paths, keyed by the endpoint itself. `keyOf` maps a read path to the SWR
 * key that lists the same collection, which is how mutations know what to
 * revalidate.
 */
const READS = {
  projects: resource<Project>("projects", "project", normalizeProject),
  articles: resource<Article>("articles", "article", normalizeArticle),
  messages: resource<Message>("messages", "message", normalizeMessage),
  tags: resource<Tag>("tags", "tag", normalizeTag),
  profile: resource<Profile>("profile", "profile", normalizeProfile),
  about: resource<AboutItem>("about", "about", normalizeAboutItem),
  skillCategories: resource<SkillCategory>(
    "skill_categories",
    "skill_category",
    normalizeSkillCategory,
  ),
  skills: resource<Skill>("skills", "skill", normalizeSkill),
  experiences: resource<Experience>("experiences", "experience", normalizeExperience),
  socials: resource<Social>("socials", "social", normalizeSocial),
  cv: resource<CV>("cv", "cv", normalizeCV),
} as const

export type ResourceName = keyof typeof READS

// ── SWR keys ───────────────────────────────────────────────────────────────────
//
// One key per (path, shape). The dashboard polls DASHBOARD_KEY; admin list
// pages use the ADMIN_* variants.

export const ADMIN_PROJECTS_KEY = "/api/admin/projects"
export const ADMIN_ARTICLES_KEY = "/api/admin/articles"
export const ADMIN_MESSAGES_KEY = "/api/admin/messages"
export const ADMIN_TAGS_KEY = "/api/admin/tags"
export const ADMIN_PROFILE_KEY = "/api/admin/profile"
export const ADMIN_ABOUT_KEY = "/api/admin/about"
export const ADMIN_SKILL_CATEGORIES_KEY = "/api/admin/skill-categories"
export const ADMIN_SKILLS_KEY = "/api/admin/skills"
export const ADMIN_EXPERIENCES_KEY = "/api/admin/experiences"
export const ADMIN_SOCIALS_KEY = "/api/admin/socials"
export const ADMIN_CV_KEY = "/api/admin/cv"
export const DASHBOARD_KEY = "/api/admin/dashboard"

const PUBLIC_PROJECTS_KEY = "/api/projects"
const PUBLIC_ARTICLES_KEY = "/api/articles"

/**
 * Tag renames and deletes change the tag names embedded in content lists, so
 * those collections need revalidating too. Keeping the list here means a new
 * tagged resource only has to be added in one place.
 */
export const TAG_DEPENDENT_KEYS = [ADMIN_ARTICLES_KEY, ADMIN_PROJECTS_KEY] as const

/** Item paths used by SWR for single-record fetches. */
export function adminProjectKey(id: number | string) {
  return `${ADMIN_PROJECTS_KEY}/${id}`
}

export function adminArticleKey(id: number | string) {
  return `${ADMIN_ARTICLES_KEY}/${id}`
}

export function adminAboutKey(id: number | string) {
  return `${ADMIN_ABOUT_KEY}/${id}`
}

export function adminExperienceKey(id: number | string) {
  return `${ADMIN_EXPERIENCES_KEY}/${id}`
}

export function adminSocialKey(id: number | string) {
  return `${ADMIN_SOCIALS_KEY}/${id}`
}

// ── Key → envelope + normalizer ───────────────────────────────────────────────

/**
 * A route descriptor for every path that SWR may be asked to fetch. Built by
 * matching the concrete path back to its resource, so `/api/admin/skills/3`
 * and `/api/skills` both resolve to the right normalizer.
 */
function describe(path: string): BareResource<unknown> | null {
  // Dashboard returns scalar counts, not an envelope.
  if (path === DASHBOARD_KEY) return null

  const routes: Array<[string, BareResource<unknown>]> = [
    [ADMIN_PROJECTS_KEY, READS.projects],
    [PUBLIC_PROJECTS_KEY, READS.projects],
    [ADMIN_ARTICLES_KEY, READS.articles],
    [PUBLIC_ARTICLES_KEY, READS.articles],
    [ADMIN_MESSAGES_KEY, READS.messages],
    [ADMIN_TAGS_KEY, READS.tags],
    [ADMIN_PROFILE_KEY, READS.profile],
    [ADMIN_ABOUT_KEY, READS.about],
    [ADMIN_SKILL_CATEGORIES_KEY, READS.skillCategories],
    [ADMIN_SKILLS_KEY, READS.skills],
    [ADMIN_EXPERIENCES_KEY, READS.experiences],
    [ADMIN_SOCIALS_KEY, READS.socials],
    [ADMIN_CV_KEY, READS.cv],
  ]

  // Longest prefix wins so `/admin/skill-categories` is not mistaken for
  // `/admin/skills`.
  const match = routes
    .filter(([base]) => path === base || path.startsWith(`${base}/`))
    .sort((a, b) => b[0].length - a[0].length)[0]

  return match ? match[1] : null
}

export function isAdminKey(path: string) {
  return path.startsWith("/api/admin/")
}

function normalizeDashboard(payload: unknown) {
  const raw = asRecord(payload)
  return {
    projects: asNumber(pick(raw, "projects")),
    articles: asNumber(pick(raw, "articles")),
    unread_messages: asNumber(pick(raw, "unread_messages")),
  }
}

/**
 * SWR fetcher. Authenticated keys attach the JWT; the Go handlers wrap every
 * collection in a named envelope, so the descriptor above tells us what to
 * unwrap and how to shape the result.
 */
export async function swrFetcher<T = unknown>(key: string): Promise<T> {
  const path = key
  const res = await request<unknown>(path, { auth: isAdminKey(path) })

  // ApiError carries the HTTP status, so a caller can tell a 409 slug conflict
  // apart from a generic failure.
  if (!res.ok) throw new ApiError(res.error, res.status)

  if (path === DASHBOARD_KEY) return normalizeDashboard(res.data) as T

  const descriptor = describe(path)
  if (!descriptor) return res.data as T

  // A trailing segment means a single record; the bare path is a collection.
  const isItem = /\/[^/]+$/.test(path)
  return (isItem
    ? descriptor.normalize(unwrapOne(res.data, descriptor.item))
    : unwrapList(res.data, descriptor.list).map(descriptor.normalize)) as T
}

// ── Read helpers ──────────────────────────────────────────────────────────────

type FetchOptions = { revalidate?: number }

async function readList<T>(
  path: string,
  descriptor: BareResource<T>,
  options: FetchOptions = {},
) {
  const res = await request<unknown>(path, { revalidate: options.revalidate })
  if (!res.ok) return res
  return { ...res, data: unwrapList(res.data, descriptor.list).map(descriptor.normalize) }
}

async function readOne<T>(
  path: string,
  descriptor: BareResource<T>,
  options: FetchOptions = {},
) {
  const res = await request<unknown>(path, { revalidate: options.revalidate })
  if (!res.ok) return res
  return { ...res, data: descriptor.normalize(unwrapOne(res.data, descriptor.item)) }
}

export const listProjects = (o?: FetchOptions) =>
  readList(PUBLIC_PROJECTS_KEY, READS.projects, o)

export const getProject = (id: number | string, o?: FetchOptions) =>
  readOne(`${PUBLIC_PROJECTS_KEY}/${id}`, READS.projects, o)

export const listArticles = (o?: FetchOptions) =>
  readList(PUBLIC_ARTICLES_KEY, READS.articles, o)

export const getArticleBySlug = (slug: string, o?: FetchOptions) =>
  readOne(`${PUBLIC_ARTICLES_KEY}/${encodeURIComponent(slug)}`, READS.articles, o)

export const listAbout = (o?: FetchOptions) => readList("/api/about", READS.about, o)

export const getProfile = (o?: FetchOptions) => readOne("/api/profile", READS.profile, o)

export const listSkills = (o?: FetchOptions) =>
  readList("/api/skills", READS.skillCategories, o)

export const listExperiences = (o?: FetchOptions) =>
  readList("/api/experiences", READS.experiences, o)

export const listSocials = (o?: FetchOptions) => readList("/api/socials", READS.socials, o)

// ── Mutations ─────────────────────────────────────────────────────────────────

type Mutation = { method: string; body?: BodyInit | null; json?: unknown }

/**
 * One mutation helper for every write. The response is normalized through the
 * same descriptor as reads, so a create returns the same shape a re-fetch would.
 */
export async function mutateResource<T>(
  path: string,
  descriptor: BareResource<T>,
  options: Mutation,
  envelope: "item" | "list" = "item",
) {
  const res = await request<unknown>(path, {
    method: options.method,
    auth: true,
    body: options.body,
    json: options.json,
  })
  if (!res.ok) return res
  const data =
    envelope === "list"
      ? unwrapList(res.data, descriptor.list).map(descriptor.normalize)
      : descriptor.normalize(unwrapOne(res.data, descriptor.item))
  return { ...res, data }
}

export const createProject = (input: unknown) =>
  mutateResource(ADMIN_PROJECTS_KEY, READS.projects, {
    method: "POST",
    body: projectFormData(input as never),
  })

export const updateProject = (id: number | string, input: unknown) =>
  mutateResource(adminProjectKey(id), READS.projects, {
    method: "PUT",
    body: projectFormData(input as never),
  })

export const deleteProject = (id: number | string) =>
  request<unknown>(adminProjectKey(id), { method: "DELETE", auth: true })

export const createArticle = (input: unknown) =>
  mutateResource(ADMIN_ARTICLES_KEY, READS.articles, {
    method: "POST",
    body: articleFormData(input as never),
  })

export const updateArticle = (id: number | string, input: unknown) =>
  mutateResource(adminArticleKey(id), READS.articles, {
    method: "PUT",
    body: articleFormData(input as never),
  })

export const deleteArticle = (id: number | string) =>
  request<unknown>(adminArticleKey(id), { method: "DELETE", auth: true })

export const createAboutItem = (input: unknown) =>
  mutateResource(ADMIN_ABOUT_KEY, READS.about, { method: "POST", json: input })

export const updateAboutItem = (id: number | string, input: unknown) =>
  mutateResource(adminAboutKey(id), READS.about, { method: "PUT", json: input })

export const deleteAboutItem = (id: number | string) =>
  request<unknown>(adminAboutKey(id), { method: "DELETE", auth: true })

export const createExperience = (input: unknown) =>
  mutateResource(ADMIN_EXPERIENCES_KEY, READS.experiences, {
    method: "POST",
    json: input,
  })

export const updateExperience = (id: number | string, input: unknown) =>
  mutateResource(adminExperienceKey(id), READS.experiences, {
    method: "PUT",
    json: input,
  })

export const deleteExperience = (id: number | string) =>
  request<unknown>(adminExperienceKey(id), { method: "DELETE", auth: true })

export const createSocial = (input: unknown) =>
  mutateResource(ADMIN_SOCIALS_KEY, READS.socials, { method: "POST", json: input })

export const updateSocial = (id: number | string, input: unknown) =>
  mutateResource(adminSocialKey(id), READS.socials, { method: "PUT", json: input })

export const deleteSocial = (id: number | string) =>
  request<unknown>(adminSocialKey(id), { method: "DELETE", auth: true })

export const createSkillCategory = (input: unknown) =>
  mutateResource(ADMIN_SKILL_CATEGORIES_KEY, READS.skillCategories, {
    method: "POST",
    json: input,
  })

export const updateSkillCategory = (id: number | string, input: unknown) =>
  mutateResource(`${ADMIN_SKILL_CATEGORIES_KEY}/${id}`, READS.skillCategories, {
    method: "PUT",
    json: input,
  })

export const deleteSkillCategory = (id: number | string) =>
  request<unknown>(`${ADMIN_SKILL_CATEGORIES_KEY}/${id}`, {
    method: "DELETE",
    auth: true,
  })

export const createSkill = (input: unknown) =>
  mutateResource(ADMIN_SKILLS_KEY, READS.skills, { method: "POST", json: input })

export const updateSkill = (id: number | string, input: unknown) =>
  mutateResource(`${ADMIN_SKILLS_KEY}/${id}`, READS.skills, {
    method: "PUT",
    json: input,
  })

export const deleteSkill = (id: number | string) =>
  request<unknown>(`${ADMIN_SKILLS_KEY}/${id}`, { method: "DELETE", auth: true })

export const markMessageRead = (id: number | string) =>
  mutateResource(`${ADMIN_MESSAGES_KEY}/${id}`, READS.messages, { method: "PATCH" })

export const updateProfile = (input: unknown) =>
  mutateResource(ADMIN_PROFILE_KEY, READS.profile, { method: "PUT", json: input })

// ── Tags ──────────────────────────────────────────────────────────────────────

// The handler binds `form:"name"`, so this must be sent as form data rather
// than JSON.
export function renameTag(id: number | string, name: string) {
  const body = new FormData()
  body.append("name", name)
  return mutateResource(`${ADMIN_TAGS_KEY}/${id}`, READS.tags, { method: "PATCH", body })
}

export const deleteTag = (id: number | string) =>
  request<unknown>(`${ADMIN_TAGS_KEY}/${id}`, { method: "DELETE", auth: true })

// ── Multipart payloads ────────────────────────────────────────────────────────

export function projectFormData(input: {
  title: string
  description: string
  link?: string
  github?: string
  tags?: string[]
  featured: boolean
  image?: File | null
}) {
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

export function articleFormData(input: {
  title: string
  slug: string
  content?: string
  tags?: string[]
  published: boolean
  image?: File | null
}) {
  const data = new FormData()
  data.append("title", input.title)
  data.append("slug", input.slug)
  data.append("content", input.content ?? "")
  data.append("published", input.published ? "true" : "false")
  for (const tag of input.tags ?? []) data.append("tags", tag)
  if (input.image) data.append("image", input.image)
  return data
}
