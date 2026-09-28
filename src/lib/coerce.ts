/**
 * Coercion helpers for API payloads.
 *
 * GORM emits PascalCase (`ID`, `CreatedAt`) and loose types, so every value
 * crossing the network boundary is funnelled through these before it reaches a
 * component. Keeping them here means normalizers stay declarative.
 */

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

/** First defined value among `keys`, so PascalCase and snake_case both work. */
export function pick(raw: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  }
  return undefined
}

export function asString(value: unknown) {
  if (value == null) return ""
  return String(value)
}

export function asNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function asBool(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1
}

/**
 * Tags come back as objects ([{ ID, name }]) from the tags table, but the UI only
 * ever needs the names, so they are flattened here.
 */
export function asTagNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((tag) => (typeof tag === "string" ? tag : asString(asRecord(tag).name)))
    .filter(Boolean)
}
