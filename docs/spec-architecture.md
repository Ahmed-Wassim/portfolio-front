# ARCHITECTURE.md

The shape of the app, data flow, routes, and components.

## 1. Top-level layout

```
D:\Go\services\portfolio-frontend
├── public/
│   ├── cv.pdf                     # placeholder CV (replaceable)
│   └── placeholders/              # SVG geometric placeholder blocks (brutal style)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # fonts, theme no-FOUC script, skip link, html/body tokens
│   │   ├── globals.css            # Tailwind v4 @theme tokens + brutal utilities
│   │   ├── page.tsx               # poster home (anchored sections)
│   │   ├── error.tsx              # brutal fallback if a public RSC tree throws
│   │   ├── not-found.tsx          # brutal 404
│   │   ├── projects/[id]/page.tsx # project detail (RSC fetch)
│   │   ├── articles/[slug]/page.tsx # log detail, markdown (RSC fetch)
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       └── (dashboard)/
│   │           ├── layout.tsx     # sidebar shell + auth guard
│   │           ├── page.tsx       # stats overview
│   │           ├── projects/page.tsx (+ crud views)
│   │           ├── articles/page.tsx (+ crud views)
│   │           └── messages/page.tsx
│   ├── components/
│   │   ├── public/                # Header, Hero, WorkSection, LogsSection,
│   │   │                          # AboutSection, SkillsSection, ExperienceSection,
│   │   │                          # HireMeForm, Footer, PlaceholderBlock, StatusPill
│   │   ├── admin/                 # Sidebar, DataTable, ProjectForm, ArticleForm,
│   │   │                          # MessagesList, StatCard, EmptyState
│   │   └── ui/                    # BrutalButton, Card, Badge, Tag, Reveal (IO wrapper)
│   ├── config/
│   │   └── site.ts                # ALL static content (single file)
│   ├── lib/
│   │   ├── api.ts                 # public+admin fetchers, uploadUrl, GORM normalize
│   │   ├── theme.tsx              # theme provider/toggle (localStorage)
│   │   └── utils.ts               # cn(), date formatting for LOGS
│   └── types/
│       └── api.ts                 # Project, Article, Message, Dashboard models
├── .env.local                     # NEXT_PUBLIC_API_URL=http://localhost:9999
├── context.md
├── architecture.md
├── guide.md
└── progress.md
```

## 2. Routing
| Route | Type | Data |
|---|---|---|
| `/` | RSC | static config + `fetch` projects & articles (published); per-section try/catch |
| `/projects/[id]` | RSC | `GET /api/projects/:id` → `notFound()` on missing |
| `/articles/[slug]` | RSC | `GET /api/articles/:slug` → `notFound()` on missing |
| `/admin/login` | Client | POST login → store JWT → redirect |
| `/admin` | Client (SWR) | dashboard stats |
| `/admin/projects` | Client (SWR) | list via **public** `GET /api/projects`; create/update/delete via `/api/admin/projects` |
| `/admin/articles` | Client (SWR) | list + create → edit page / modal |
| `/admin/messages` | Client (SWR) | inbox + mark-read |

## 3. Data flow
- **Public** (RSC): `fetch(base + endpoint)` in server components with `cache: 'no-store'` (content is dynamic, admin edits). No client fetch on public list pages. Wrap WORK and LOGS fetches independently so one failure does not blank the poster.
- **Admin** (client): browser calls `http://localhost:9999` (CORS from `:3001`). `lib/api.ts` injects `Authorization: Bearer <jwt>` from `localStorage`; SWR `fetcher`. Any `401` → clear token, toast, redirect `/admin/login` (central helper). Wrong login password is `invalid credentials`, not `unauthorized`.
- **Admin projects list/get**: public `GET /api/projects` and `GET /api/projects/:id` (no admin GET). Mutations: `POST`/`PUT`/`DELETE /api/admin/projects`.
- **Auth guard**: `admin/(dashboard)/layout.tsx` checks token presence; SWR global `onError` handles 401.
- **Forms**: `react-hook-form` + `zod`; contact is **JSON**; project/article CRUD is **FormData**. Featured/published as `"true"` / `"false"`. Article PUT must send `published`. On success → `sonner.toast` → revalidate SWR cache. Pending → disable submit.

## 4. Types (normalized in `lib/api.ts`)
Raw GORM JSON uses `ID`, `CreatedAt`, `UpdatedAt`. After normalize:
```ts
Project   { id, title, description, image?, link?, github?, featured, created_at, updated_at }
Article   { id, title, slug, content, image?, published, created_at, updated_at }
Message   { id, name, email, subject, body, is_read, created_at }
Dashboard { projects: number, articles: number, unread_messages: number }
```
`image` is a filename. Display URL = `uploadUrl(image)`.

## 5. Design tokens (`globals.css`)
Define the table from `context.md` §3 as CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark). Register in Tailwind v4 `@theme` mapping: `--color-bg`, `--color-ink`, `--color-panel`, `--color-main`, `--color-secondary`, `--color-small`, `--color-muted`, `--color-border` (= ink), `--color-status-online`, `--color-danger`, `--color-success`, `--color-ghost`.

Brutal utilities:
- `.border-brutal` → `2px solid var(--color-ink)`
- `.shadow-brutal` → `4px 4px 0 var(--color-ink)`
- `.shadow-brutal-lg` → `8px 8px 0 var(--color-ink)` light; `[data-theme="dark"]` → `6px 6px 0`
- `.outline-text` → `-webkit-text-stroke` filled/outlined mixing
- `.btn-brutal` → square, 2px border, hard offset shadow, `:active` = translate(4px,4px) + shadow 0 (pressed)
- `.btn-brutal-ink` → filled `--ink`, text `--bg` (primary CTA)
- `.btn-brutal-panel` → filled `--panel` (secondary CTA)
- `.btn-brutal-main` → filled `--main` (HIRE ME)
- `.bg-grid` / `.bg-dots` → patterns using `--ghost`
- `.flash-blue` → link hover flips color to `var(--color-secondary)` (early-web)
- `.focus-brutal` → `:focus-visible` 2px ink outline + 2px offset (apply globally to interactive)
- `@media (prefers-reduced-motion: reduce)` — kill blink, reveals, transform hovers that move content

## 6. Public components (poster page, in order)
1. **SkipLink** — visually hidden until focus; href `#main`.
2. **Header** — window bar: `AHMEDWASSIM.exe` + dots (minimize/max/close), nav `/ABOUT /SKILLS /LOGS /WORK`, HIRE ME (`.btn-brutal-main`), theme toggle. Sticky; `scroll-margin-top` on sections.
3. **Hero** — `StatusPill` (online/offline); giant mixed filled/outline role + visually-hidden full title; yellow slab (`--main`) with tagline + mono stack (`--ink` only); `.btn-brutal-ink` VIEW WORK + `.btn-brutal-panel` DOWNLOAD CV; `--ghost` watermark from `site.watermark`; deco square (`--secondary`) + circles (`--ink`, `--small`), `pointer-events: none`, hidden under `sm`.
4. **WorkSection** — numbered cards `01 / PROJECT TITLE`, featured then `created_at` desc; Card → `/projects/[id]`; empty = 3 PlaceholderBlocks; fetch error = StatusPill offline + empty blocks.
5. **LogsSection** — dated rows `[YYYY.MM.DD]` + title → `/articles/[slug]`; empty = 3 skeleton rows; fetch error = offline pill.
6. **AboutSection / SkillsSection / ExperienceSection** — config-driven; experience rows like `2025 — PRESENT  TRAVWARE  BACKEND DEVELOPER`.
7. **HireMeForm** — `POST /api/contact`, zod from `context.md` §6, toast success (`--success`) / error (`--danger`). HIRE ME nav focuses first field.
8. **Footer** — small mono credits.

`Reveal` (IO component) wraps sections; stagger via CSS transition-delay; no-op under reduced motion.

`PlaceholderBlock` — geometric SVG using only tokens; used for missing images (`onError`) and empty WORK.

`StatusPill` — LED + label; `online` uses `--status-online` + blink; `offline` uses `--danger` + no blink.

## 7. Admin components
- **Shell**: left sidebar (Dashboard / Projects / Articles / Messages + unread badge `99+`, Logout). Guard redirect.
- **Dashboard**: StatCards (projects, articles, unread).
- **Projects**: table from SWR key `/api/projects` (`listAdminProjects` → public `GET /api/projects`; never `/api/admin/projects` for GET). Edit load `getAdminProject` → `GET /api/projects/:id`. Mutations: multipart `POST`/`PUT`/`DELETE /api/admin/projects`.
- **Articles**: table + search; ArticleForm (title, slug auto-generated + editable, content markdown textarea, published switch, image); inline 409 on slug.
- **Messages**: list + subject/body expand, mark-read button (optimistic), unread emphasis.
- **EmptyState**: brutal empty rows, not a sad illustration.

## 8. Conventions
- No comments unless asked. One truth per source.
- Named exports for rounds (not `default`) consistent throughout.
- Colors only via design tokens, never raw hex in components.
- Static content ONLY in `src/config/site.ts`; components import from it.
- Public fetch errors stay inside the section; do not throw past `page.tsx` unless the layout itself fails (`error.tsx`).
