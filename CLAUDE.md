# Claude Code Instructions

## Project Overview

**Bueboka** — a Next.js 16 web application. Stack: Next.js, TypeScript, Prisma (PostgreSQL), Better Auth, React 19, Jest, Husky, i18n (in progress).

Key scripts:
- `npm run dev` — start dev server
- `npm test` — run Jest tests
- `npm run lint` — ESLint
- `npm run build` — production build
- `npx tsc` — type check

## Before Starting Any Task

Before writing code, ask clarifying questions to understand domain and context. Tailor the questions to the task at hand — not every question applies every time. Examples of what to ask when relevant:

- **Domain**: What is this feature for? Who uses it?
- **Scope**: Which pages, components, or flows are affected?
- **Constraints**: Are there design, auth, or database constraints I should know?
- **Existing patterns**: Is there a similar feature already in the codebase I should follow?
- **Edge cases**: Are there specific error states, loading states, or empty states to handle?
- **Testing**: Should I write tests? Are there existing tests for the area I'm touching?
- **i18n**: Does this feature need translation keys? (All user-facing strings require i18n support.)

Only start implementing after you have enough context. If the task is trivial (e.g., a one-line fix with clear intent), skip the questions.

## Commit Discipline

Keep commits **small and focused** — one logical change per commit. This makes the git history readable and each change independently reviewable or revertable.

Rules:
- One concern per commit (one component, one feature area, one bug fix)
- Never bundle unrelated changes in the same commit
- Each commit must leave the codebase in a working, buildable state
- Prefer 5 small commits over 1 large one

When working through a multi-file task (e.g. migrating several screens to i18n), commit **per screen or per natural grouping** — not all at once at the end.

## Updating Dependencies

**Never run `npm update`.** It bypasses intentional version control over `package.json`.

To update a package:
1. Manually bump the version number in `package.json`
2. Run `npm install` to update `package-lock.json` accordingly

This keeps `package.json` as the source of truth and the relationship between `package.json` and `package-lock.json` explicit and controlled.

## Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

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
