# Security Overview

Summary of Bueboka's security posture, the measures in place, and best practices for contributors. For vulnerability reporting, see [SECURITY.md](../SECURITY.md).

---

## Authentication

Auth is handled by [Better Auth](https://www.better-auth.com/) v1.6.14+ with the Prisma adapter.

### Password policy

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- These rules apply to signup only — login does not enforce complexity (to avoid locking out users with pre-existing passwords)

### Email verification

Email verification is **required** for new accounts. Users must verify before they can access the app. Verification emails are also re-sent on sign-in if the account is still unverified.

### Session management

| Setting | Value |
|---|---|
| Session lifetime | 7 days |
| Update age | 24 hours |
| Revoke on password reset | Yes |
| Secure cookies | Production only (HTTPS) |

When a user resets their password, all existing sessions are invalidated. This prevents an attacker from maintaining access after a compromised password is changed.

### OAuth (Google)

OAuth state validation is enabled (the default). The `@better-auth/expo` plugin provides an authorization proxy that sets the state cookie server-side, allowing mobile OAuth flows to work without disabling CSRF protection.

---

## Rate Limiting

### Auth endpoints

Better Auth's built-in rate limiter is configured at **10 requests per 15-minute window** per IP. This covers login, signup, password reset, and other auth-related endpoints.

### API endpoints

A Next.js middleware (`middleware.ts`) applies rate limiting to all `/api/*` routes at **60 requests per minute** per IP. The limiter uses an in-memory map with automatic cleanup when the entry count exceeds 10,000.

**Shared IP considerations:** Users behind the same NAT (office, school, public WiFi) share a rate limit. The 60/min API limit is generous enough for normal multi-user scenarios, but the 10/15min auth limit could affect users on shared networks if multiple people are signing in simultaneously.

---

## HTTP Security Headers

All production responses include the following headers (configured in `next.config.mjs`):

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | See below | Prevents XSS and unwanted resource loading |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables unused browser features |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://lh3.googleusercontent.com;
font-src 'self';
connect-src 'self' https://www.clarity.ms https://calculate-aim.azurewebsites.net;
frame-ancestors 'none'
```

`unsafe-inline` and `unsafe-eval` are required for Next.js to function (it injects inline scripts). If you add a new third-party service (analytics, CDN, external API), you must update the CSP in `next.config.mjs` or the browser will silently block it. Check the browser console for `Content-Security-Policy` violations after adding new integrations.

---

## Input Validation & Output Encoding

- All API inputs are validated with [Zod](https://zod.dev/) schemas
- Database access uses Prisma ORM exclusively — no raw string concatenation in SQL (parameterized `$queryRaw` templates are used where raw SQL is needed)
- User-controlled content in HTML emails is escaped with `escapeHtml()` to prevent injection
- The `WhatsNewModal` uses a `SafeHtml` component that only renders `<strong>` tags, rejecting all other HTML

---

## Error Handling

API error responses follow these rules:

- **Never expose internal error details** — all `catch` blocks log the full error server-side with `console.error` and return a generic message to the client
- **Always return a response** — no empty `catch` blocks; every error path returns an appropriate HTTP status code
- **Use specific error messages for validation** — field-level validation errors are returned so the client can display helpful feedback, but server/database errors are always generic

---

## Environment Variables

Sensitive configuration is stored in environment variables, never hardcoded in source code. The `.env` file is excluded from version control via `.gitignore`.

| Variable | Required | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Session signing key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | OAuth provider |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth provider |
| `RESEND_API_KEY` | Yes | Email delivery |
| `FEEDBACK_EMAIL` | Yes | Recipient for user feedback submissions |

**Never commit secrets.** If a secret is accidentally committed, rotate it immediately — removing it from the code is not enough since it remains in git history.

---

## Dependency Management

- **Dependabot** is configured (`.github/dependabot.yml`) to check for npm updates weekly (Monday 06:00 Oslo time)
- Run `npm audit` regularly — the project aims for zero high/critical vulnerabilities
- Never run `npm update` — manually bump versions in `package.json` and run `npm install` (see CLAUDE.md)
- Production source maps are disabled to prevent exposing source code

---

## Best Practices for Contributors

1. **Validate at the boundary.** All user input must be validated with Zod schemas before touching the database. Trust Prisma for SQL safety, but validate types, ranges, and formats yourself.

2. **Don't leak errors.** Log the full error, return a generic message. Never include `error.message` or stack traces in API responses.

3. **Escape user content in HTML.** If you render user-controlled strings in HTML (emails, SSR), use `escapeHtml()` or the `SafeHtml` component. Never use `dangerouslySetInnerHTML` with anything that could contain user input.

4. **Check ownership on every mutation.** Every PUT/PATCH/DELETE must verify that the authenticated user owns the resource. The pattern is: fetch the record, compare `userId` to the session user, return 404 if not matched (not 403 — to avoid revealing that the resource exists).

5. **Keep the CSP updated.** When adding a new external service, add its domain to the appropriate CSP directive in `next.config.mjs`. Test in the browser console for violations.

6. **Use environment variables for secrets.** No API keys, emails, URLs, or credentials hardcoded in source code. Add new variables to `.env` locally and to the hosting provider for production.

7. **Rate limiting awareness.** Auth endpoints are aggressively rate-limited (10/15min). If you add a new auth-adjacent endpoint, consider whether it falls under Better Auth's rate limiter or needs separate protection.
