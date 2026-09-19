"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, FolderKanban, FileText, Inbox, LogOut } from "lucide-react"
import { clearToken } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SidebarProps {
  unreadCount: number
}

const nav = [
  { label: "DASHBOARD", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "PROJECTS", href: "/admin/projects", icon: FolderKanban, exact: false },
  { label: "ARTICLES", href: "/admin/articles", icon: FileText, exact: false },
  { label: "MESSAGES", href: "/admin/messages", icon: Inbox, exact: false },
] as const

export function Sidebar({ unreadCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    clearToken()
    router.replace("/admin/login")
  }

  return (
    <aside className="w-56 shrink-0 border-r-2 border-[var(--ink)] bg-[var(--panel)] flex flex-col min-h-dvh">
      <div className="border-b-2 border-[var(--ink)] px-4 py-4">
        <p className="font-mono text-xs text-[var(--muted)] tracking-widest">ADMIN</p>
        <p className="font-mono font-black text-sm tracking-tight">AHMEDWASSIM.exe</p>
      </div>

      <nav className="flex-1 py-4" aria-label="Admin navigation">
        {nav.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-mono text-xs font-bold tracking-widest transition-colors focus-brutal",
                active
                  ? "bg-[var(--main)] text-[var(--ink)] border-r-2 border-[var(--ink)]"
                  : "hover:bg-[var(--ghost)]"
              )}
            >
              <Icon size={14} aria-hidden="true" />
              <span>{label}</span>
              {label === "MESSAGES" && unreadCount > 0 && (
                <span className="ml-auto border-brutal px-1.5 py-0.5 text-xs font-black bg-[var(--danger)] text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-2 border-[var(--ink)] p-4">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full font-mono text-xs font-bold tracking-widest text-[var(--danger)] hover:bg-[var(--ghost)] px-2 py-2 focus-brutal transition-colors"
        >
          <LogOut size={14} aria-hidden="true" />
          LOGOUT
        </button>
      </div>
    </aside>
  )
}
