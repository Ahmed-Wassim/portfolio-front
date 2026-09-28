/**
 * Public API surface.
 *
 * Everything else in the app imports from here. The implementation is split
 * across focused modules:
 *
 *   auth.ts       token storage + 401 handling
 *   http.ts       the fetch wrapper (never throws, resolves to ApiResult)
 *   coerce.ts     GORM → JS value coercion
 *   normalize.ts  one normalizer per entity
 *   resources.ts  endpoint registry; derives both SWR keys and CRUD helpers
 */

export {
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
  TOKEN_STORAGE_KEY,
} from "@/lib/auth"

export { apiBase, fail, ok, request, uploadUrl } from "@/lib/http"
export type { RequestOptions } from "@/lib/http"

export * from "@/lib/normalize"
export * from "@/lib/resources"
export * from "@/lib/extras"
