# Bueboka API Reference

Reference for the Bueboka REST API exposed by the Next.js web app and consumed by both the web client and the mobile (Expo) app.

- **Base URL (production):** value of `BETTER_AUTH_URL`
- **Base URL (development):** `http://localhost:3000`
- **Content type:** `application/json` for both request and response bodies unless otherwise noted

This document covers behavior at the time of writing. When in doubt, the route handlers under `app/api/` are the source of truth.

---

## Conventions

### Authentication

Auth is handled by [Better Auth](https://www.better-auth.com/) and resolved per request by `getCurrentUser()` in [lib/session.ts](../lib/session.ts). Two credential transports are supported:

| Client | Transport |
|---|---|
| Web | `better-auth.session_token` cookie (also accepted as `__Secure-better-auth.session_token` over HTTPS) |
| Mobile / native | `Authorization: Bearer <session-token>` header |

The mobile app should send the session token returned by Better Auth in the `Authorization` header on every authenticated request. The same code path validates both transports, so endpoint behavior is identical regardless of how the session arrives.

Endpoints that require auth return `401 Unauthorized` when the session is missing or invalid. Endpoints marked **Public** below do not call `getCurrentUser()`.

### Status codes

| Code | Meaning |
|---|---|
| `200` | Success (GET, PATCH, PUT) |
| `201` | Created (POST) |
| `204` | No Content (DELETE) |
| `400` | Validation error or malformed input |
| `401` | Authentication required |
| `403` | Authenticated but not allowed to access this resource |
| `404` | Resource not found |
| `409` | Conflict (e.g. unique constraint or FK violation) |
| `500` | Server error |
| `504` | Upstream service timeout (ballistics/sight-marks calculation) |

### Error shape

Errors return JSON of the form:

```json
{ "error": "Human-readable message" }
```

Validation errors from Zod-validated endpoints (competitions POST, practices PATCH) include field-level detail:

```json
{ "error": "Validation error", "fieldErrors": { "field": "message" } }
```

### Caching

The server uses two layers of caching. Mobile clients do not need to do anything special, but it is useful to know:

- **In-memory server caches** (`userProfileCache`, `equipmentCache`, `statsCache`, `practicesCache`, `roundTypesCache`) with short TTLs. Mutating endpoints invalidate the affected caches.
- **HTTP `Cache-Control` headers** on a handful of read endpoints (notably stats, round types, app version, practice cards). Values are listed per endpoint.

In development (`NODE_ENV !== 'production'`) most caches are disabled.

---

## Locale and language sync

The `User` model has an optional `locale` field (`"no" | "en" | null`). The web client and the mobile app should keep this in sync so a user who changes language on one device sees the same language on the other.

### Field semantics

| Value | Meaning |
|---|---|
| `"no"` | Norwegian (Bokmål) |
| `"en"` | English |
| `null` | Not yet chosen — fall back to local preference / default (`"no"`) |

### Sync strategy: **DB wins on login**

1. **On app launch / mount**, render immediately using whatever locale is stored locally (`localStorage` on web, `AsyncStorage` / equivalent on native). This avoids a flash of the wrong language while the network call is in flight.
2. **Once the session resolves**, fetch `GET /api/profile` and read `profile.locale`.
   - If `profile.locale` is a valid value, **the DB wins.** Update local storage and the active language to match the server.
   - If `profile.locale` is `null` and a local value exists, **back-fill the server** with the local value via `PATCH /api/users { locale }`. This is the migration path for users who chose a language before this field existed.
   - If `profile.locale` is `null` and there is no local value, leave the default in place. Nothing to do.
3. **When the user changes language in the app:**
   - Update local storage and the active language immediately (optimistic).
   - If the user is signed in, fire-and-forget `PATCH /api/users { locale: <new value> }`. Failures are non-fatal — local storage remains authoritative for the current device until the next successful sync.

This strategy is implemented for the web client in [lib/hooks/useLanguage.ts](../lib/hooks/useLanguage.ts). The mobile app should mirror it so the two devices stay convergent without needing conflict-resolution metadata (no `localeUpdatedAt` or similar).

### Anonymous users

Unauthenticated visitors never call the API for locale. Their language preference lives only in local storage and is back-filled to the server on the first successful session sync after login.

---

## Endpoints

### Auth — `/api/auth/*`

All Better Auth endpoints are served by a catch-all handler at [app/api/auth/\[...all\]/route.ts](../app/api/auth/[...all]/route.ts). Refer to the [Better Auth docs](https://www.better-auth.com/docs) for the full surface area; the endpoints in active use are:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/sign-up/email` | Create account with email + password |
| `POST` | `/api/auth/sign-in/email` | Sign in with email + password |
| `POST` | `/api/auth/sign-out` | End session (custom wrapper that normalizes empty bodies for native clients — see [app/api/auth/sign-out/route.ts](../app/api/auth/sign-out/route.ts)) |
| `GET` | `/api/auth/get-session` | Return the current session, if any |
| `GET/POST` | `/api/auth/callback/google` | Google OAuth callback |
| `POST` | `/api/auth/forget-password` | Trigger password-reset email |
| `POST` | `/api/auth/reset-password` | Complete password reset |
| `POST` | `/api/auth/verify-email` | Verify email via emailed token |

Configuration (session TTL, providers, trusted origins, email handlers) lives in [lib/auth.ts](../lib/auth.ts). The Expo plugin is registered, so the native app can use `@better-auth/expo` on the client.

---

### Profile and users

#### `GET /api/profile` — Get the current user's profile

**Auth:** required.

**Response 200:**

```json
{
  "profile": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "club": "string | null",
    "image": "string | null",
    "skytternr": "string | null",
    "isPublic": false,
    "publicName": true,
    "publicClub": true,
    "publicStats": false,
    "publicSkytternr": false,
    "publicAchievements": false,
    "locale": "no | en | null"
  }
}
```

Cached server-side under `profile:{userId}` (invalidated by `PATCH /api/users`).

#### `GET /api/users` — Get the current user as a single-element list

**Auth:** required.

**Response 200:**

```json
{
  "users": [
    { "id": "...", "email": "...", "name": "...", "club": "...", "image": "...", "skytternr": "..." }
  ]
}
```

Returns only the authenticated user. Prefer `GET /api/profile` for new code.

#### `PATCH /api/users` — Update the current user's profile

**Auth:** required.

**Request body (all fields optional):**

```json
{
  "name": "string | null",
  "club": "string | null",
  "image": "string | null",
  "skytternr": "string | null",
  "isPublic": "boolean",
  "publicName": "boolean",
  "publicClub": "boolean",
  "publicStats": "boolean",
  "publicSkytternr": "boolean",
  "publicAchievements": "boolean",
  "locale": "no | en | null"
}
```

**Validation:**

- `image` accepts an external URL or a `data:image/...` base64 string up to 5 MB.
- `locale` must be exactly `"no"`, `"en"`, or `null`. Any other value returns `400 Invalid locale. Must be "no" or "en".`.
- `club` is free-text up to 100 characters after trimming. Empty strings are normalized to `null`. Non-string values return `400 Invalid club. Must be a string.`; over-length returns `400 Club name too long. Max 100 characters.`.

**Response 200:**

```json
{ "user": { /* updated User row */ } }
```

Invalidates `profile:{userId}` cache.

#### `DELETE /api/users/delete` — Delete the current user's account

**Auth:** required.

Cascades through practices/ends, competitions, bows, arrows, sight marks, accounts, sessions, and verifications in a single transaction.

**Response:** `204 No Content`.

#### `GET /api/public/profiles` — Search public profiles

**Auth:** required.

**Query parameters:**

| Name | Type | Required | Notes |
|---|---|---|---|
| `q` | string | no | Case-insensitive substring match against `name` and (if `publicClub` is true) `club` |

Results are limited to 50, sorted by `name` ascending. Only users with `isPublic: true` are included, and per-field visibility flags (`publicName`, `publicClub`, `publicSkytternr`) further mask returned data.

**Response 200:**

```json
{
  "profiles": [
    { "id": "...", "name": "...", "club": "...", "image": "...", "skytternr": "..." }
  ]
}
```

#### `GET /api/public/profiles/[id]` — Get a public profile by ID

**Auth:** none (public). Only resolves if the user has `isPublic: true`; otherwise `404 Profil ikke funnet`.

**Response 200:**

```json
{
  "profile": {
    "id": "string",
    "name": "string | null",
    "club": "string | null",
    "image": "string | null",
    "skytternr": "string | null",
    "stats": { "totalArrows": 0, "avgScorePerArrow": 0 } /* if publicStats */ ,
    "achievementCount": 0 /* if publicAchievements */
  }
}
```

`stats` and `achievementCount` are omitted when the corresponding visibility flag is false.

---

### Bows

#### `GET /api/bows` — List the current user's bows

**Auth:** required. Response: `{ "bows": Bow[] }`.

#### `POST /api/bows` — Create a bow

**Auth:** required.

**Request body:**

```json
{
  "name": "string (required)",
  "type": "RECURVE | COMPOUND | LONGBOW | BAREBOW | HORSEBOW | TRADITIONAL | OTHER (required)",
  "eyeToNock": "number | null",
  "aimMeasure": "number | null",
  "eyeToSight": "number | null",
  "limbs": "string | null",
  "riser": "string | null",
  "handOrientation": "string | null",
  "drawWeight": "number | null",
  "bowLength": "number | null",
  "braceHeight": "number | null",
  "stup": "number | null",
  "tiller": "number | null",
  "notes": "string | null",
  "isFavorite": "boolean | null"
}
```

If `isFavorite: true`, all of the user's other bows have `isFavorite` set to false in the same transaction. Invalidates `equipment:{userId}` cache. **Response 201:** `{ "bow": Bow }`.

#### `PATCH /api/bows/[id]` — Update a bow

**Auth:** required. Same body shape as `POST`; all fields optional. Verifies the bow belongs to the caller (`404` otherwise). **Response 200:** `{ "bow": Bow }`.

#### `DELETE /api/bows/[id]` — Delete a bow

**Auth:** required. Disconnects the bow from any practices (sets `bowId: null`) before deleting to avoid FK errors. **Response:** `204 No Content`.

---

### Bow specifications

#### `GET /api/bow-specifications` — List specs

**Auth:** required. Response: `{ "bowSpecifications": BowSpecification[] }`, each entry includes the related `bow`. Ordered by `createdAt` desc.

#### `POST /api/bow-specifications` — Create a spec

**Auth:** required.

```json
{
  "bowId": "string (required)",
  "intervalSightReal": "number | null",
  "intervalSightMeasured": "number | null",
  "placement": "BAK_LINJEN | OVER_LINJEN | ANNET | null"
}
```

`intervalSightReal` and `intervalSightMeasured` are truncated to integers. **Response 201:** `{ "bowSpecification": BowSpecification }`.

#### `GET /api/bow-specifications/[id]` — Get a spec

**Auth:** required. Response: `{ "bowSpecification": BowSpecification }`. `404` if not found.

#### `PUT /api/bow-specifications/[id]` — Update a spec

**Auth:** required.

```json
{
  "intervalSightReal": "number | null",
  "intervalSightMeasured": "number | null",
  "placement": "string | null"
}
```

Response: `{ "bowSpecification": BowSpecification }`.

#### `DELETE /api/bow-specifications/[id]` — Delete a spec

**Auth:** required. Response: `204 No Content`.

#### `GET /api/bow-specifications/by-bow/[bowId]` — Get or create a spec for a given bow

**Auth:** required. If no spec exists for the given bow, one is created automatically. The response includes the related `bow`. `404 Bow not found` if the bow does not exist or is not owned by the caller.

---

### Arrows

#### `GET /api/arrows` — List arrow sets

**Auth:** required. Response: `{ "arrows": Arrows[] }`.

#### `POST /api/arrows` — Create an arrow set

**Auth:** required.

```json
{
  "name": "string (required)",
  "material": "KARBON | ALUMINIUM | TREVERK (required)",
  "length": "number | null",
  "weight": "number | null",
  "arrowsCount": "number | null",
  "diameter": "number | null",
  "spine": "string | null",
  "pointType": "string | null",
  "pointWeight": "number | null",
  "vanes": "string | null",
  "nock": "string | null",
  "notes": "string | null",
  "isFavorite": "boolean | null"
}
```

**Limit:** a user may have at most 5 arrow sets. Exceeding this returns `400 "Du kan maks ha 5 pilsett. Slett et eksisterende pilsett for å legge til et nytt."`. If `isFavorite: true`, all other sets are unfavorited in the same transaction. Invalidates `equipment:{userId}` cache. **Response 201:** `{ "arrows": Arrows }`.

#### `PATCH /api/arrows/[id]` — Update an arrow set

**Auth:** required. Same body shape as `POST`; all fields optional. **Response 200:** `{ "arrows": Arrows }`.

#### `DELETE /api/arrows/[id]` — Delete an arrow set

**Auth:** required. Response: `204 No Content`.

---

### Practices

A "practice" is a training session with one or more `End` records (each `End` is one round at a given distance/target).

#### `GET /api/practices` — List the user's practices

**Auth:** required. Response: `{ "practices": Practice[] }`, ordered by `date` desc. Each entry includes `bow`, `arrows`, and `roundType` relations.

#### `POST /api/practices` — Create a practice

**Auth:** required.

```json
{
  "date": "ISO 8601 string (required)",
  "location": "string | null",
  "environment": "INDOOR | OUTDOOR (required)",
  "weather": "WeatherCondition[] | null",
  "practiceCategory": "SKIVE_INDOOR | SKIVE_OUTDOOR | JAKT_3D | FELT",
  "notes": "string | null",
  "rating": "number 1-5 | null",
  "bowId": "string | null",
  "arrowsId": "string | null",
  "rounds": [
    {
      "numberArrows": "number | null",
      "arrowsWithoutScore": "number | null",
      "scores": "number[]",
      "arrowCoordinates": "Json | null",
      "roundScore": "number",
      "distanceMeters": "number | null",
      "targetType": "string | null",
      "distanceFrom": "number | null",
      "distanceTo": "number | null",
      "arrowsPerEnd": "number | null"
    }
  ]
}
```

`WeatherCondition` is one of: `SUN`, `CLOUDED`, `CLEAR`, `RAIN`, `WIND`, `SNOW`, `FOG`, `THUNDER`, `CHANGING_CONDITIONS`, `OTHER`.

The server creates or reuses a matching `RoundType` from `distanceMeters` + `targetType`, sums `roundScore` across rounds into `totalScore`, and creates one `End` per round.

Invalidates `statsCache` and `practicesCache`. **Response 201:** `{ "practice": Practice }`.

#### `PATCH /api/practices/[id]` — Update a practice

**Auth:** required. Same body shape as `POST`. Existing `End` records are deleted and recreated. Returns `409` on unique-constraint conflict, `404` if the practice is not owned by the caller. **Response 200:** the updated practice object at the top level (not wrapped under a key), with an added `arrowsShot` field.

#### `DELETE /api/practices/[id]` — Delete a practice

**Auth:** required. `End` records cascade. Returns `409 "Kunne ikke slette trening. Prøv igjen senere."` on FK constraint errors. **Response:** `204 No Content`.

#### `GET /api/practices/[id]/details` — Get a practice with ends

**Auth:** required.

**Response 200:**

Returns the full practice with `ends`, `bow`, `arrows`, and `roundType` relations, plus computed fields:

```json
{
  "practice": {
    "id": "...",
    "date": "...",
    "location": "string | null",
    "environment": "INDOOR | OUTDOOR",
    "ends": [ { "id": "...", "arrows": 0, "scores": [], "arrowsWithoutScore": 0, "distanceMeters": null, "targetSizeCm": null } ],
    "bow": {},
    "arrows": {},
    "roundType": {},
    "arrowsShot": 0,
    "practiceType": "TRENING"
  }
}
```

HTTP cache: `private, max-age=10, must-revalidate` in production.

#### `GET /api/practices/cards` — Paginated activity feed (practices + competitions)

**Auth:** required.

**Query parameters:**

| Name | Type | Default | Notes |
|---|---|---|---|
| `page` | number | `1` | Min 1 |
| `pageSize` | number | `10` | Clamped to `1..50` |
| `filter` | `all` \| `TRENING` \| `KONKURRANSE` | `all` | When `all`, practices and competitions are merged and paginated together |

**Response 200:**

```json
{
  "practices": [
    {
      "id": "string",
      "date": "ISO 8601",
      "arrowsShot": 0,
      "arrowsWithScore": 0,
      "location": "string | null",
      "environment": "INDOOR | OUTDOOR | null",
      "rating": "number | null",
      "practiceType": "TRENING | KONKURRANSE",
      "totalScore": "number | null",
      "roundTypeName": "string | null",
      "practiceCategory": "string | null",
      "competitionName": "string (only for KONKURRANSE)",
      "placement": "number | null (only for KONKURRANSE)"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

Server-side 30 s cache, plus HTTP `max-age=10` in production.

---

### Competitions

A competition is a session with one or more `CompetitionRound` records.

#### `GET /api/competitions` — List competitions

**Auth:** required. Response: `{ "competitions": Competition[] }`, ordered by `date` desc. Each entry includes `rounds` (ordered by `roundNumber` asc), `bow`, `arrows` relations, and an `arrowsShot` total.

#### `POST /api/competitions` — Create a competition

**Auth:** required.

```json
{
  "date": "ISO 8601 string (required)",
  "name": "string (required)",
  "location": "string | null",
  "organizerName": "string | null",
  "environment": "INDOOR | OUTDOOR (required)",
  "weather": "WeatherCondition[] | null",
  "practiceCategory": "SKIVE_INDOOR | SKIVE_OUTDOOR | JAKT_3D | FELT",
  "notes": "string | null",
  "placement": "number | null",
  "numberOfParticipants": "number | null",
  "personalBest": "boolean | null",
  "bowId": "string | null",
  "arrowsId": "string | null",
  "rounds": [
    {
      "roundNumber": "number (required)",
      "distanceMeters": "number | null",
      "targetType": "string | null",
      "targetSizeCm": "number | null",
      "numberArrows": "number | null",
      "arrowsWithoutScore": "number | null",
      "scores": "number[] | null",
      "roundScore": "number (required)"
    }
  ]
}
```

`totalScore` is the sum of `roundScore` across all rounds. `targetSizeCm` is parsed from `targetType` if not supplied. Invalidates `statsCache` and `practicesCache`. **Response 201:** `{ "competition": Competition }`.

#### `GET /api/competitions/[id]` — Get one competition

**Auth:** required. Returns `404` if not found, `403 Unauthorized` if the competition belongs to someone else. **Response 200:** `{ "competition": Competition }` with `rounds`, `bow`, `arrows`, and computed `arrowsShot`.

#### `PATCH /api/competitions/[id]` — Update a competition

**Auth:** required. All fields optional. Rounds are deleted and recreated if `rounds` is supplied. **Response 200:** `{ "competition": Competition }`.

#### `DELETE /api/competitions/[id]` — Delete a competition

**Auth:** required. Rounds cascade. **Response:** `204 No Content`.

#### `GET /api/competitions/[id]/details` — Get a competition shaped like a practice

**Auth:** required. The response maps `rounds` to an `ends` array so the same UI components can render both. Same response shape as `GET /api/practices/[id]/details`, but `practiceType: "KONKURRANSE"`. HTTP cache: `private, max-age=10, must-revalidate` in production.

---

### Sight marks

#### `GET /api/sight-marks` — List sight marks

**Auth:** required. Each entry includes `bowSpec.bow`. Ordered by `createdAt` desc.

#### `POST /api/sight-marks` — Create a sight mark

**Auth:** required.

```json
{
  "bowSpecificationId": "string (required)",
  "name": "string | null",
  "givenMarks": "number[] (required)",
  "givenDistances": "number[] (required)",
  "ballisticsParameters": "object (required)"
}
```

Validates that the referenced bow specification exists and is owned by the caller (`404` otherwise). **Response 201:** `{ "sightMark": SightMark }`.

#### `GET /api/sight-marks/[id]` — Get a sight mark

**Auth:** required. `404 Not found` if it does not belong to the caller.

#### `PUT /api/sight-marks/[id]` (also accepts `PATCH`) — Update a sight mark

**Auth:** required. All fields optional. Preserves existing `ballisticsParameters` if omitted. **Response 200:** `{ "sightMark": SightMark }`.

#### `DELETE /api/sight-marks/[id]` — Delete a sight mark

**Auth:** required. Cascades to all `SightMarkResult` rows. **Response:** `204 No Content`.

#### `POST /api/sight-marks/calculate` — Calculate sight marks (proxies to ballistics service)

**Auth:** required.

```json
{
  "ballistics_pars": "object[] (required, non-empty)",
  "distances_def": "[from, to, interval]  // exactly 3 numbers",
  "angles": "number[] (required, non-empty)"
}
```

Proxies to the external service at `SIGHTMARKS_CALCULATION_SERVICE_URL` (defaults to `http://localhost:8000`). 30 s timeout returns `504 Calculation service timeout`. Response body is whatever the upstream returns.

#### `GET /api/sight-marks/[id]/results` — List results for a sight mark

**Auth:** required. Response: `{ "sightMarkResults": SightMarkResult[] }`, ordered by `createdAt` desc.

#### `POST /api/sight-marks/[id]/results` — Save a calculation result

**Auth:** required.

```json
{
  "distanceFrom": "number (required)",
  "distanceTo": "number (required)",
  "interval": "number (required)",
  "angles": "number[] (required)",
  "distances": "number[] (required)",
  "sightMarksByAngle": "object (required)",
  "arrowSpeedByAngle": "object (required)"
}
```

**Response 201:** `{ "sightMarkResult": SightMarkResult }`.

#### `GET /api/sight-marks/results/[id]` — Get a single result

**Auth:** required.

#### `PUT /api/sight-marks/results/[id]` — Update a result

**Auth:** required. All fields optional.

#### `DELETE /api/sight-marks/results/[id]` — Delete a result

**Auth:** required. **Response:** `204 No Content`.

---

### Stats

#### `GET /api/stats` — Summary stats over three windows

**Auth:** required.

**Response 200:**

```json
{
  "stats": {
    "last7Days":  { "totalArrows": 0, "scoredArrows": 0, "unscoredArrows": 0, "avgScorePerArrow": 0 },
    "last30Days": { "totalArrows": 0, "scoredArrows": 0, "unscoredArrows": 0, "avgScorePerArrow": 0 },
    "overall":    { "totalArrows": 0, "scoredArrows": 0, "unscoredArrows": 0, "avgScorePerArrow": 0 }
  }
}
```

Aggregates practices (via `End`) and competitions (via `CompetitionRound`) in two raw SQL queries. Includes both scored and unscored arrows in `totalArrows`. `avgScorePerArrow` is rounded to two decimals.

Server-side 30 s cache, plus HTTP `public, s-maxage=180, stale-while-revalidate=300`.

#### `GET /api/stats/detailed` — Time-series broken down by distance/target

**Auth:** required.

**Response 200:**

```json
{
  "series": [
    {
      "name": "18m - 40cm",
      "data": [
        {
          "date": "YYYY-MM-DD",
          "arrows": 0,
          "scoredArrows": 0,
          "score": 0,
          "practiceType": "TRENING",
          "practiceCategory": "SKIVE_INDOOR",
          "sessionId": "..."
        }
      ]
    }
  ]
}
```

For `SKIVE_*` categories the series name comes from `distanceMeters + targetSizeCm`; for `FELT` / `JAKT_3D` it comes from the `distanceFrom..distanceTo` range. Same caching profile as `/api/stats`.

---

### Equipment

#### `GET /api/equipment` — Bows and arrows in a single response

**Auth:** required. Fetched in parallel and cached per user under `equipment:{userId}`.

**Response 200:** `{ "bows": Bow[], "arrows": Arrows[] }`.

---

### Round types

#### `GET /api/round-types` — Catalogue of predefined round types

**Auth:** required.

**Response 200:**

```json
{
  "roundTypes": [
    {
      "id": "string",
      "name": "string",
      "distanceMeters": "number | null",
      "targetType": "Json | null",
      "numberArrows": "number | null",
      "arrowsWithoutScore": "number | null",
      "roundScore": "number | null"
    }
  ]
}
```

Cached server-side under `round-types:all`. HTTP `s-maxage=300, stale-while-revalidate=600`.

---

### Achievements

#### `GET /api/achievements` — All achievements with progress

**Auth:** required.

**Response 200:**

```json
{
  "achievements": [
    {
      "achievement": { "id": "...", "name": "...", "description": "...", "points": 0, "icon": "..." },
      "progress": 0,
      "isUnlocked": false,
      "unlockedAt": "ISO 8601 | null"
    }
  ],
  "summary": {
    "totalUnlocked": 0,
    "totalPoints": 0,
    "totalAchievements": 0,
    "completionPercentage": 0
  }
}
```

HTTP `max-age=60, must-revalidate`.

#### `POST /api/achievements/check` — Evaluate after a practice/competition

**Auth:** required.

```json
{ "practiceId": "string | null" }
```

Saves newly unlocked achievements to the DB and returns them, plus any at 80%+ progress as `almostThere`.

**Response 200:**

```json
{
  "newAchievements": [ { "id": "...", "name": "...", "description": "...", "points": 0, "icon": "..." } ],
  "almostThere":     [ { "id": "...", "name": "...", "progress": 0, "nextMilestone": 0 } ],
  "totalNewlyUnlocked": 0
}
```

Call this after creating a practice or competition to trigger the unlock notification flow.

---

### Ballistics

#### `POST /api/ballistics/calculate` — Solve for ballistics parameters from known marks

**Auth:** required.

```json
{
  "bow_category": "string (required)",
  "new_given_mark": "number (required)",
  "new_given_distance": "number (required)",
  "given_marks": "number[] (required)",
  "given_distances": "number[] (required)"
}
```

Proxies to the external service at `BALLISTICS_SERVICE_URL` (defaults to `http://localhost:7071/api/archerAim?task=CalcBallisticsPars`). 20 s timeout returns `504 Ballistics service timeout`. Response body is whatever the upstream returns.

---

### Feedback

#### `POST /api/feedback` — Send in-app feedback

**Auth:** required.

```json
{
  "rating": "number 1-5 (required)",
  "feedback": "string (required, non-empty)"
}
```

**Validation:**

- `rating` must be a number between 1 and 5 — otherwise `400 Invalid rating`.
- `feedback` must be a non-empty string — otherwise `400 Feedback is required`.

Sends an email to the project owner with the rating, feedback, and user identity.

**Response 200:** `{ "success": true }`.

---

### App version

#### `GET /api/app/version` — Minimum and current version metadata

**Auth:** none (public).

**Response 200:**

```json
{
  "minVersion": "1.0.0",
  "currentVersion": "1.0.5",
  "updateMessage": "string",
  "ios": { "minVersion": "1.0.0", "storeUrl": "https://..." },
  "android": { "minVersion": "1.0.0", "storeUrl": "https://..." }
}
```

Returns `404 No version configuration found.` if no version record exists in the database.

Use this from the mobile app on launch to drive force-update flows. HTTP `s-maxage=60, stale-while-revalidate=120`.

#### `PUT /api/app/version` — Update version metadata

**Auth:** API key via `Authorization: Bearer <APP_ADMIN_API_KEY>` header. Returns `401 Unauthorized` if the key is missing or invalid. This is an admin endpoint — not for end-user clients.

**Request body (all fields optional):**

```json
{
  "minVersion": "2.0.0",
  "currentVersion": "2.1.0",
  "updateMessage": "string",
  "iosMinVersion": "2.0.0",
  "iosStoreUrl": "https://...",
  "androidMinVersion": "2.0.0",
  "androidStoreUrl": "https://..."
}
```

Version fields must be valid semver (`X.Y.Z`). If no version record exists yet, one is created with sensible defaults merged with the supplied fields.

Invalidates the `app:version` cache. **Response 200:** same shape as `GET /api/app/version`.

---

## Known issues

These are documented here so the mobile app can avoid relying on the current behavior; see also `// TODO` discussions in the repo.

- Several sight-mark and bow-specification routes have empty `catch` blocks that swallow errors and return `undefined`, which Next.js renders as an empty `500` with no response body. Affected routes: `GET/PUT/DELETE /api/bow-specifications/[id]`, `GET /api/bow-specifications/by-bow/[bowId]`, `GET/POST /api/sight-marks`, `GET/PUT/DELETE /api/sight-marks/[id]`, `GET/POST /api/sight-marks/[id]/results`, `GET/PUT/DELETE /api/sight-marks/results/[id]`. Clients should treat any non-2xx as a generic failure and not rely on an error body being present.
- `POST /api/bow-specifications` does not verify that the supplied `bowId` belongs to the authenticated user. The spec is created with the caller's `userId`, so it cannot be used to read another user's data, but it can reference another user's bow.
