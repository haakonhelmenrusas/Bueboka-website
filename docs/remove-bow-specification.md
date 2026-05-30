# Remove BowSpecification

**Date:** 2026-05-29
**Branch:** `refactor/remove-bow-specification`
**Affects:** Web, Mobile (Expo), Database

---

## Background

The `BowSpecification` model was an intermediary between `Bow` and `SightMark`. It held three fields:

| Field | Type | Purpose |
|---|---|---|
| `intervalSightReal` | `Int?` | Physical interval between sight marks |
| `intervalSightMeasured` | `Int?` | User-measured interval on the sight scale |
| `placement` | `Placement?` | Sight position relative to the bow line |

In practice, **none of these fields were ever used in calculations**. The ballistics calculation instead read `aimMeasure` (a `Float`) directly from the `Bow` model. The `BowSpecification` was fetched only to obtain its `id` for linking a `SightMark` record. Auto-created specs had all fields set to `null`.

This indirection added unnecessary API calls, an unused database table, and confusion about where sight-related values should live.

### Ballistics bug

The previous code set both `interval_sight_real` and `interval_sight_measured` to the same value (`Bow.aimMeasure`):

```typescript
interval_sight_real: activeBow.aimMeasure ?? 5,
interval_sight_measured: activeBow.aimMeasure ?? 5,
```

These are conceptually different values:
- `interval_sight_real` — the actual physical distance between marks on the sight (constant, determined by the sight hardware)
- `interval_sight_measured` — the user's measured value on their specific sight scale

Their ratio (`measured / real`) produces the sight scaling factor. Setting both to the same value forced the scaling factor to 1.0, making the user's `aimMeasure` input irrelevant to the calculation result.

---

## What changed

### Database migration

**Migration:** `20260529000000_remove_bow_specification`

Steps (executed in order within a single migration):

1. Add nullable `bowId` column to `sight_marks`
2. Backfill `bowId` from `bow_specifications` via join
3. Make `bowId` non-nullable
4. Add FK constraint `sight_marks.bowId → bows.id` (cascade delete)
5. Drop old FK `sight_marks.bowSpecificationId → bow_specifications.id`
6. Drop `bowSpecificationId` column
7. Drop `bow_specifications` table
8. Drop `Placement` enum type

The backfill query:

```sql
UPDATE "sight_marks" sm
SET "bowId" = bs."bowId"
FROM "bow_specifications" bs
WHERE sm."bowSpecificationId" = bs."id";
```

This is safe because every `BowSpecification` has a `bowId` — no data is lost.

### Schema changes (Prisma)

**Before:**

```
Bow ──1:N──> BowSpecification ──1:N──> SightMark
```

**After:**

```
Bow ──1:N──> SightMark
```

Removed:
- `BowSpecification` model
- `Placement` enum
- `bowSpecifications` relation from `User` and `Bow` models

Changed:
- `SightMark.bowSpecificationId` → `SightMark.bowId` (FK to `Bow`, cascade delete)

### API changes

**Removed endpoints:**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/bow-specifications` | List all specs for user |
| POST | `/api/bow-specifications` | Create a spec |
| GET | `/api/bow-specifications/:id` | Get spec by ID |
| PUT | `/api/bow-specifications/:id` | Update spec |
| DELETE | `/api/bow-specifications/:id` | Delete spec |
| GET | `/api/bow-specifications/by-bow/:bowId` | Get or auto-create spec for a bow |

**Modified endpoints:**

`POST /api/sight-marks` — request body changed:

```diff
- { "bowSpecificationId": "...", "name": "...", ... }
+ { "bowId": "...", "name": "...", ... }
```

Validation now checks `bowId` against the `Bow` table directly.

`GET /api/sight-marks` — response shape changed:

```diff
  {
    "sightMarks": [{
      "id": "...",
-     "bowSpecificationId": "...",
+     "bowId": "...",
-     "bowSpec": {
-       "id": "...",
-       "bow": { "id": "...", "name": "...", "type": "..." }
-     }
+     "bow": { "id": "...", "name": "...", "type": "..." }
    }]
  }
```

### TypeScript types

`types/SightMarks.ts`:
- Removed `BowSpecification` interface
- `SightMark.bowSpecificationId` → `SightMark.bowId`
- `SightMark.bowSpec?: BowSpecification` → `SightMark.bow?: { id, name, type? }`

`lib/prisma.ts`:
- Removed `BowSpecification` type re-export

### UI changes

All components that accessed `sm.bowSpec?.bow?.name` now use `sm.bow?.name`:

- `components/SightMarks/SightMarksSection.tsx`
- `components/SightMarks/SightMarksTable.tsx`
- `components/SightMarks/SightMarkChooserModal.tsx`
- `app/siktemerker/page.tsx`

`SightMarksSection.handleCreate`:
- No longer fetches `GET /api/bow-specifications/by-bow/:bowId`
- Sends `bowId` directly in the `POST /api/sight-marks` body
- Fixed ballistics payload (see below)

### Ballistics fix

```diff
  const payload: AimDistanceMark = {
    ...Ballistics,
-   interval_sight_real: activeBow.aimMeasure ?? 5,
-   interval_sight_measured: activeBow.aimMeasure ?? 5,
+   interval_sight_measured: activeBow.aimMeasure ?? Ballistics.interval_sight_measured,
  };
```

- `interval_sight_real` now comes from the `Ballistics` default (5.0) via the spread
- `interval_sight_measured` uses the user's `aimMeasure`, falling back to the default (4.7) if not set
- This produces a meaningful sight scaling ratio when the user has a custom `aimMeasure`

---

## Mobile app migration guide

The Expo app needs matching changes. The key areas:

### 1. API call sites

Search for any code that calls:
- `GET/POST /api/bow-specifications` or `/api/bow-specifications/by-bow/:bowId` — remove these calls
- `POST /api/sight-marks` — change `bowSpecificationId` to `bowId`

### 2. Response handling

Any code reading `sightMark.bowSpec?.bow?.name` (or similar) must change to `sightMark.bow?.name`.

Any TypeScript types mirroring the web's `BowSpecification` interface or `SightMark.bowSpecificationId` must be updated.

### 3. Ballistics calculation

If the mobile app builds the `AimDistanceMark` payload locally, apply the same fix:
- Only override `interval_sight_measured` with the bow's `aimMeasure`
- Let `interval_sight_real` keep its default value (5.0)

### 4. Placement

The `Placement` enum (`BAK_LINJEN`, `OVER_LINJEN`, `ANNET`) has been dropped from the database. If the mobile app references it, remove those references. Placement will be revisited as a separate feature on the user profile.

---

## Verification checklist

- [x] Prisma schema valid (`prisma generate` succeeds)
- [x] TypeScript compiles (`tsc --noEmit` passes)
- [x] All 224 tests pass
- [x] No remaining references to `BowSpecification`, `bowSpec`, or `bowSpecificationId` in source code
- [ ] Migration tested against production data copy
- [ ] Mobile app updated to match API changes
