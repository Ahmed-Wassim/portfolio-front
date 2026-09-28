# ARCHITECTURE

```
█████████████████████████████████████████
█                                       █
█   SYSTEM ARCHITECTURE: ONLINE         █
█   NEXT.JS 16 + GO + POSTGRESQL        █
█                                       █
█████████████████████████████████████████
```

---

## SYSTEM OVERVIEW

```
Browser
  │
  ├── http://localhost:3001  ←──── Next.js (App Router, React 19)
  │       │  RSC fetch (public pages, revalidate 60s)
  │       │  SWR fetch (admin, client, no-store)
  │       ▼
  └── http://localhost:9999  ←──── Go + Gin API
                                       │
                                       ▼
                                  PostgreSQL :5434
                                  (Docker / local)
```

---

## ROUTE GROUPS

Two groups, each owning their chrome. This is the main structural split: the
public group is server-rendered and cached, the dashboard group is client-side
and always live.

```
src/app/
├── layout.tsx            # fonts, no-FOUC theme script, skip link, ThemeProvider
├── error.tsx             # RSC error boundary
├── not-found.tsx         # 404
├── loading.tsx
├── (public)/             # ← public chrome: Header, Footer, BackToTop, Toaster
│   ├── layout.tsx
│   ├── page.tsx                    # poster home — all sections, anchored
│   ├── articles/page.tsx           # logs index, tag-filterable
│   ├── articles/[slug]/page.tsx
│   ├── projects/[id]/page.tsx
│   └── cv/page.tsx                 # inline PDF viewer
└── admin/
    ├── login/page.tsx              # own <main>, no public chrome
    └── (dashboard)/                # ← admin chrome: Sidebar + auth guard
        ├── layout.tsx
        ├── loading.tsx
        ├── page.tsx                # stats overview
        ├── about/                  # list + new + [id]/edit
        ├── articles/               # list + new + [id]/edit
        ├── experiences/            # list + new + [id]/edit
        ├── socials/                # list + new + [id]/edit
        ├── skills/                 # categories with inline skill editing
        ├── projects/               # list + new + [id]/edit
        ├── messages/               # inbox + mark-read (optimistic)
        ├── tags/                   # rename / delete across content
        ├── profile/                # tagline + stack
        └── cv/                     # CVCard with uploader
```

---

## ROUTING

| Route | Render | Data source |
|---|---|---|
| `/` | RSC, `revalidate 60` | six parallel public reads, each failing independently |
| `/articles` | RSC, `revalidate 60` | `GET /api/articles` |
| `/articles/[slug]` | RSC, `revalidate 60` | `GET /api/articles/:slug` → `notFound()` if missing |
| `/projects/[id]` | RSC, `revalidate 60` | `GET /api/projects/:id` → `notFound()` if missing |
| `/cv` | Client | `GET /api/cv`, fetched as a blob for inline display |
| `/admin/login` | Client | `POST /api/admin/login` → JWT → localStorage |
| `/admin/*` | Client (SWR) | `GET /api/admin/*`, `Authorization: Bearer <jwt>` |

### Why public pages are revalidated, not dynamic

`request()` sets `cache: "no-store"` by default because admin reads must always
be live. Server Components pass `{ revalidate: 60 }` instead, so an unchanged
page is served from cache and only re-fetches once a minute. This trades up to
60 seconds of staleness after an admin edit for roughly one API call per page
per minute instead of seven per page view.

---

## COMPONENT LAYERS

```
components/
├── public/    # poster sections + the pieces they share
│   Header, Footer, Hero, WorkSection, LogsSection, AboutSection,
│   SkillsSection, ExperienceSection, HireMeSection,
│   ArticleRow, ArticleList, ProjectImage, Tags, StatusPill,
│   PlaceholderBlock
├── admin/     # dashboard-only
│   PageHeader, DataList, RowActions, Row, FormShell, FormSkeleton,
│   ImagePicker, AdminGuard, DashboardShell, Sidebar, StatCard,
│   EmptyState, ApiErrorBanner, CVCard, TagInput, MarkdownEditor,
│   ProjectForm, ArticleForm, AboutItemForm, ExperienceForm, SocialForm
└── ui/        # shared primitives, no domain knowledge
    Field (+ TextField / TextAreaField / NumberField / CheckboxField),
    Section, Reveal, BackToTop, CopyButton, NavProgress, PageLoader,
    ScrollProgress
```

The split is by **knowledge**, not appearance. `ui/` components know nothing
about projects or articles; `admin/` and `public/` know about the domain but
not about each other.

---

## DATA LAYER

```
lib/
├── api.ts        # public surface — everything else imports from here
├── auth.ts       # token storage + 401 handling
├── http.ts       # the fetch wrapper
├── coerce.ts     # GORM → JS value coercion
├── normalize.ts  # one normalizer per entity
├── resources.ts  # endpoint registry
├── extras.ts     # auth, bulk upload, CV URLs (not entities)
├── markdown.tsx  # sanitized Markdown renderer
├── social-icons.ts
├── theme.tsx
└── utils.ts      # cn(), date formatting
```

### One registry, not two fetchers

`resources.ts` declares every endpoint once — its path, the envelope the Go
handler wraps it in, and the normalizer that shapes the row:

```ts
const READS = {
  projects: resource<Project>("projects", "project", normalizeProject),
  articles: resource<Article>("articles", "article", normalizeArticle),
  // …
}
```

The SWR keys and the CRUD helpers are both derived from that table, so a key
cannot drift from the path it fetches, and `swrFetcher` never has to guess a
normalizer by string-matching a URL.

`swrFetcher<T>(key)` infers auth from the key: anything under `/api/admin/`
attaches the JWT.

### Normalization

GORM emits PascalCase (`ID`, `CreatedAt`) and nests tags as objects. Every value
crossing the network boundary goes through `normalize.ts`:

```ts
// raw from API                              →  normalized
{ ID: 1, CreatedAt: "…", tags: [{ name }] } → { id: 1, created_at: "…", tags: ["…"] }
```

These are pure functions and are covered by `src/lib/api.test.ts`.

### `request()` never throws

It resolves to `ApiResult<T>` on every path, including network failure. Server
Components depend on this: an offline API must degrade one section, not blank
the page.

---

## DATA FLOW

### Public pages (RSC)

```
page.tsx (Server Component)
  │
  ├── listProjects({ revalidate: 60 })
  ├── listArticles({ revalidate: 60 })
  │     …
  └── pass data as props
        └── each fetch is independent
            → failure falls back to src/config/site.ts
            → does NOT crash the whole poster
```

### Admin pages (Client + SWR)

```
browser
  │
  ├── useSWR(ADMIN_*_KEY, swrFetcher)
  │     └── attaches Authorization: Bearer <jwt>
  │           └── 401 → clearToken() → toast → redirect /admin/login
  │
  └── useCrudForm
        └── create or update → multipart FormData or JSON
              └── toast → mutate(listKeys) → redirect
```

---

## STATIC CONTENT RULE

All static copy — window title, hero text, tagline, stack, nav links, about
fallback, skills fallback, experience fallback, social links — lives in
**`src/config/site.ts`**. No component hardcodes copy.

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

`AdminGuard` reads the token during the first render rather than in an effect,
so the dashboard is never flashed to an unauthenticated visitor.

---

## DESIGN TOKENS

`globals.css` defines each colour once in `:root`, with a `[data-theme="dark"]`
block overriding only what differs. The Tailwind v4 `@theme` aliases point at
those variables:

```css
:root { --panel: #FFFFFF; --color-panel: var(--panel); }
```

so editing a token propagates to every `bg-*` / `text-*` utility. The two
blocks must not hold separate hex copies.

---

## CONVENTIONS

- Colours only via CSS variables — never raw hex in components.
- Static copy only from `src/config/site.ts`.
- Public fetch errors stay inside the section — never throw past a page.
- Comments explain *why*, not *what*. The existing code follows this; match it.
- `npm run check` (typecheck + lint + test) must pass before committing.

---

## COMMANDS

```
npm run dev         # dev server on :3001
npm run build
npm run typecheck   # tsc --noEmit
npm run lint
npm run test        # vitest
npm run check       # all three
```
