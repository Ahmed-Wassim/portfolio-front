# GUIDE.md

Ordered tasks. Each is small and verifiable. Follow top-to-bottom. After each task, update `progress.md` (mark `[x]`, leave `[ ]`).

Rules: no comments unless asked; colors only via tokens; static text only from `src/config/site.ts`; never change the port; follow `context.md` decisions (including §11 edge cases).

---

## A. Scaffold
- [ ] `A1` Create the Next.js app in **this folder** (App Router, TypeScript, Tailwind v4):
      `npx create-next-app@latest . --ts --tailwind --app --no-src-dir --import-alias "@/*"` (npm).
      If create-next-app refuses non-empty dir, scaffold in temp and move files keeping the 4 `.md` files.
- [ ] `A2` `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:9999`. Add port `3001` to `dev` script (`next dev -p 3001`).
- [ ] `A3` `npm i swr react-hook-form zod sonner lucide-react react-markdown remark-gfm rehype-sanitize`
- [ ] `A4` `git init` + initial commit (include the 4 `.md`; exclude `.env.local`). Add a tiny `public/cv.pdf` placeholder.

## B. Design system
- [ ] `B1` `src/app/globals.css`: tokens from `context.md` §3 (light `:root`, dark `[data-theme="dark"]`) including `--status-online`, `--danger`, `--success`, `--ghost` + Tailwind v4 `@theme` mapping + utilities (`.border-brutal`, `.shadow-brutal`, `.shadow-brutal-lg` with 6px in dark, `.outline-text`, `.btn-brutal` + `-ink` `-panel` `-main`, `.bg-grid`, `.bg-dots` via `--ghost`, `.flash-blue`, `.focus-brutal`, reduced-motion block).
- [ ] `B2` Layout: `next/font` IBM Plex Mono (mono) + Space Grotesk (sans), set as CSS vars; no-FOUC theme script in `<head>` (localStorage / `prefers-color-scheme`, `data-theme` before paint; default `light` if script fails); skip link to `#main`.
- [ ] `B3` `lib/theme.tsx`: ThemeProvider + toggle (persist to localStorage; if storage blocked, in-session only; after manual toggle, ignore system changes).
- [ ] `B4` `config/site.ts`: all static copy from `context.md` §5 (windowTitle, statusOnline/Offline, roleFilled/Outline, tagline, stack, watermark, nav, about, skills, experience, socials, workEmpty, logsEmpty, cv path `/cv.pdf`).
- [ ] `B5` `lib/utils.ts` (`cn` + log-date formatter `YYYY.MM.DD`) and `types/api.ts` (Project, Article, Message, Dashboard).
- Verify: `npm run dev` at 3001 renders an unstyled-but-tokenized page; theme toggle flips bg/ink; tokens include danger/success/ghost.

## C. Public poster page
- [ ] `C1` `components/ui/Reveal.tsx` — IntersectionObserver reveal wrapper (opacity/translate, configurable delay); no-op when `prefers-reduced-motion`.
- [ ] `C2` Header (window bar `AHMEDWASSIM.exe` + dots, nav anchors, HIRE ME `.btn-brutal-main` scrolls `#hire` and focuses first field) + Footer. `scroll-margin-top` on section ids. Title ellipsis at 320px.
- [ ] `C3` Hero — `StatusPill`; oversized mixed filled/outline role + visually-hidden full title (`clamp` wrap); yellow slab with tagline + stack in `--ink`; VIEW WORK `.btn-brutal-ink` + DOWNLOAD CV `.btn-brutal-panel`; watermark `--ghost`; deco shapes `pointer-events: none`, hidden `< sm`. CV click: if file 404, toast `CV file not found`.
- [ ] `C4` `lib/api.ts` already covers public + admin endpoints (see `src/lib/api.ts`). Wire pages to `{ ok, data, error }`; `uploadUrl` for images; no-store on RSC.
- [ ] `C5` `components/public/PlaceholderBlock.tsx` — brutal geometric SVG (tokens only) when a project/image is missing; `img onError` swaps to it.
- [ ] `C6` WorkSection — map projects: numbered `01 /` cards, featured then `created_at` desc; Card → `/projects/[id]`; empty = 3 PlaceholderBlocks + `workEmpty`; fetch fail = offline `StatusPill` + same blocks. Clamp long titles.
- [ ] `C7` LogsSection — rows `[YYYY.MM.DD]` + title → `/articles/[slug]`; empty = 3 skeleton rows + `logsEmpty`; fetch fail = offline pill.
- [ ] `C8` About / Skills / Experience sections from config (experience rows: `2025 — PRESENT  TRAVWARE  BACKEND DEVELOPER`).
- [ ] `C9` HireMeSection + `HireMeForm` — RHF+zod (`name` 1–80, `email`, `subject` 1–120, `body` 1–4000), disable while pending, `POST /api/contact`, sonner success/error mapped to API strings.
- [ ] `C10` Wire all sections into `src/app/page.tsx` in order (`#main` wrapper). Header nav smooth-scroll to `#about #skills #logs #work #hire`. Independent try/catch (or `ok` flags) per fetch.
- Verify: page renders with empty DB styled states, nav anchors clear the header, CV link works, API-down still shows poster.

## D. Detail pages
- [ ] `D1` `projects/[id]/page.tsx` — `GET /api/projects/:id`; brutal `not-found`; image / link / github; back link; image `onError` → PlaceholderBlock.
- [ ] `D2` `articles/[slug]/page.tsx` — `GET /api/articles/:slug`; markdown + remark-gfm + rehype-sanitize; `[YYYY.MM.DD]` + title; image; back link; http(s) links `rel="noopener noreferrer"` `target="_blank"`; code `overflow-x: auto`.
- [ ] `D3` `not-found.tsx` + `error.tsx` in brutal style (tokens only).
- Verify: `/projects/1`, `/articles/<any slug>` render; `/projects/999` and unknown slug show brutal 404.

## E. Admin
- [ ] `E1` `admin/login/page.tsx` — login form → `POST /api/admin/login`, store JWT in localStorage, redirect `/admin`; toast `invalid credentials` / `invalid request data`.
- [ ] `E2` `admin/(dashboard)/layout.tsx` — sidebar (Dashboard/Projects/Articles/Messages + unread `99+`, Logout=clear token) + auth guard (no token → redirect login; SWR 401 handler clears + toast + redirects).
- [ ] `E3` Dashboard page — `GET /api/admin/dashboard` → StatCards (projects, articles, unread messages).
- [ ] `E4` Projects list — SWR key `ADMIN_PROJECTS_KEY` (`/api/projects`, `listAdminProjects`). Never `GET /api/admin/projects`. Search/filter client-side, New + Delete (confirm), link to edit. Edit load `getAdminProject` / `adminProjectKey(id)`.
- [ ] `E5` ProjectForm — create + edit; multipart `POST`/`PUT /api/admin/projects`; featured `"true"`/`"false"`; image optional; on success toast + revalidate.
- [ ] `E6` Articles list — SWR `GET /api/admin/articles`, search, New + Delete (confirm), published badge.
- [ ] `E7` ArticleForm — create + edit; multipart (title, slug unique w/ inline 409 error, content markdown, published `"true"`/`"false"`, image); toast + revalidate.
- [ ] `E8` Messages inbox — SWR `GET /api/admin/messages`; expand subject/body; mark-read `PATCH` optimistic then revalidate; unread emphasis.
- Verify: login w/ `wassim@wassim.com` / `123456789` works (API up); CRUD + message mark-read round-trip through real API; 401 redirects to login.

## F. Polish & checks
- [ ] `F1` Responsive: stack header nav, hero type `clamp`, cards 1-col; deco hidden `< sm`; keep poster vibe on 320px and 375px.
- [ ] `F2` Hover/motion/a11y: links flash-blue only on real links; buttons snappy-press; focus-brutal on interactive; reduced-motion kills blink/reveals; skip link works.
- [ ] `F3` Empty-DB + API-down + missing image: public PlaceholderBlocks; admin EmptyState rows; WORK/LOGS offline pills.
- [ ] `F4` `npm run build` passes; `npm run lint` clean.
- [ ] `F5` Final commit + note in `progress.md`.

## Out of scope (do NOT do)
Multi-image inline articles, pagination, refresh tokens, auth on public pages, smooth-scroll libs, dark-image variants, print CSS.
