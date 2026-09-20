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
  // Fallback shown when the API is unavailable. Keep at least one entry.
  about: [
    "Backend engineer focused on building reliable, scalable systems.",
  ] as const,

  // ── Skills ────────────────────────────────────────────
  // Fallback shown when the API is unavailable.
  skills: [] as { category: string; items: string[] }[],

  // ── Experience ────────────────────────────────────────
  // Fallback shown when the API is unavailable.
  experience: [] as { period: string; company: string; role: string }[],

  // ── Socials ───────────────────────────────────────────
  // Fallback shown when the API is unavailable.
  socials: [
    { label: "GitHub",   href: "https://github.com/Ahmed-Wassim" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-wassim-27651b259" },
  ] as const,

  // ── Empty / offline states ────────────────────────────
  workEmpty: "No projects yet — check back soon.",
  logsEmpty: "No logs yet — check back soon.",

  // ── Footer ────────────────────────────────────────────
  footerCredit: "Built by AHMEDWASSIM — Next.js · Go · PostgreSQL",
} as const

export type SiteConfig = typeof site
