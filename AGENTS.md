# Agent Instructions

Read automatically by Mistral Vibe via `AGENTS.md` discovery. `CLAUDE.md` carries
the same rules for Claude Code — keep the two files in sync when you change either.

## Project Overview

**Bueboka** — a Next.js 16 web application. Stack: Next.js, TypeScript, Prisma (PostgreSQL), Better Auth, React 19, Jest, Husky, i18n (in progress).

Key scripts:
- `npm run dev` — start dev server
- `npm test` — run Jest tests
- `npm run lint` — ESLint
- `npm run build` — production build
- `npx tsc --noEmit` — type check

Reference docs:
- `docs/API.md` — REST API reference; the route handlers under `app/api/` are the source of truth
- `docs/security.md` — security posture and contributor best practices

## Autonomy

Work autonomously. For a clear request, read the relevant code and act directly —
do not ask for confirmation before loading context, reading files, or making
reversible, in-scope changes. Ask a clarifying question only when missing
information would materially change the result, cannot be discovered from the
codebase, or the action is hard to undo or affects shared systems (push,
force-push, destructive resets, migrations, deploys, publishes). Trivial tasks
(e.g. a one-line fix with clear intent) need no questions at all.

## Branching Strategy

This project uses a two-tier branch model:

- **`main`** — production branch. Only receives merges from `dev` via pull request.
- **`dev`** — default working branch. All feature/fix branches are created from `dev` and merged back into `dev` via pull request.

### Workflow

1. Branch off `dev` for any new work (e.g. `feat/my-feature`, `fix/some-bug`)
2. Open a pull request into `dev` for testing and review (project skill: `open-pr`)
3. Once verified on `dev`, open a pull request from `dev` into `main` for production deployment

### Rules

- Never commit directly to `main` or `dev`
- All work goes through pull requests
- `dev` is the base branch for new feature/fix branches — not `main`
- When creating PRs, target `dev` unless explicitly promoting to production

## Commit Discipline

Keep commits **small and focused** — one logical change per commit. This makes the git history readable and each change independently reviewable or revertable.

Rules:
- One concern per commit (one component, one feature area, one bug fix)
- Never bundle unrelated changes in the same commit
- Each commit must leave the codebase in a working, buildable state
- Prefer 5 small commits over 1 large one

When working through a multi-file task (e.g. migrating several screens to i18n), commit **per screen or per natural grouping** — not all at once at the end.

## Updating Dependencies

**Never run `npm update`.** It bypasses intentional version control over `package.json`. This is enforced by the `deny-npm-update` hook in `.vibe/hooks.toml`.

To update a package:
1. Manually bump the version number in `package.json`
2. Run `npm install` to update `package-lock.json` accordingly

This keeps `package.json` as the source of truth and the relationship between `package.json` and `package-lock.json` explicit and controlled.

## Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Enforced locally by commitlint (`.husky/commit-msg`, `commitlint.config.mjs`).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Rules

- **Lowercase** type and scope
- **Imperative mood** in description: "add" not "added", "fix" not "fixed"
- **No period** at the end of the description
- **Header max 72 characters**
- Include a scope when the change is limited to a specific area (e.g., component, page, module)
- Use the body to explain *why*, not *what*

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-facing capability |
| `fix` | Bug fix |
| `refactor` | Code change with no feature or bug impact |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Tooling, deps, config, build scripts |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a previous commit |

### Common Scopes for This Project

- `auth` — authentication and session handling
- `i18n` — translations and language support
- `db` / `prisma` — schema or migrations
- `ui` — shared UI components
- `api` — API routes
- `landing` / `register` / `settings` — specific pages
- `hooks` — git hooks or React hooks (context makes it clear)

### Examples

```
feat(i18n): add english translations for settings page

fix(auth): redirect to login on expired session

refactor(ui): extract button variants into shared component

test(register): add integration test for email validation

chore: upgrade prisma to v7.5.0
```

### Breaking Changes

Add `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```
feat(auth)!: replace session tokens with JWTs

BREAKING CHANGE: existing sessions will be invalidated on deploy
```

## i18n

All user-facing strings require i18n support. Follow the existing patterns under `lib/i18n` and add translation keys for every new user-facing string.
