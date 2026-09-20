"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9998] h-[3px] bg-[var(--main)] pointer-events-none"
      style={{
        width: `${progress}%`,
        transition: "width 80ms linear",
        boxShadow: "0 0 6px var(--main)",
      }}
    />
  )
}
