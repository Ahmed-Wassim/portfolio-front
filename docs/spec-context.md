# CONTEXT.md

Everything a developer (human or AI) needs to build the frontend correctly. Read this first.

## 1. Project
- **Sibling frontend** for the backend at `D:\Go\services\portfolio` (a Go + Gin + PostgreSQL API, module `github.com/ahmedwassim/transactions`).
- **Location**: `D:\Go\services\portfolio-frontend` (outside the Go repo, own git repo).
- Port: frontend dev server **`3001`** (do not change). API base: `http://localhost:9999`.
- The user runs the API via `docker compose up -d` (Postgres on host `5434`; API port `9999`).

## 2. Tech stack (DECIDED — do not swap)
- Next.js **App Router**, **React 19**, **TypeScript**
- Tailwind CSS **v4** + design tokens in `globals.css` (`@theme`)
- Package manager: **npm**
- **RSC `fetch()`** for all public pages; **SWR** for the admin dashboard
- `react-hook-form` + `zod` for forms
- `sonner` for toasts
- `lucide-react` for icons
- `next/font` — **IBM Plex Mono** (labels / technical / headings) + **Space Grotesk** (body)
- `react-markdown` + `remark-gfm` + `rehype-sanitize` for article/log bodies

## 3. Design language
Neo-brutalist **editorial** poster style. Reference precedents: Bloomberg Businessweek, Balenciaga, Drudge Report, Typical Organization, Are.na (reviewed). Traits:
- Bold oversized typography, filled + outline (`-webkit-text-stroke`) mixed display type
- 2px solid ink borders, square corners (no rounded edges)
- Hard offset shadows (e.g. `shadow 4px 4px 0 #111`)
- Visible grid + dot field background
- Asymmetric "structured chaos" (structured ≠ random)
- No gradients, no glassmorphism, no smooth/rounded cards
- Early-web behavior: **links flash blue on hover** (maps to secondary accent). Flash-blue is **only** for real `<a>` / Next `Link` — never for decorative blue geometry.
- Skeuomorphic retro moment: window-style header `AHMEDWASSIM.exe` + traffic-light dots
- `:focus-visible` = 2px ink outline + 2px offset (brutal, not browser default). Skip link: "Skip to content" targeting `#main`.

### Palette (semantic tokens, LIGHT + DARK via toggle)

Keep warm paper `#F7F5ED` (not the reference's cooler near-white). Keep yellow `#FFF500` (slightly deeper than the mockup's `#FEFE33` for ink contrast on large slabs). Ink is `#111111` for body; display strokes may use the same token — do not introduce `#000000` unless mapped as `--ink`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F5ED` (warm paper) | `#0F0F0E` | Page field |
| `--ink` / borders / shadows | `#111111` | `#F7F5ED` | Text, borders, hard shadow fill |
| `--panel` | `#FFFFFF` | `#1C1C1C` | Cards, header bar, outlined buttons |
| `--main` | `#FFF500` | `#FFF500` | CTA surfaces, yellow hero slab |
| `--secondary` | `#3B82F6` | `#60A5FA` | Interactive link hover / labels only |
| `--small` | `#F472B6` | `#F9A8D4` | Badges, ticks, pink deco circle |
| `--muted` | `#6B6B6B` | `#9CA3AF` | Meta copy |
| `--status-online` | `#22C55E` | `#4ADE80` | Status LED only |
| `--danger` | `#DC2626` | `#F87171` | Form/API errors, delete, offline LED |
| `--success` | `#16A34A` | `#4ADE80` | Toast success (not the LED) |
| `--ghost` | `color-mix(in srgb, var(--ink) 8%, transparent)` | `color-mix(in srgb, var(--ink) 12%, transparent)` | Hero watermark, grid dots |

Register Tailwind aliases: `--color-bg`, `--color-ink`, `--color-panel`, `--color-main`, `--color-secondary`, `--color-small`, `--color-muted`, `--color-border` (= ink), `--color-status-online`, `--color-danger`, `--color-success`, `--color-ghost`.

**Palette rules**
- Colors only via tokens; never raw hex in components.
- `--main` slabs: body-sized text uses `--ink`, never `--muted` (contrast).
- Decorative blue square uses `--secondary` as **paint only** (`pointer-events: none`); do not attach hover-flash.
- Dark mode: yellow/pink stay vivid. Deco shapes may be smaller. Dot grid uses `--ghost` (must remain visible on `#0F0F0E`). Dark `shadow-brutal-lg` is **6px** offset (same visual weight as 8px on light).
- High-contrast / Windows HC: outline display type still has a visually-hidden full phrase for AT.

Dark mode: `localStorage` toggle, respects `prefers-color-scheme` on first visit, NO-FOUC inline script in `layout.tsx`. If `localStorage` is blocked, fall back to system preference and still allow in-session toggle. After a **manual** toggle, ignore later system changes. Default `data-theme="light"` on `<html>` if the script fails.

### Animations (DECIDED — no animation libraries)
- CSS-only mechanical/snappy hover states (transforms, 80–120ms, no ease-out mush)
- IntersectionObserver scroll reveals (opacity + translate fade-in)
- Early-web blue hover on links
- Status LED blink: ~1s opacity pulse. `prefers-reduced-motion: reduce` → solid ON, no reveal animation, no blink
- No Lenis / framer-motion / no scroll hijack

## 4. Site structure (DECIDED)
- **Poster home page** (single page): Header → Hero → WORK → LOGS → ABOUT/SKILLS → EXPERIENCE → HIRE ME
- Nav `/ABOUT /SKILLS /LOGS /WORK` scroll to anchored sections (single-page anchors); detail pages below are separate routes
- Sticky/fixed header: every section id uses `scroll-margin-top` so anchors are not hidden
- Detail routes: `/projects/[id]`, `/articles/[slug]`
- **Admin**: `/admin`, `/admin/login` (standing)
- Static content — hero copy, about, skills, experience, socials, CV path — lives in ONE config file `src/config/site.ts` (never edit components to change content)

## 5. Section → backend mapping
| Section | Source |
|---|---|
| Header `AHMEDWASSIM.exe` + nav + theme toggle | static (config) |
| Hero — status pill, `BACKEND SOFTWARE ENGINEER` (fill + outline), tagline, stack, `[VIEW WORK]` `[DOWNLOAD CV ↓]`, ghost watermark, deco shapes | static (config) |
| WORK (projects, numbered `01 / PROJECT`) | `GET /api/projects`; detail `GET /api/projects/:id` → `/projects/[id]` |
| LOGS (dated entries `[2026.08.14]`) | `GET /api/articles` (published only, date from `created_at`); detail `GET /api/articles/:slug` → `/articles/[slug]` |
| ABOUT / SKILLS / EXPERIENCE (`2025 — PRESENT TRAVWARE BACKEND DEVELOPER`) | static (config) |
| HIRE ME form | `POST /api/contact` → lands in admin Messages inbox |
| DOWNLOAD CV | placeholder `public/cv.pdf` (replaceable) |
| Admin dashboard | `GET /api/admin/dashboard` |

### Hero copy (config keys — decided)
- `windowTitle`: `AHMEDWASSIM.exe`
- `statusOnline`: `SYSTEM STATUS: ONLINE`
- `statusOffline`: `SYSTEM STATUS: OFFLINE` (section fetch failure)
- `roleFilled`: `BACKEND`
- `roleOutline`: `SOFTWARE ENGINEER` (wraps with `clamp`; visually-hidden full string `BACKEND SOFTWARE ENGINEER`)
- `tagline`: `I build digital products that refuse to be boring.`
- `stack`: `Laravel • Go • PostgreSQL • Redis • Docker`
- `watermark`: `CODE`
- CTAs: primary filled-ink **VIEW WORK** → `#work`; secondary panel **DOWNLOAD CV ↓** → `/cv.pdf`

## 6. Backend API contract (`http://localhost:9999`)
Live router: `D:\Go\services\portfolio\main.go`. All JSON unless noted. CORS allows `http://localhost:3001` (admin SWR in the browser). Auth: `Authorization: Bearer <token>` on all `/api/admin/*` EXCEPT login.

There is **no** `GET /api/admin/projects` and **no** `GET /api/admin/projects/:id`. Admin list/edit loads public `GET /api/projects` and `GET /api/projects/:id`. Mutations stay on `/api/admin/projects`.

### Auth
- `POST /api/admin/login` — JSON `{email, password}` → `{token}` (JWT HS256, **24h**). Demo creds: `wassim@wassim.com` / `123456789`.
- Bind fail: `400 invalid request data`. Wrong email/password: `401 invalid credentials`. Missing/bad/expired Bearer: `401 unauthorized`.

### Admin
- `GET /api/admin/dashboard` → `{projects, articles, unread_messages}` (counts)
- `POST /api/admin/projects` (multipart) → **201** `{project}` · `PUT /api/admin/projects/:id` · `DELETE /api/admin/projects/:id`
- `GET /api/admin/articles` (all, incl. drafts) · `GET /api/admin/articles/:id` · `POST` **201** · `PUT` · `DELETE /api/admin/articles/:id`
- `GET /api/admin/messages` → `{messages}` · `PATCH /api/admin/messages/:id` (mark read) → `{message}`
- **No logout, no refresh, no pagination** — all non-goals.

### Public
- `GET /api/projects` → `{projects:[...]}` (all projects, `created_at desc`) · `GET /api/projects/:id` → `{project}`
- `GET /api/articles` (published only) · `GET /api/articles/:slug` → `{article}` (published only)
- `POST /api/contact` — JSON `{name, email, subject, body}` → **201** `{message}`; email validated → `400 invalid request data`

### Form/shape rules
- Projects & articles POST/PUT are **multipart/form-data**
- **Project** fields: `title` (req), `description` (req), `link`, `github`, `featured` (oneof `true`/`false`/`1`/`0`), `image` (file, optional)
- **Article** fields: `title` (req), `slug` (req, unique → `409 slug already exists`), `content` (markdown), `published` (oneof `true`/`false`/`1`/`0`; **required on PUT**), `image` (file, optional)
- Omit the file on PUT to keep the existing image
- GORM embeds `ID`, `CreatedAt`, `UpdatedAt` (PascalCase). `lib/api.ts` normalizes to `id`, `created_at`, `updated_at`. LOGS dates use `created_at` after normalize.

### Uploads
- `GET /uploads/:filename`. Backend stores **filename only** (UUID + ext). Frontend: `uploadUrl(filename)` → `${NEXT_PUBLIC_API_URL}/uploads/${filename}`. Allowed: jpg, jpeg, png, webp, gif. Broken/missing → `PlaceholderBlock` (`img` `onError`). Bad type: `400 unsupported image format`.

### Error strings (use in UI copy/fallback)
`unauthorized`, `invalid credentials`, `not found`, `invalid request data`, `invalid id`, `slug already exists`, `unsupported image format`.

### Contact zod (client, decided)
`name` 1–80, `email` valid, `subject` 1–120, `body` 1–4000. Disable submit while pending (no double submit). Map 400 to toast using error strings above.

## 7. Data state
- **DB is EMPTY by choice.** No seed. Public page must show polished **empty states** + geometric SVG placeholder blocks in the poster style (do NOT ship sad/plain "no data").
- Preview images for cards: local/generated SVG placeholder blocks (brutal geometric shapes using palette) until real uploads exist.
- **Empty WORK**: 3 PlaceholderBlocks + short note from config (`workEmpty`).
- **Empty LOGS**: dated-row skeleton (3 muted rows) + `logsEmpty` — not a blank gap.
- **Fetch failure** (timeout/network): section still renders; status pill `--danger` + `statusOffline`; do not crash the whole poster. Detail routes: brutal 404 for missing id/slug; if API is down, same 404-style page with offline copy (not Next default).
- **WORK sort**: `featured` first, then `created_at` desc (stable). Titles clamp on cards; full text on detail.
- **No pagination** (non-goal): list everything the API returns.

## 8. Reference image (visual reference for a vision-capable AI)
Path recorded for build-time inspection (outside repo, may not exist on other machines):
`d:/courses/GoLang/W04kKeaN-FdvERtwxpmYuzQfXgH1R5JCwYUjiptp8dyQqpUX504v374HKXEmK0nmMiFlFn60w_AB7QyANqFXOqGaTWNM_UXyjWqTJCwul7HxAEr_-tEt4P2tjbLdBdq1D6XSWguYcBBFsUrKW4eGj-OU-aUbi-223clHjy9Mq-Um-i-zn4kwUBdmOzFxmTmd.jpg`

Preserve from the mockup: hierarchy (status → fill/outline title → yellow slab → dual CTAs), 2px ink + hard offset, blue/pink as **small geometry**, dot grid, faint watermark. Deltas vs mockup (keep ours): `AHMEDWASSIM.exe` + window dots, role string, **VIEW WORK** not VIEW DATABASE, warm paper, dark mode, tagline is ours to keep.

## 9. Admin dashboard features (DECIDED)
Login page → Stats overview (from dashboard endpoint) → Projects CRUD → Articles CRUD → Messages inbox → client-side search/filter. Sidebar nav. JWT in `localStorage`; on 401 clear token and redirect to `/admin/login`. Logout = clear token (no backend endpoint).
- Delete requires confirm.
- Slug `409` shown inline on the slug field.
- Unread badge: cap `99+`.
- Image upload: preview; reject obviously non-image client-side; map 400 from server.
- Admin UI stays calmer (`--panel` heavy) — do not yellow-slab every table row.
- Mark-read: optimistic then SWR revalidate.

## 10. Non-goals (explicitly out of scope)
- Multi-image inline article bodies (one image per article max)
- Pagination, refresh tokens, server-side sessions
- Auth on public pages
- Dark-mode image handling complexity (keep two palettes only)
- Live `prefers-color-scheme` updates after the user has manually toggled
- Print stylesheet

## 11. Edge cases (DECIDED — implement these)
- **Header**: window title ellipsis on 320px; nav stacks; HIRE ME scrolls to `#hire` and focuses the first form field.
- **Hero deco**: `pointer-events: none`; hide or park below the title under 640px so they never cover type.
- **CV**: if `public/cv.pdf` is missing at build/runtime, keep the control but `aria-disabled` + toast `CV file not found` on click (do not silent 404). Ship a tiny placeholder PDF in scaffold so the happy path works.
- **Markdown (logs)**: `rehype-sanitize`; GFM links `rel="noopener noreferrer"` + `target="_blank"` for http(s); code blocks `overflow-x: auto`; images `max-width: 100%`.
- **Keyboard**: all `.btn-brutal` are real buttons/links; outline headings are not focusable.
- **Admin JWT expiry mid-session**: central 401 handler, toast, redirect login.
- **Featured toggle / published**: send `true`/`false` strings in FormData as backend expects.
