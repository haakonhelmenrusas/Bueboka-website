# Bueboka Web – Agent Guide

Archery companion web app (Next.js 16, TypeScript, PostgreSQL/Prisma, Better Auth). Norwegian UI strings throughout.

## Architecture Overview

- **`app/`** – Next.js App Router pages and API routes. Pages are client components; API routes are server-only.
- **`components/`** – All UI components, exported through `components/index.ts` barrel. Each component lives in its own folder with a co-located `.module.css` and optional `.test.tsx`.
- **`lib/`** – Shared server + client utilities: auth, prisma singleton, validations, cache, types, hooks.
- **`prisma/schema.prisma`** – Single source of truth for the data model. Generated client outputs to `prisma/prisma/generated/prisma-client/`.

## Critical Patterns

### Prisma Client
Import from `@/lib/prisma`, **never** directly from `@prisma/client`. Types are also re-exported from `@/lib/prisma`:
```ts
import { prisma } from '@/lib/prisma';
import type { Practice } from '@/lib/prisma';
```
The client uses a PrismaPg driver adapter + Prisma Accelerate extension.

### Prisma Enums on the Client
Never import Prisma enums from `@prisma/client` – it pulls the server bundle into client components and breaks Netlify builds. Use `lib/prismaEnums.ts` instead:
```ts
import { Environment, PracticeCategory } from '@/lib/prismaEnums';
```

### API Route Pattern
Every API route follows this structure:
1. `getCurrentUser()` guard (returns 401 if unauthenticated)
2. Zod `safeParse` from `lib/validations/<model>.ts`
3. `formatZodErrors` for 400 responses
4. Sentry capture in catch blocks
5. Invalidate `statsCache` on mutations

```ts
import { getCurrentUser } from '@/lib/session';
import { createPracticeSchema } from '@/lib/validations/practice';
import { formatZodErrors } from '@/lib/validations/helpers';
import { statsCache } from '@/lib/cache';
```

### Auth
- Server: `auth` from `@/lib/auth` (Better Auth instance), `getCurrentUser()` from `@/lib/session`
- Client: `signIn`, `signUp`, `signOut`, `useSession` from `@/lib/auth-client`

## Developer Workflows

```bash
# Local development (requires Docker)
npm run db:up           # Start Postgres in Docker
npm run prisma:migrate  # Apply migrations
npm run seed:local      # Seed with test data (optional)
npm run dev             # Start dev server at localhost:3000

# After schema changes
npm run prisma:generate # Regenerate client
npm run prisma:migrate  # Create + apply migration

# Testing
npm test                # Jest (jsdom)
npm run test:watch

# Code quality
npm run lint
npm run format          # Prettier
```

## Testing Conventions

- Tests co-located with components: `components/Practices/PracticeCard.test.tsx`
- `@/lib/auth-client` is globally mocked via `__mocks__/auth-client.ts` (see `jest.setup.js`)
- `@/` path alias maps to project root (configured in `jest.config.js`)
- Add `TextEncoder`/`TextDecoder` polyfills in setup if needed – already handled in `jest.setup.js`

## Component Conventions

- Always add new components to `components/index.ts` barrel export
- CSS Modules only (no Tailwind, no global class names in components)
- Use `react-icons/lu` (Lucide) for icons
- Dates formatted with `nb-NO` locale: `toLocaleDateString('nb-NO', ...)`

## Achievements System

Achievements are **statically defined** in `lib/achievements/definitions.ts` (not in DB). Only unlock state lives in `UserAchievement` table. `lib/achievements/checker.ts` calculates progress from practice data client-side or at API time.

## Key Files Reference

| File | Purpose |
|---|---|
| `lib/prisma.ts` | Prisma singleton + type exports |
| `lib/prismaEnums.ts` | Enum constants safe for client components |
| `lib/session.ts` | `getCurrentUser()` – auth guard for API routes |
| `lib/auth.ts` | Better Auth server config (email, trusted origins) |
| `lib/cache.ts` | In-memory `statsCache` for stats API |
| `lib/validations/` | Zod schemas per model + `helpers.ts` |
| `lib/achievements/` | Static definitions, checker, types |
| `prisma/schema.prisma` | Full data model |
| `components/index.ts` | Component barrel export |

