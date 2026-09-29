# Portfolio Frontend

Next.js portfolio website and admin dashboard for Ahmed Wassim. The public site displays projects and articles from the portfolio API, while the admin area manages portfolio content and contact messages.

This is a standalone repository. Its companion backend is [portfolio](https://github.com/Ahmed-Wassim/portfolio), a Go + Gin API backed by PostgreSQL. The frontend runs on port `3001` and expects the API on port `9999` by default.

## Requirements

- Node.js 20 or later and npm 10 or later
- Docker Desktop to run the backend locally, or a separately running backend API

## Run Locally

Start the backend first by following its [setup instructions](https://github.com/Ahmed-Wassim/portfolio#readme). From that repository, the usual Docker setup is:

```bash
docker compose up -d --build
```

Then, in this repository:

```bash
npm install
```

Create `.env.local` in the project root and set the API URL if it differs from the default:

```env
NEXT_PUBLIC_API_URL=http://localhost:9999
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The frontend reads public portfolio content from the backend and uses its authenticated admin endpoints for the `/admin` dashboard. If the API is unavailable, API-backed sections may show empty or offline states.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server on port `3001` |
| `npm run build` | Build for production |
| `npm start` | Serve the production build on port `3001` |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript checker |
| `npm test` | Run the Vitest suite |
| `npm run check` | Run typecheck, lint, and tests |

## Production Configuration

Set `NEXT_PUBLIC_API_URL` to the deployed backend's public API base URL when building/deploying the frontend. Configure the backend's CORS allowlist to include the deployed frontend origin. This variable is public browser configuration; do not put secrets in it.

## Related Documentation

- [Backend repository and setup](https://github.com/Ahmed-Wassim/portfolio)
- [Getting started and running both services](docs/getting-started.md)
- [Backend API reference](docs/api-reference.md)
- [Architecture overview](docs/architecture.md)

For detailed route and data-shape information, see the [API reference](docs/api-reference.md).