/**
 * Token storage for the admin session.
 *
 * Deliberately separate from the request layer: this is the only module that
 * knows the token exists in localStorage, and the only one that can decide what
 * happens when the server rejects it.
 */

const TOKEN_KEY = "portfolio.token"

export const TOKEN_STORAGE_KEY = TOKEN_KEY

let unauthorizedHandler: (() => void) | null = null

/**
 * Registered by AdminGuard. A 401 on any authenticated request clears the token
 * and hands control to the guard, which redirects to the login page.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export function getToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}

export function handleUnauthorized() {
  clearToken()
  unauthorizedHandler?.()
}
