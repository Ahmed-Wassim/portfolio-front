import { describe, expect, it } from "vitest"

import { formatLogDate, readingTime, timeAgo } from "@/lib/utils"

describe("formatLogDate", () => {
  it("formats as YYYY.MM.DD in UTC", () => {
    expect(formatLogDate("2026-01-02T03:04:05Z")).toBe("2026.01.02")
    expect(formatLogDate("2026-12-31T23:59:59Z")).toBe("2026.12.31")
  })

  it("zero-pads single-digit months and days", () => {
    expect(formatLogDate("2026-03-04T00:00:00Z")).toBe("2026.03.04")
  })

  it("returns an empty string for missing or invalid input", () => {
    expect(formatLogDate("")).toBe("")
    expect(formatLogDate("not a date")).toBe("")
  })
})

describe("readingTime", () => {
  it("estimates at 200 words per minute", () => {
    const words = Array.from({ length: 400 }, () => "word").join(" ")
    expect(readingTime(words)).toBe("2 min read")
  })

  it("never reports less than a minute", () => {
    expect(readingTime("a few words")).toBe("1 min read")
    expect(readingTime("")).toBe("1 min read")
  })
})

describe("timeAgo", () => {
  const ago = (ms: number) => timeAgo(new Date(Date.now() - ms).toISOString())

  it("formats recent times", () => {
    expect(ago(5_000)).toBe("just now")
    expect(ago(5 * 60_000)).toBe("5m ago")
    expect(ago(3 * 3_600_000)).toBe("3h ago")
    expect(ago(26 * 3_600_000)).toBe("yesterday")
    expect(ago(3 * 86_400_000)).toBe("3d ago")
    expect(ago(14 * 86_400_000)).toBe("2w ago")
    expect(ago(200 * 86_400_000)).toBe("6mo ago")
  })

  it("switches from weeks to months at 5 weeks", () => {
    expect(ago(34 * 86_400_000)).toBe("4w ago")
    expect(ago(35 * 86_400_000)).toBe("1mo ago")
  })

  it("covers every bucket boundary without falling through", () => {
    // Each threshold is checked on both sides, so a gap between two branches
    // would surface as an unexpected format here.
    for (const [days, expected] of [
      [0, "just now"],
      [1, "yesterday"],
      [2, "2d ago"],
      [6, "6d ago"],
      [7, "1w ago"],
      [14, "2w ago"],
      [34, "4w ago"],
      [35, "1mo ago"],
      [60, "2mo ago"],
      [90, "3mo ago"],
      [180, "6mo ago"],
      [364, "1y ago"],
    ] as const) {
      expect(ago(days * 86_400_000)).toBe(expected)
    }
  })

  it("returns an empty string for missing input", () => {
    expect(timeAgo("")).toBe("")
  })
})
