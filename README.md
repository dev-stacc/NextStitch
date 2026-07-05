# next-stitch

**Live:** https://next-stitch-henna.vercel.app

A personal sewing project planner. This is a full rewrite of [SewingAssistant](https://github.com/StacAttacc/SewingAssistant) — the original was a separate React (Vite) frontend and Python (FastAPI) backend. This version collapses it into a single Next.js 16 app for simpler deployment and adds multi-user support with proper auth.

## Features

- **Projects** — create sewing projects, track status (to start / in progress / on hold / completed), set a budget, and see cost totals from patterns and materials
- **Patterns** — add from a URL (scraped from supported pattern sites), upload a PDF or image, or generate one with AI from a text description
- **Materials** — track fabric and supplies, mark as purchased, record price, attach a photo
- **Checklist** — per-project to-do list with drag-and-drop reordering and optional photo attachments on completion
- **Measurements** — project-scoped measurement sets, or global sets that can be linked across multiple projects
- **Progress photos** — horizontal photo gallery with a full-screen carousel viewer
- **Nearby fabric stores** — map view of fabric shops around a given location
- **LLM suggestions** — Claude-powered suggestions for patterns and materials based on the project description
- **AI pattern generation** — describe a garment and get a downloadable PDF pattern

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle |
| Auth | Auth.js v5 (credentials — email + bcrypt) |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| PDF generation | PDFKit (server-side) |
| Drag and drop | dnd-kit |
| Map | React Leaflet |
| Testing | Vitest (82 tests) |
| Dev environment | Nix + pnpm |

## Getting started

You need **Node 22** and **pnpm 11**. Install them however you like — the repo includes a `flake.nix` as a convenience if you use Nix and don't want these on your system path globally (`nix develop` drops you into a shell with both).

```bash
# Install dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env.local
```

Set the following in `.env.local`:

```
DATABASE_URL=          # Neon connection string (postgres://...)
AUTH_SECRET=           # Random secret for Auth.js (openssl rand -base64 32)
ANTHROPIC_API_KEY=     # Anthropic API key (required for LLM features)
```

```bash
# Run database migrations
pnpm db:migrate

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up for an account.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run test suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:generate` | Generate a new migration from schema changes |
| `pnpm db:push` | Push schema directly (dev only) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm lint` | Lint with ESLint |

## Project structure

```
app/
  (app)/            # Authenticated pages (layout enforces auth)
    projects/       # Project list and detail
    measurements/   # Global measurement sets
    stores/         # Nearby stores map
  api/              # API routes
  login/ signup/    # Public auth pages

src/
  api/              # Client-side fetch wrappers
  components/       # React components
  hooks/            # Custom hooks
  lib/              # Shared utilities (image compression, blob URLs)
  models/           # TypeScript types
  server/
    db/             # Drizzle schema, migrations, repo implementations
    services/       # LLM, pattern scrapers, store search, PDF gen
```

## Database

Migrations live in `src/server/db/migrations/`. Run `pnpm db:migrate` after pulling changes that include new migration files. The schema uses snake_case column names via Drizzle's `casing: 'snake_case'` option.
