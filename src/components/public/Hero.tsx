"use client"

import Link from "next/link"
import { toast } from "sonner"
import { site } from "@/config/site"
import { StatusPill } from "@/components/public/StatusPill"

interface HeroProps {
  apiOnline: boolean
}

export function Hero({ apiOnline }: HeroProps) {
  function handleCvClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // We attempt a HEAD request; if it fails, toast and prevent navigation.
    // Because this is a local public file we can't reliably HEAD it, so we
    // rely on the link working. The spec says: if file 404, toast. We do a
    // fetch check on click.
    e.preventDefault()
    fetch(site.ctaSecondaryHref, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          toast.error("CV file not found")
        } else {
          window.open(site.ctaSecondaryHref, "_blank", "noopener")
        }
      })
      .catch(() => toast.error("CV file not found"))
  }

  return (
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)] bg-dots">
      {/* Deco shapes — pointer-events:none, hidden below sm */}
      <div className="pointer-events-none select-none hidden sm:block" aria-hidden="true">
        {/* Blue square */}
        <div className="absolute top-10 right-12 w-20 h-20 bg-[var(--secondary)] border-2 border-[var(--ink)] shadow-brutal" />
        {/* Pink circle */}
        <div className="absolute bottom-16 right-32 w-14 h-14 rounded-full bg-[var(--small)] border-2 border-[var(--ink)]" />
        {/* Ink circle outline */}
        <div className="absolute top-32 right-48 w-10 h-10 rounded-full border-2 border-[var(--ink)]" />
      </div>

      {/* Ghost watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-end pr-8 overflow-hidden"
      >
        <span
          style={{ color: "var(--ghost)" }}
          className="font-mono font-black text-[clamp(6rem,20vw,18rem)] leading-none tracking-tighter"
        >
          {site.watermark}
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        {/* Status pill */}
        <div className="mb-8">
          <StatusPill
            status={apiOnline ? "online" : "offline"}
            label={apiOnline ? site.statusOnline : site.statusOffline}
          />
        </div>

        {/* Role — mixed filled + outline */}
        <h1 className="font-mono font-black leading-none tracking-tighter mb-8">
          <span className="sr-only">{site.roleFullText}</span>
          <span aria-hidden="true" className="block text-[clamp(3rem,10vw,8rem)] text-[var(--ink)]">
            {site.roleFilled}
          </span>
          <span
            aria-hidden="true"
            className="block text-[clamp(2rem,7vw,5.5rem)] outline-text"
          >
            {site.roleOutline}
          </span>
        </h1>

        {/* Yellow tagline slab */}
        <div className="border-2 border-[#111111] bg-[var(--main)] shadow-brutal-lg inline-block px-5 py-4 mb-10 max-w-2xl"
          style={{ boxShadow: "8px 8px 0 #111111" }}
        >
          <p className="font-mono font-bold text-[#111111] text-[clamp(0.85rem,2vw,1.125rem)] leading-snug">
            {site.tagline}
          </p>
          <p className="font-mono text-xs text-[#111111] mt-2 tracking-widest">
            {site.stack.join(" · ")}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href={site.ctaPrimaryHref}
            className="btn-brutal btn-brutal-ink focus-brutal"
          >
            {site.ctaPrimary}
          </Link>
          <a
            href={site.ctaSecondaryHref}
            onClick={handleCvClick}
            className="btn-brutal btn-brutal-panel focus-brutal"
          >
            {site.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  )
}
