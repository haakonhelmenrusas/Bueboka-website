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

`prismaEnums.ts` exports only `Environment`, `WeatherCondition`, and `PracticeCategory`. `BowType`, `Material`, and `Placement` are **not** exported there – use plain string literals (e.g. `'RECURVE'`) in client components for those values.

### Prisma Namespace

For utilities like `Prisma.JsonNull`, import the `Prisma` namespace from the generated client, **not** from `@prisma/client`:

```ts
import { Prisma } from '@/prisma/prisma/generated/prisma-client/client';
```

### API Route Pattern

Every API route follows this structure:

1. `getCurrentUser()` guard (returns 401 if unauthenticated)
2. Zod `safeParse` from `lib/validations/<model>.ts`
3. `formatZodErrors` for 400 responses
4. Sentry capture in catch blocks
5. Invalidate `statsCache` on mutations

> **Exception – public routes**: Routes that serve unauthenticated clients (e.g. `GET /api/app/version`) skip the `getCurrentUser()` guard entirely.

```ts
import { getCurrentUser } from '@/lib/session';
import { createPracticeSchema } from '@/lib/validations/practice';
import { formatZodErrors } from '@/lib/validations/helpers';
import { statsCache } from '@/lib/cache';
```

`lib/cache.ts` exports four caches – use the right one: `statsCache` (3 min, stats API), `roundTypesCache` (5 min, round types), `userProfileCache` (2 min, user profiles), `cache` (60 s, generic).

### Auth

- Server: `auth` from `@/lib/auth` (Better Auth instance), `getCurrentUser()` from `@/lib/session`
- Client: `signIn`, `signUp`, `signOut`, `useSession` from `@/lib/auth-client`

## Developer Workflows

```bash
# Local development (requires Docker)
npm run db:up           # Start Postgres in Docker
npm run db:down         # Stop Postgres container
npm run db:reset        # Wipe volume and restart Postgres
npm run prisma:migrate  # Apply migrations
npm run prisma:studio   # Open Prisma Studio GUI
npm run seed:local      # Seed with test data (optional)
npm run seed            # Run production seed (prisma/seed.ts)
npm run dev             # Start dev server at localhost:3000
npm run dev:clean       # Wipe .next cache then start dev server

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

## Git Hooks (Husky)

Git hooks are managed by [Husky](https://typicode.github.io/husky/) and run automatically:

| Hook | Command | When |
| ------------ | ----------------------- | ---------------------------------------------------- |
| `pre-commit` | `npm run lint` | Before every commit – fast ESLint check |
| `pre-push` | `npm test -- --passWithNoTests --ci` | Before pushing – full Jest suite in CI mode |

This prevents broken code from entering the remote and triggering the Netlify pipeline unnecessarily.

## Commit Message Standard (Conventional Commits)

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enables automatic changelog generation, semantic versioning, and readable `git log`.

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
| ---------- | ------------------------------------------------------------------ |
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `chore` | Maintenance tasks (deps, config, tooling) – no production code |
| `refactor` | Code restructuring with no behaviour change |
| `style` | Formatting, CSS, whitespace – no logic change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `perf` | Performance improvements |
| `ci` | CI/CD pipeline changes (Netlify, GitHub Actions) |
| `revert` | Reverts a previous commit |

### Scope (optional but encouraged)

Use the affected area: `bow`, `practice`, `auth`, `api`, `db`, `ui`, `hooks`, `achievements`, `sight-marks`, `competitions`, `profile`, `deps`.

### Examples

```
feat(bow): add braceHeight, stup and tiller fields to bow form
fix(auth): redirect unauthenticated users from /min-side to /logg-inn
chore(deps): upgrade next to 16.3.0
refactor(practice): extract usePracticeDetails into shared hook
test(bow): add tests for BowForm with recurve and compound types
perf(landing): make root page static to eliminate cold start
```

### Breaking Changes

Add `!` after the type/scope and a `BREAKING CHANGE:` footer:

```
feat(api)!: rename /api/bows endpoint to /api/equipment/bows

BREAKING CHANGE: All clients must update the bow API path.
```

### AI-authored commits

When commits are authored or co-authored by an AI agent, add the following trailer to the footer:

```
Co-authored-by: GitHub Copilot <copilot@github.com>
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
- Use `motion` (not `framer-motion`) for animations

### Modal Hooks

All modal components must use hooks from `lib/hooks/`:

```ts
import { useModalBehavior } from '@/lib/hooks';
// Handles Escape-to-close and body scroll lock automatically
useModalBehavior({ open, onClose });
```

Other available hooks: `useClickOutside`, `useEscapeKey`, `useFocusTrap`.

### Common UI Primitives

Reuse components from `components/common/` instead of creating new ones:
`Button`, `Input`, `NumberInput`, `TextArea`, `Select`, `Checkbox`, `DateInput`, `Tooltip`, `Accordion`, `ConfirmModal`, `FullPageLoader`, `ImageUpload`, `StatsSummary`, `SocialAuthButtons`.

## Shared Utilities

### Norwegian Translations

`lib/labels.ts` contains all Norwegian label constants and helpers for enum values. Use these instead of inline strings:

```ts
import { getBowTypeLabel, getPracticeCategoryLabel, BOW_TYPE_OPTIONS } from '@/lib/labels';
```

### Form Option Builders

`lib/formUtils.tsx` provides shared select option arrays (with icons) for weather, environment, and practice category. Import these rather than re-defining them:

```ts
import { getWeatherSelectOptions, getEnvironmentOptions, getPracticeCategoryOptions } from '@/lib/formUtils';
```

### Weather Utilities

`lib/weatherUtils.tsx` exports `weatherLabels`, `weatherIcons`, `getWeatherLabel`, `getWeatherIcon`, and `formatWeatherConditions` for displaying weather data.

### Equipment Change Events

`lib/events.ts` provides a lightweight event bus to sync equipment changes across components:

```ts
import { emitEquipmentChanged, onEquipmentChanged } from '@/lib/events';
```

### Feedback Modal

Wrap consumers in `context/FeedbackProvider` and open the modal via `useFeedback()`:

```ts
import { useFeedback } from '@/context/FeedbackProvider';
const { openFeedback } = useFeedback();
```

## Achievements System

Achievements are **statically defined** in `lib/achievements/definitions.ts` (not in DB). Only unlock state lives in `UserAchievement` table. `lib/achievements/checker.ts` calculates progress from practice data client-side or at API time.

## Key Files Reference

| File                           | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `lib/prisma.ts`                | Prisma singleton + type exports                                       |
| `lib/prismaEnums.ts`           | Enum constants safe for client components                             |
| `lib/session.ts`               | `getCurrentUser()` – auth guard for API routes                        |
| `lib/auth.ts`                  | Better Auth server config (email, trusted origins)                    |
| `lib/cache.ts`                 | In-memory `statsCache` for stats API                                  |
| `lib/validations/`             | Zod schemas per model + `helpers.ts`                                  |
| `lib/achievements/`            | Static definitions, checker, types                                    |
| `lib/labels.ts`                | Norwegian label constants + helpers for enum display values           |
| `lib/formUtils.tsx`            | Shared form option arrays for weather/environment/category            |
| `lib/weatherUtils.tsx`         | Weather label + icon helpers                                          |
| `lib/events.ts`                | Equipment change event bus                                            |
| `lib/types.ts`                 | App-level TypeScript interfaces (Practice, Bow, Arrow, Stats, …)      |
| `lib/Contants.ts`              | Ballistics defaults + `TARGET_TYPE_OPTIONS`                           |
| `lib/hooks/`                   | `useModalBehavior`, `useClickOutside`, `useEscapeKey`, `useFocusTrap` |
| `context/FeedbackProvider.tsx` | Feedback modal context + `useFeedback()` hook                         |
| `prisma/schema.prisma`         | Full data model                                                       |
| `app/api/app/version/route.ts` | Public `GET` – returns min/current version + iOS & Android store URLs |
| `components/index.ts`          | Component barrel export                                               |
| `components/common/`           | Reusable UI primitives (Button, Input, Select, …)                     |
| `types/SightMarks.ts`          | TypeScript types for sight mark / ballistics domain                   |

---

> This guide is maintained collaboratively by the project team and AI coding agents.
> Authored with assistance from **GitHub Copilot**.

