# AHMEDWASSIM.exe — Portfolio Frontend

```
█████████████████████████████████████████
█                                       █
█   SYSTEM STATUS: ONLINE               █
█   FULL STACK PORTFOLIO — MONOREPO     █
█                                       █
█████████████████████████████████████████
```

> **I build digital products that refuse to be boring.**
> `Laravel` · `Go` · `PostgreSQL` · `Redis` · `Docker`

---

## WHAT IS THIS?

A neo-brutalist developer portfolio — public-facing site + admin dashboard — built with **Next.js 15 App Router**, backed by a **Go + Gin + PostgreSQL** REST API.

The two services live side-by-side under `D:\Go\services\`:

```
services/
├── portfolio/           ← Go API (port 9999)
└── portfolio-frontend/  ← Next.js site (port 3001)
```

---

## SECTIONS

| Route | Purpose |
|---|---|
| `/` | Poster home — Hero, Work, Logs, About, Skills, Hire Me |
| `/projects/[id]` | Project detail page |
| `/articles/[slug]` | Article / log detail with sanitized markdown |
| `/admin/login` | JWT login |
| `/admin` | Dashboard — stats, projects, articles, messages |

---

## DOCS INDEX

### Published docs
| File | Covers |
|---|---|
| **[getting-started.md](./getting-started.md)** | Prerequisites, install, run, build |
| **[architecture.md](./architecture.md)** | Routing, data flow, component tree |
| **[api-reference.md](./api-reference.md)** | Every endpoint, payloads, error strings |
| **[design-system.md](./design-system.md)** | Tokens, utilities, brutalist patterns |
| **[admin-guide.md](./admin-guide.md)** | Login, CRUD, inbox, edge cases |

### Internal spec files (`spec-*.md`)
| File | Covers |
|---|---|
| **[spec-context.md](./spec-context.md)** | Original project brief — tech decisions, palette, API contract |
| **[spec-architecture.md](./spec-architecture.md)** | Original architecture spec — file tree, component map |
| **[spec-guide.md](./spec-guide.md)** | Build task guide — ordered A→F checklist |
| **[spec-progress.md](./spec-progress.md)** | Living progress tracker — flip boxes as tasks complete |

---

## QUICK START

```bash
# 1 — start the API
cd D:\Go\services\portfolio
docker compose up -d

# 2 — install & run the frontend
cd D:\Go\services\portfolio-frontend
npm install
npm run dev        # → http://localhost:3001

# 3 — build for production
npm run build
npm start
```

Full details → [getting-started.md](./getting-started.md)

---

## TECH STACK

```
FRONTEND                    BACKEND
─────────────────────────   ──────────────────────────
Next.js 15 (App Router)     Go 1.26 + Gin
React 19                    GORM + PostgreSQL
TypeScript                  JWT (HS256, 24h)
Tailwind CSS v4             Docker Compose
SWR (admin)                 UUID file uploads
react-hook-form + zod
sonner (toasts)
lucide-react (icons)
IBM Plex Mono + Space Grotesk
```

---

## DESIGN LANGUAGE

**Neo-brutalist editorial.** Inspired by Bloomberg Businessweek, Balenciaga editorial, Are.na.

- Bold oversized typography — filled + outline (`-webkit-text-stroke`) mixed display type
- 2px solid ink borders, square corners, hard offset shadows (`4px 4px 0`)
- Visible dot grid background
- Early-web blue flash on hover (`--secondary`)
- Window-bar header — `AHMEDWASSIM.exe` + traffic-light dots
- Light / dark via localStorage toggle, no-FOUC

Full token table → [design-system.md](./design-system.md)

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```
