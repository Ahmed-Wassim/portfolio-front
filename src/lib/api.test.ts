import { describe, expect, it } from "vitest"

import {
  ADMIN_SKILL_CATEGORIES_KEY,
  ADMIN_SKILLS_KEY,
  adminAboutKey,
  adminProjectKey,
  isAdminKey,
  TAG_DEPENDENT_KEYS,
} from "@/lib/resources"
import {
  normalizeArticle,
  normalizeProject,
  normalizeSkillCategory,
} from "@/lib/normalize"

/**
 * GORM emits PascalCase keys and nests tag associations as objects. These tests
 * pin that contract at the boundary, since every component depends on the shape
 * being normalized correctly.
 */

describe("normalizeProject", () => {
  it("converts GORM PascalCase to snake_case", () => {
    const project = normalizeProject({
      ID: 7,
      title: "Portfolio",
      description: "d",
      image: "a.png",
      link: "",
      github: "",
      featured: true,
      CreatedAt: "2026-01-02T03:04:05Z",
      UpdatedAt: "2026-01-02T03:04:05Z",
    })

    expect(project).toEqual({
      id: 7,
      title: "Portfolio",
      description: "d",
      image: "a.png",
      link: "",
      github: "",
      tags: [],
      featured: true,
      created_at: "2026-01-02T03:04:05Z",
      updated_at: "2026-01-02T03:04:05Z",
    })
  })

  it("flattens tag objects to names", () => {
    const project = normalizeProject({
      ID: 1,
      tags: [
        { ID: 3, name: "go" },
        { ID: 4, name: "api" },
      ],
    })
    expect(project.tags).toEqual(["go", "api"])
  })

  it("accepts tags already flattened to strings", () => {
    expect(normalizeProject({ ID: 1, tags: ["go"] }).tags).toEqual(["go"])
  })

  it("coerces the form-encoded booleans the API actually sends", () => {
    expect(normalizeProject({ ID: 1, featured: "true" }).featured).toBe(true)
    expect(normalizeProject({ ID: 1, featured: "false" }).featured).toBe(false)
    expect(normalizeProject({ ID: 1, featured: 0 }).featured).toBe(false)
  })

  it("degrades to a zero-valued record on garbage rather than throwing", () => {
    expect(normalizeProject(null)).toEqual({
      id: 0,
      title: "",
      description: "",
      image: "",
      link: "",
      github: "",
      tags: [],
      featured: false,
      created_at: "",
      updated_at: "",
    })
    expect(normalizeProject("nonsense").id).toBe(0)
    expect(normalizeProject([]).title).toBe("")
  })
})

describe("normalizeArticle", () => {
  it("normalizes a GORM row", () => {
    const article = normalizeArticle({
      ID: 2,
      title: "Logs",
      slug: "logs",
      content: "# hi",
      image: "",
      tags: [{ ID: 1, name: "go" }],
      published: true,
      CreatedAt: "2026-01-01T00:00:00Z",
      UpdatedAt: "2026-01-01T00:00:00Z",
    })

    expect(article.id).toBe(2)
    expect(article.slug).toBe("logs")
    expect(article.published).toBe(true)
    expect(article.tags).toEqual(["go"])
  })

  it("drops tag entries with no usable name", () => {
    const names = normalizeArticle({ ID: 1, tags: [{ ID: 1 }, "go", null] }).tags
    expect(names).toEqual(["go"])
  })
})

describe("normalizeSkillCategory", () => {
  it("normalizes nested skills", () => {
    const category = normalizeSkillCategory({
      ID: 1,
      name: "LANGUAGES",
      sort: 0,
      skills: [{ ID: 2, name: "Go", category_id: 1, sort: 0 }],
    })

    expect(category.skills).toHaveLength(1)
    expect(category.skills[0].name).toBe("Go")
    expect(category.skills[0].category_id).toBe(1)
  })

  it("treats a missing skills array as empty", () => {
    expect(normalizeSkillCategory({ ID: 1, name: "X" }).skills).toEqual([])
  })
})

describe("admin keys", () => {
  it("builds item paths from the collection base", () => {
    expect(adminProjectKey(5)).toBe("/api/admin/projects/5")
    expect(adminAboutKey(2)).toBe("/api/admin/about/2")
  })

  it("routes the project edit page at the admin endpoint, not the public one", () => {
    expect(adminProjectKey(1).startsWith("/api/admin/")).toBe(true)
  })
})

describe("isAdminKey", () => {
  it("flags admin paths as authenticated", () => {
    expect(isAdminKey("/api/admin/projects")).toBe(true)
    expect(isAdminKey("/api/admin/skills/3")).toBe(true)
  })

  it("leaves public paths unauthenticated", () => {
    expect(isAdminKey("/api/projects")).toBe(false)
    expect(isAdminKey("/api/articles/some-slug")).toBe(false)
  })
})

describe("skill category path disambiguation", () => {
  it("does not treat /skill-categories as /skills", () => {
    expect(ADMIN_SKILL_CATEGORIES_KEY).not.toBe(ADMIN_SKILLS_KEY)
    expect(ADMIN_SKILL_CATEGORIES_KEY.startsWith(ADMIN_SKILLS_KEY)).toBe(false)
  })
})

describe("TAG_DEPENDENT_KEYS", () => {
  it("covers every collection that embeds tag names", () => {
    expect(TAG_DEPENDENT_KEYS).toContain("/api/admin/articles")
    expect(TAG_DEPENDENT_KEYS).toContain("/api/admin/projects")
  })
})
