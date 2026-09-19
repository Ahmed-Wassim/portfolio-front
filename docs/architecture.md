# ARCHITECTURE

```
█████████████████████████████████████████
█                                       █
█   SYSTEM ARCHITECTURE: ONLINE         █
█   NEXT.JS 15 + GO + POSTGRESQL        █
█                                       █
█████████████████████████████████████████
```

---

## SYSTEM OVERVIEW

```
Browser
  │
  ├── http://localhost:3001  ←──── Next.js (App Router, React 19)
  │       │  RSC fetch (public pages)
  │       │  SWR fetch (admin, client)
  │       ▼
  └── http://localhost:9999  ←──── Go + Gin API
                                      │
                                      ▼
                                 PostgreSQL :5434
                                 (Docker / local)
```

---

## FILE TREE

```
portfolio-frontend/
├── public/
│   ├── cv.pdf                      # placeholder CV (replaceable)
│   └── placeholders/               # brutal SVG geometric blocks
├── src/
│   ├── app/
│   │   ├── layout.tsx              # fonts, no-FOUC theme script, skip link
│   │   ├── globals.css             # Tailwind v4 @theme tokens + brutal utilities
│   │   ├── page.tsx                # poster home — all sections, anchored
│   │   ├── error.tsx               # brutal RSC error boundary
│   │   ├── not-found.tsx           # brutal 404
│   │   ├── projects/[id]/page.tsx  # project detail (RSC)
│   │   ├── articles/[slug]/page.tsx # article detail + sanitized markdown (RSC)
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       └── (dashboard)/
│   │           ├── layout.tsx      # sidebar + auth guard
│   │           ├── page.tsx        # stats overview
│   │           ├── projects/       # list + create + edit
│   │           ├── articles/       # list + create + edit
│   │           └── messages/       # inbox + mark-read
│   ├── components/
│   │   ├── public/                 # Header, Hero, WorkSection, LogsSection,
│   │   │                           # AboutSection, SkillsSection, ExperienceSection,
│   │   │                           # HireMeForm, Footer, PlaceholderBlock, StatusPill
│   │   ├── admin/                  # Sidebar, DataTable, ProjectForm, ArticleForm,
│   │   │                           # MessagesList, StatCard, EmptyState
│   │   └── ui/                     # BrutalButton, Card, Badge, Tag, Reveal
│   ├── config/
│   │   └── site.ts                 # ALL static content (single source of truth)
│   ├── lib/
│   │   ├── api.ts                  # public + admin fetchers, uploadUrl, GORM normalize
│   │   ├── theme.tsx               # ThemeProvider + toggle (localStorage)
│   │   └── utils.ts                # cn(), log date formatter YYYY.MM.DD
│   └── types/
│       └── api.ts                  # Project, Article, Message, Dashboard, ApiResult
├── .env.local                      # NEXT_PUBLIC_API_URL=http://localhost:9999
└── docs/                           # ← you are here
```

---

## ROUTING

| Route | Render | Data source |
|---|---|---|
| `/` | RSC | static config + `fetch` projects & articles |
| `/projects/[id]` | RSC | `GET /api/projects/:id` → `notFound()` if missing |
| `/articles/[slug]` | RSC | `GET /api/articles/:slug` → `notFound()` if missing |
| `/admin/login` | Client | `POST /api/admin/login` → JWT → localStorage |
| `/admin` | Client (SWR) | `GET /api/admin/dashboard` |
| `/admin/projects` | Client (SWR) | `GET /api/projects` (public); mutations via `/api/admin/projects` |
| `/admin/articles` | Client (SWR) | `GET /api/admin/articles` |
| `/admin/messages` | Client (SWR) | `GET /api/admin/messages` |

---

## DATA FLOW

### Public pages (RSC)

```
page.tsx (Server Component)
  │
  ├── fetch("/api/projects", { cache: "no-store" })
  ├── fetch("/api/articles", { cache: "no-store" })
  │
  └── pass data as props to Client/Server components
        └── each fetch is independently try/caught
            → failure shows StatusPill + PlaceholderBlocks
            → does NOT crash the whole poster
```

### Admin pages (Client + SWR)

```
browser
  │
  ├── SWR key → lib/api.ts swrFetcher
  │     └── injects Authorization: Bearer <jwt> from localStorage
  │           └── 401 → clearToken() → toast → redirect /admin/login
  │
  └── mutations (create/update/delete)
        └── multipart FormData → POST/PUT/DELETE
              └── on success → sonner toast → mutate(SWR key)
```

---

## COMPONENT TREE — PUBLIC POSTER PAGE

```
<RootLayout>            fonts, theme script, skip link
  └── <ThemeProvider>
        └── <Header>    window bar, nav, theme toggle, HIRE ME CTA
            <main id="main">
              <Hero>         StatusPill, role fill+outline, yellow slab,
              │              VIEW WORK + DOWNLOAD CV, deco shapes, watermark
              <WorkSection>  project cards  01 / TITLE  →  /projects/[id]
              <LogsSection>  dated rows     [YYYY.MM.DD]  →  /articles/[slug]
              <AboutSection> config-driven prose
              <SkillsSection> config-driven skill grid
              <ExperienceSection> config-driven rows
              <HireMeSection> RHF+zod form → POST /api/contact
            <Footer>
```

Each section is wrapped in `<Reveal>` (IntersectionObserver fade-in). Reduced motion disables all reveals.

---

## COMPONENT TREE — ADMIN DASHBOARD

```
<RootLayout>
  └── <AdminLayout>    sidebar + auth guard (no token → redirect login)
        ├── <Sidebar>  Dashboard / Projects / Articles / Messages (unread badge) / Logout
        └── <page>
              ├── /admin         → StatCards (projects, articles, unread)
              ├── /admin/projects → DataTable + ProjectForm (multipart)
              ├── /admin/articles → DataTable + ArticleForm (multipart, slug 409)
              └── /admin/messages → MessagesList + mark-read (optimistic)
```

---

## DATA NORMALIZATION

The Go backend uses GORM which embeds `ID`, `CreatedAt`, `UpdatedAt` (PascalCase). `lib/api.ts` normalizes everything before components ever see it:

```ts
// raw from API            →  normalized (components use this)
{ ID: 1, CreatedAt: "..." } → { id: 1, created_at: "..." }
```

`normalizeProject`, `normalizeArticle`, `normalizeMessage` handle this. See `src/lib/api.ts`.

---

## STATIC CONTENT RULE

All static copy — window title, hero text, tagline, stack, nav links, about, skills, experience, social links — lives in **one file only**:

```
src/config/site.ts
```

No component hardcodes any copy. To change the tagline: edit `site.ts`. That is the single source of truth.

---

## AUTH FLOW

```
1. POST /api/admin/login  {email, password}
2. API returns {token}  (JWT HS256, 24h)
3. Frontend stores token in localStorage (key: "portfolio.token")
4. All /api/admin/* requests attach: Authorization: Bearer <token>
5. On 401 → clearToken() + sonner toast + redirect /admin/login
6. Logout = clearToken() only (no backend endpoint)
```

---

## TYPES

```ts
ApiResult<T>  =  { ok: true, data: T, error: null, status }
              |  { ok: false, data: null, error: string, status }

Project   { id, title, description, image?, link?, github?, featured, created_at, updated_at }
Article   { id, title, slug, content, image?, published, created_at, updated_at }
Message   { id, name, email, subject, body, is_read, created_at }
Dashboard { projects: number, articles: number, unread_messages: number }
```

`image` is a filename string. To get a displayable URL: `uploadUrl(image)` → `{API_BASE}/uploads/{filename}`.

---

## CONVENTIONS

- Colors only via CSS tokens. Never raw hex in components.
- Static copy only from `src/config/site.ts`.
- Public fetch errors stay inside the section — never throw past `page.tsx`.
- Named exports throughout (no default exports for rounds).
- No comments in source unless explicitly requested.

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```
