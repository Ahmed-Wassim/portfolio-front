/**
 * GORM payload → domain type.
 *
 * One normalizer per resource, used by both the SWR fetcher and the explicit
 * request functions so a record can never be shaped two different ways.
 */

import { asBool, asNumber, asRecord, asString, asTagNames, pick } from "@/lib/coerce"
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

export function normalizeProject(raw: unknown): Project {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    title: asString(pick(r, "title")),
    description: asString(pick(r, "description")),
    image: asString(pick(r, "image")),
    link: asString(pick(r, "link")),
    github: asString(pick(r, "github")),
    tags: asTagNames(pick(r, "tags")),
    featured: asBool(pick(r, "featured")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeArticle(raw: unknown): Article {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    title: asString(pick(r, "title")),
    slug: asString(pick(r, "slug")),
    content: asString(pick(r, "content")),
    image: asString(pick(r, "image")),
    tags: asTagNames(pick(r, "tags")),
    published: asBool(pick(r, "published")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeMessage(raw: unknown): Message {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    name: asString(pick(r, "name")),
    email: asString(pick(r, "email")),
    subject: asString(pick(r, "subject")),
    body: asString(pick(r, "body")),
    is_read: asBool(pick(r, "is_read")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
  }
}

export function normalizeTag(raw: unknown): Tag {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    name: asString(pick(r, "name")),
    article_count: asNumber(pick(r, "article_count")),
    project_count: asNumber(pick(r, "project_count")),
  }
}

export function normalizeProfile(raw: unknown): Profile {
  const r = asRecord(raw)
  const stack = Array.isArray(r.stack) ? r.stack.map(asString) : []
  return {
    id: asNumber(pick(r, "id", "ID")),
    tagline: asString(pick(r, "tagline")),
    stack,
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeAboutItem(raw: unknown): AboutItem {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    title: asString(pick(r, "title")),
    content: asString(pick(r, "content")),
    sort: asNumber(pick(r, "sort")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeSkill(raw: unknown): Skill {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    name: asString(pick(r, "name")),
    category_id: asNumber(pick(r, "category_id")),
    sort: asNumber(pick(r, "sort")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeSkillCategory(raw: unknown): SkillCategory {
  const r = asRecord(raw)
  const skills = Array.isArray(r.skills) ? r.skills : []
  return {
    id: asNumber(pick(r, "id", "ID")),
    name: asString(pick(r, "name")),
    sort: asNumber(pick(r, "sort")),
    skills: skills.map(normalizeSkill),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeExperience(raw: unknown): Experience {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    company: asString(pick(r, "company")),
    role: asString(pick(r, "role")),
    period: asString(pick(r, "period")),
    description: asString(pick(r, "description")),
    sort_order: asNumber(pick(r, "sort_order")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeSocial(raw: unknown): Social {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    platform: asString(pick(r, "platform")),
    url: asString(pick(r, "url")),
    icon: asString(pick(r, "icon")),
    sort_order: asNumber(pick(r, "sort_order")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}

export function normalizeCV(raw: unknown): CV {
  const r = asRecord(raw)
  return {
    id: asNumber(pick(r, "id", "ID")),
    file_name: asString(pick(r, "file_name", "FileName")),
    created_at: asString(pick(r, "created_at", "CreatedAt")),
    updated_at: asString(pick(r, "updated_at", "UpdatedAt")),
  }
}
