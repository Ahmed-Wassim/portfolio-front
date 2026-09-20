export type ApiResult<T> =
  | { ok: true; data: T; error: null; status: number }
  | { ok: false; data: null; error: string; status: number }

export type Project = {
  id: number
  title: string
  description: string
  image: string
  link: string
  github: string
  featured: boolean
  created_at: string
  updated_at: string
}

export type Article = {
  id: number
  title: string
  slug: string
  content: string
  image: string
  published: boolean
  created_at: string
  updated_at: string
}

export type Message = {
  id: number
  name: string
  email: string
  subject: string
  body: string
  is_read: boolean
  created_at: string
}

export type Dashboard = {
  projects: number
  articles: number
  unread_messages: number
}

export type ProjectInput = {
  title: string
  description: string
  link?: string
  github?: string
  featured: boolean
  image?: File | null
}

export type ArticleInput = {
  title: string
  slug: string
  content?: string
  published: boolean
  image?: File | null
}

export type Profile = {
  id: number
  tagline: string
  stack: string[]
  created_at: string
  updated_at: string
}

export type AboutItem = {
  id: number
  title: string
  content: string
  sort: number
  created_at: string
  updated_at: string
}

export type ProfileInput = {
  tagline: string
  stack: string[]
}

export type AboutInput = {
  title?: string
  content: string
  sort?: number
}

export type ContactInput = {
  name: string
  email: string
  subject: string
  body: string
}

export type SkillCategory = {
  id: number
  name: string
  sort: number
  skills: Skill[]
  created_at: string
  updated_at: string
}

export type Skill = {
  id: number
  name: string
  category_id: number
  sort: number
  created_at: string
  updated_at: string
}

export type Experience = {
  id: number
  company: string
  role: string
  period: string
  description: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type Social = {
  id: number
  platform: string
  url: string
  icon: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type CV = {
  id: number
  file_name: string
  created_at: string
  updated_at: string
}

export type SkillCategoryInput = {
  name: string
  sort?: number
}

export type SkillInput = {
  name: string
  category_id: number
  sort?: number
}

export type ExperienceInput = {
  company: string
  role: string
  period: string
  description?: string
  sort_order?: number
}

export type SocialInput = {
  platform: string
  url: string
  icon?: string
  sort_order?: number
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
