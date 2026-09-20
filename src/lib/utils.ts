import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes safely, resolving conflicts.
 * Usage: cn("px-4", condition && "bg-main", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format an ISO date string as YYYY.MM.DD for LOGS section display.
 * Returns empty string on invalid input rather than throwing.
 */
export function formatLogDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}.${mm}.${dd}`
}

/**
 * Estimate reading time from markdown/plain text content.
 * Average reading speed: 200 wpm.
 */
export function readingTime(text: string): string {
  if (!text) return "1 min read"
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

/**
 * Format a relative timestamp — "3 hours ago", "yesterday", etc.
 */
export function timeAgo(iso: string): string {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
