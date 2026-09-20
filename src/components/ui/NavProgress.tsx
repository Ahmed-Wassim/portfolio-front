"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function NavProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const [width, setWidth] = useState(0)
  const prevPath = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    // Clear any running animation
    if (timerRef.current) clearTimeout(timerRef.current)
    if (frameRef.current) clearInterval(frameRef.current)

    // Start: show bar at 0, animate to ~85% quickly
    setWidth(0)
    setActive(true)

    // Ramp to 85% in ~300ms via small increments
    let w = 0
    frameRef.current = setInterval(() => {
      w = Math.min(w + (85 - w) * 0.18 + 1, 85)
      setWidth(w)
      if (w >= 84.9) {
        clearInterval(frameRef.current!)
      }
    }, 16)

    // Complete: jump to 100, then fade out
    timerRef.current = setTimeout(() => {
      if (frameRef.current) clearInterval(frameRef.current)
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setActive(false)
        setWidth(0)
      }, 300)
    }, 350)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (frameRef.current) clearInterval(frameRef.current)
    }
  }, [pathname])

  if (!active && width === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-[var(--secondary)] pointer-events-none"
      style={{
        width: `${width}%`,
        transition: width === 100 ? "width 150ms ease-out, opacity 300ms 150ms" : "width 80ms linear",
        opacity: active ? 1 : 0,
        boxShadow: "0 0 8px var(--secondary)",
      }}
    />
  )
}
