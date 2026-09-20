"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "@/lib/theme"
import { site } from "@/config/site"
import { cn } from "@/lib/utils"
import { Sun, Moon } from "lucide-react"

// Extract anchor IDs from nav hrefs like "#about" → "about"
const sectionIds = site.nav
  .map((item) => item.href.replace("#", ""))
  .filter(Boolean)

export function Header() {
  const { theme, toggle } = useTheme()
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  function scrollToHire(e: React.MouseEvent) {
    e.preventDefault()
    const section = document.getElementById("hire")
    if (!section) return
    section.scrollIntoView({ behavior: "smooth" })
    const first = section.querySelector<HTMLElement>(
      "input, textarea, select, button"
    )
    first?.focus({ preventScroll: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--ink)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">

        {/* Window-bar title + traffic-light dots */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[var(--danger)] border border-[var(--ink)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--main)] border border-[var(--ink)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--status-online)] border border-[var(--ink)]" />
          </div>
          <Link
            href="/"
            className="font-mono font-bold text-sm tracking-tight truncate flash-blue focus-brutal"
          >
            {site.windowTitle}
          </Link>
        </div>

        {/* Nav */}
        <nav
          aria-label="Primary navigation"
          className="ml-auto flex items-center gap-1 sm:gap-3 flex-wrap justify-end"
        >
          {site.nav.map((item) => {
            const sectionId = item.href.replace("#", "")
            const isActive = activeSection === sectionId
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-mono text-xs font-bold tracking-widest px-1 py-0.5 focus-brutal transition-colors",
                  isActive
                    ? "text-[var(--secondary)]"
                    : "flash-blue"
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {item.label}
              </Link>
            )
          })}

          {/* HIRE ME */}
          <a
            href={site.hireMeHref}
            onClick={scrollToHire}
            className="btn-brutal btn-brutal-main focus-brutal ml-1 text-xs px-3 py-1.5"
          >
            {site.hireMeLabel}
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="btn-brutal btn-brutal-panel focus-brutal p-1.5 ml-1"
          >
            {theme === "light" ? (
              <Moon size={14} aria-hidden="true" />
            ) : (
              <Sun size={14} aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
