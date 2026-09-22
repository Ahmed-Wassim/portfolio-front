/**
 * Single source of truth for all static content.
 * Components import from here — never hardcode copy in JSX.
 */

export const site = {
  // ── Header ────────────────────────────────────────────
  windowTitle: "AHMEDWASSIM.exe",

  // ── Hero ──────────────────────────────────────────────
  statusOnline: "SYSTEM STATUS: ONLINE",
  statusOffline: "SYSTEM STATUS: OFFLINE",

  /** Rendered filled (solid ink) */
  roleFilled: "BACKEND",
  /** Rendered outlined (-webkit-text-stroke) */
  roleOutline: "SOFTWARE ENGINEER",
  /** Visually hidden full string for screen readers */
  roleFullText: "BACKEND SOFTWARE ENGINEER",

  tagline: "I build digital products that refuse to be boring.",
  stack: ["Laravel", "Go", "PostgreSQL", "Redis", "Docker"] as const,

  /** Large ghost watermark behind hero */
  watermark: "CODE",

  /** Primary CTA */
  ctaPrimary: "VIEW WORK",
  ctaPrimaryHref: "#work",

  /** Secondary CTA */
  ctaSecondary: "DOWNLOAD CV ↓",
  ctaSecondaryHref: "/cv.pdf",

  // ── Nav ───────────────────────────────────────────────
  nav: [
    { label: "/ABOUT", href: "#about" },
    { label: "/SKILLS", href: "#skills" },
    { label: "/LOGS", href: "#logs" },
    { label: "/WORK", href: "#work" },
  ] as const,

  hireMeLabel: "HIRE ME",
  hireMeHref: "#hire",

  // ── About ─────────────────────────────────────────────
  // Fallback shown when the API is unavailable. Keep at least one entry.
  about: [
    "Backend engineer focused on building reliable, scalable systems that hold up under real-world pressure.",
    "I work primarily with Go and Laravel, designing REST APIs and microservices backed by PostgreSQL and Redis.",
    "I care about clean architecture — clear boundaries, minimal coupling, and code that the next person can actually read.",
    "Currently working at Travware as a Backend Developer, shipping production features and improving internal tooling.",
    "Outside of work I explore open-source projects, study distributed systems, and occasionally write about what I build.",
  ] as const,

  // ── Skills ────────────────────────────────────────────
  // Fallback shown when the API is unavailable or not yet seeded.
  skills: [
    { category: "LANGUAGES", items: ["Go", "PHP", "TypeScript", "SQL"] },
    { category: "FRAMEWORKS", items: ["Gin", "Laravel", "Next.js"] },
    { category: "DATA", items: ["PostgreSQL", "Redis", "GORM"] },
    { category: "INFRA", items: ["Docker", "Linux", "Nginx"] },
    { category: "TOOLS", items: ["Git", "REST APIs", "JWT"] },
  ] as const,

  // ── Experience ────────────────────────────────────────
  // Fallback shown when the API is unavailable or not yet seeded.
  experience: [
    { period: "2025 — PRESENT", company: "TRAVWARE", role: "BACKEND DEVELOPER" },
  ] as const,

  // ── Socials ───────────────────────────────────────────
  // Fallback shown when the API is unavailable.
  socials: [
    { label: "GitHub", href: "https://github.com/Ahmed-Wassim" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-wassim-27651b259" },
  ] as const,

  // ── Empty / offline states ────────────────────────────
  workEmpty: "No projects yet — check back soon.",
  logsEmpty: "No logs yet — check back soon.",

  // ── Footer ────────────────────────────────────────────
  footerCredit: "Built by AHMEDWASSIM",
} as const

export type SiteConfig = typeof site
