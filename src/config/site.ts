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
    { label: "/ABOUT",  href: "#about"  },
    { label: "/SKILLS", href: "#skills" },
    { label: "/LOGS",   href: "#logs"   },
    { label: "/WORK",   href: "#work"   },
  ] as const,

  hireMeLabel: "HIRE ME",
  hireMeHref: "#hire",

  // ── About ─────────────────────────────────────────────
  about: [
    "Backend engineer focused on building reliable, scalable systems.",
    "I work with Go, Laravel, and PostgreSQL to design APIs and services that hold up under pressure.",
    "I care about clean architecture, good developer tooling, and shipping things that work.",
  ] as const,

  // ── Skills ────────────────────────────────────────────
  skills: [
    {
      category: "LANGUAGES",
      items: ["Go", "PHP", "TypeScript", "SQL"],
    },
    {
      category: "FRAMEWORKS",
      items: ["Gin", "Laravel", "Next.js"],
    },
    {
      category: "DATA",
      items: ["PostgreSQL", "Redis", "GORM"],
    },
    {
      category: "INFRA",
      items: ["Docker", "Docker Compose", "Linux", "Nginx"],
    },
    {
      category: "TOOLS",
      items: ["Git", "GitHub", "REST APIs", "JWT"],
    },
  ] as const,

  // ── Experience ────────────────────────────────────────
  experience: [
    {
      period: "2025 — PRESENT",
      company: "TRAVWARE",
      role: "BACKEND DEVELOPER",
    },
  ] as const,

  // ── Socials ───────────────────────────────────────────
  socials: [
    { label: "GitHub",   href: "https://github.com/Ahmed-Wassim" },
    { label: "LinkedIn", href: "https://linkedin.com/in/ahmedwassim" },
  ] as const,

  // ── Empty / offline states ────────────────────────────
  workEmpty: "No projects yet — check back soon.",
  logsEmpty: "No logs yet — check back soon.",

  // ── Footer ────────────────────────────────────────────
  footerCredit: "Built by AHMEDWASSIM — Next.js · Go · PostgreSQL",
} as const

export type SiteConfig = typeof site
