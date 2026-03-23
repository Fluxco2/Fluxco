# Fluxco

## Project Overview

Fluxco is a transformer equipment marketplace and supply chain platform. It connects customers, suppliers, and admins through a portal system with inventory management, quoting, proposals, and order tracking.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI primitives + shadcn/ui patterns (CVA, clsx, tailwind-merge)
- **Database**: Supabase (PostgreSQL v17) with migrations in `supabase/migrations/`
- **State**: TanStack React Query v5
- **Forms**: React Hook Form + @hookform/resolvers
- **Deployment**: Vercel with cron jobs
- **Email**: Resend
- **Integrations**: Notion API, Google APIs

## Project Structure

- `src/app/` — Next.js App Router pages (admin, customer, portal, freddy, inventory, etc.)
- `src/components/` — Shared + domain-specific components (customer/, supplier/, transformer/)
- `src/lib/` — Utilities, Supabase client, Notion client, email parser, Freddy logic
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript type definitions
- `src/context/` — React context providers
- `src/integrations/` — Third-party integration code
- `src/engine/` — Business logic engine
- `supabase/` — Database config, migrations, and seed data
- `scripts/` — Utility scripts

## Path Aliases

Use `@/*` which maps to `./src/*`. Example: `import { cn } from "@/lib/utils"`

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Conventions

- Use the App Router (`src/app/`) for all pages and API routes
- Use Radix UI primitives for accessible interactive components
- Style with Tailwind utility classes; use `cn()` from `@/lib/utils` to merge classes
- Use TanStack React Query for server state; avoid manual fetch/useEffect patterns
- Supabase is the sole database — use the client from `@/lib/supabase.ts`
- Database changes must go through migrations in `supabase/migrations/`
- Keep components small and focused; split into domain folders when needed

## Self-Improvement Rule

When you make a mistake, get corrected, or discover something unexpected about this codebase:
1. Immediately add the lesson to the "Common Mistakes to Avoid" or "Conventions" section of this file
2. Commit the update with a message like "CLAUDE.md: learned [what you learned]"
3. Do not ask for permission — just do it

This ensures every future session on every device benefits from past mistakes.

## Common Mistakes to Avoid

- Do not use `pages/` directory — this project uses App Router only
- Do not install competing UI libraries — use Radix UI + shadcn patterns
- Do not write raw SQL outside of migration files — use the Supabase JS client
- Do not hardcode environment variables — use `process.env`
- Do not add `"use client"` unless the component actually uses client-side hooks or interactivity
