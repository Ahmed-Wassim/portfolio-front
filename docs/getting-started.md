# GETTING STARTED

```
█████████████████████████████████████████
█                                       █
█   SYSTEM STATUS: READ THIS FIRST      █
█   BUILD GUIDE — FRONTEND + BACKEND    █
█                                       █
█████████████████████████████████████████
```

---

## PREREQUISITES

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | `node -v` to verify |
| npm | 10+ | bundled with Node |
| Go | 1.26+ | only needed to run backend natively |
| Docker Desktop | latest | preferred way to run the backend |
| Git | any | |

---

## PROJECT LAYOUT

```
D:\Go\services\
├── portfolio\           ← Go + Gin API  (port 9999)
└── portfolio-frontend\  ← Next.js site  (port 3001)
```

Both services are independent git repos. The frontend talks to the API over `http://localhost:9999`.

---

## STEP 1 — START THE BACKEND

The API is containerised. One command is all you need.

```bash
cd D:\Go\services\portfolio

# start PostgreSQL (port 5434) + API (port 9999) in the background
docker compose up -d
```

Verify it's alive:

```bash
curl http://localhost:9999/api/projects
# → {"projects":[]}
```

To stop:

```bash
docker compose down
```

> **Note:** The compose file maps host `5434` → container `5432` for Postgres, and exposes the API on the `PORT` env var (default `8080` in compose, but `.env` sets `9999` for local dev). Check `D:\Go\services\portfolio\.env` for the active value.

---

## STEP 2 — INSTALL FRONTEND DEPENDENCIES

```bash
cd D:\Go\services\portfolio-frontend
npm install
```

Dependencies installed:

```
next               react              react-dom
typescript         tailwindcss
swr                react-hook-form    zod
sonner             lucide-react
react-markdown     remark-gfm         rehype-sanitize
```

---

## STEP 3 — ENVIRONMENT

Create `.env.local` in the frontend root (it is gitignored):

```env
NEXT_PUBLIC_API_URL=http://localhost:9999
```

This is the only variable the frontend needs. If the file is missing, `lib/api.ts` falls back to `http://localhost:9999` automatically.

---

## STEP 4 — RUN DEV SERVER

```bash
npm run dev
```

Opens at **http://localhost:3001**

The dev script runs `next dev -p 3001`. Do not change the port — the backend CORS is configured for `:3001`.

---

## STEP 5 — BUILD FOR PRODUCTION

```bash
# type-check + compile
npm run build

# start the production server
npm start
```

The production server also runs on port `3001` (`next start -p 3001`).

Run lint before committing:

```bash
npm run lint
```

Both `build` and `lint` must pass clean before shipping.

---

## RUNNING THE BACKEND NATIVELY (no Docker)

If you prefer running Go directly:

```bash
cd D:\Go\services\portfolio

# copy the example env
cp .env.example .env
# edit .env — set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT=9999

# start a local Postgres first, then:
go run main.go
```

Make sure `PORT=9999` matches what the frontend expects.

---

## FULL LOCAL STACK — CHECKLIST

```
[ ] docker compose up -d              (API running on :9999)
[ ] curl http://localhost:9999/api/projects  returns {}
[ ] .env.local exists with correct API_URL
[ ] npm install completed
[ ] npm run dev → http://localhost:3001
[ ] poster page loads with empty-state cards
[ ] theme toggle flips light ↔ dark
[ ] /admin/login accessible
```

---

## DEMO CREDENTIALS (local dev only)

```
Email:    wassim@wassim.com
Password: 123456789
```

These are seeded in the backend config. Do not use in production.

---

## COMMON ISSUES

**`ECONNREFUSED` on API calls**
The backend is not running. Run `docker compose up -d` first.

**Port 3001 already in use**
Kill the existing process: `npx kill-port 3001` or stop the other app using that port.

**`Module not found` errors after clone**
Run `npm install`. The `node_modules` directory is gitignored.

**Blank page / no styles**
Tailwind v4 requires the `@theme` block in `globals.css`. If it is missing, run `git status` and restore `src/app/globals.css`.

**Image uploads not working**
The `uploads/` directory on the backend must exist and be writable. Docker compose mounts `./uploads:/app/data/uploads` automatically.

---

```
[VIEW WORK]  [DOWNLOAD CV ↓]
```
