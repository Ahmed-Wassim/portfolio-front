"use client"

import useSWR from "swr"

import { DASHBOARD_KEY, swrFetcher } from "@/lib/api"
import type { Dashboard } from "@/types/api"

/**
 * The dashboard counts, polled for the sidebar's unread badge.
 *
 * Previously the shell and the dashboard page each called useSWR on the same
 * key, but only the shell set refreshInterval — so the badge kept updating
 * while the stat cards sat stale. Sharing one hook keeps them in step.
 */
export function useDashboard() {
  return useSWR<Dashboard>(DASHBOARD_KEY, swrFetcher, {
    refreshInterval: 30_000,
    shouldRetryOnError: false,
  })
}
