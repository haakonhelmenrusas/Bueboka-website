---
name: tdd-ddd
description: >-
  Skill for applying Test-Driven Development (TDD) and Domain-Driven Design (DDD)
  when building new features or modifying existing ones in this codebase.
  Ensures tests are written before implementation and that code reflects the
  archery domain language throughout.
user-invocable: true
---

# Test-Driven Development and Domain-Driven Design

Apply this skill when building new features, modifying existing domain logic, or adding new API routes or components. It enforces a disciplined cycle of writing tests first and keeping the code vocabulary aligned with the archery domain.

---

## Part 1 – Test-Driven Development (TDD)

### The TDD Cycle (Red → Green → Refactor)

Follow this strict cycle for every unit of new behavior:

1. **Red** – Write a failing test that describes the expected behavior. Run the test suite to confirm it fails for the right reason (`npm test`).
2. **Green** – Write the minimum code to make the test pass. No extra logic. No premature abstraction.
3. **Refactor** – Clean up the implementation (rename, extract, simplify) without changing behavior. All tests must stay green.

Repeat this cycle for each new behavior, edge case, or validation rule.

---

### Test File Conventions

- Co-locate test files with the component or module under test:
  - `components/PracticeCard/PracticeCard.test.tsx`
  - `lib/achievements/checker.test.ts`
- Use Jest with `@testing-library/react` for component tests.
- Test file naming: `<Name>.test.tsx` (components) or `<name>.test.ts` (pure logic).

```ts
// Example structure for a component test
import { render, screen } from '@testing-library/react';
import { PracticeCard } from './PracticeCard';

describe('PracticeCard', () => {
  it('displays the practice date formatted in nb-NO locale', () => {
    // Arrange
    const practice = { date: new Date('2024-06-15'), ... };

    // Act
    render(<PracticeCard practice={practice} />);

    // Assert
    expect(screen.getByText('15. juni 2024')).toBeInTheDocument();
  });
});
```

---

### What to Test

| Layer | What to test |
|---|---|
| **Domain logic / pure functions** | All branches, edge cases, boundary values |
| **React components** | Rendered output, user interactions, loading/error states |
| **API route handlers** | Authentication guard, validation errors (400), success response shape (200/201), cache invalidation |
| **Zod schemas** (`lib/validations/`) | Valid input passes, invalid input fails with correct error messages |
| **Achievement checker** | Progress calculation for each achievement definition |
| **Hooks** | State transitions, side effects triggered by user events |

### What NOT to Test

- Implementation details (internal state, private helper names).
- Third-party libraries (Prisma, Better Auth).
- Auto-generated Prisma client types.
- CSS class names or CSS Module styles.

---

### Mocking Conventions

`@/lib/auth-client` is globally mocked in `__mocks__/auth-client.ts`. Do not re-mock it in individual test files.

For Prisma, mock at the module level:

```ts
jest.mock('@/lib/prisma', () => ({
  prisma: {
    practice: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

For API routes that call `getCurrentUser()`, mock the session:

```ts
jest.mock('@/lib/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
}));
```

---

### Running Tests

```bash
npm test                  # Run all tests once
npm run test:watch        # Watch mode for active development
```

Always run tests before committing. The `pre-push` hook enforces this automatically.

---

## Part 2 – Domain-Driven Design (DDD)

### Ubiquitous Language

All code – variable names, function names, type names, comments, and test descriptions – must use the **same domain vocabulary** as the archery domain and the Norwegian-language UI. Never use generic terms when a domain term exists.

| ❌ Avoid | ✅ Use instead |
|---|---|
| `session`, `event`, `log` | `practice` (økt) |
| `item`, `weapon`, `tool` | `bow` (bue) |
| `target`, `goal` | `round` (runde) for competition formats; `achievement` for milestones |
| `setting`, `config` | `sightMark` for sight distance settings |
| `score`, `points` | `arrows`, `ends`, `totalScore` depending on context |
| `user`, `account` | `archer` in domain logic; `user` only in auth/session context |

When in doubt, check `lib/types.ts`, `lib/labels.ts`, and `prisma/schema.prisma` for the canonical names used throughout the codebase.

---

### Bounded Contexts in This Application

Each bounded context has a clear owner. Do not mix concerns across contexts unless there is an explicit integration point.

| Bounded Context | Key Models / Files | Responsibility |
|---|---|---|
| **Practice** | `Practice`, `Arrow`, `End` | Logging training sessions with equipment and conditions |
| **Equipment** | `Bow`, `Arrow` (profile) | Managing an archer's bows and arrows |
| **Sight Marks** | `SightMark`, `types/SightMarks.ts` | Per-bow distance sight settings and ballistics |
| **Achievements** | `UserAchievement`, `lib/achievements/` | Milestone tracking based on practice history |
| **Competitions** | `Competition`, `Round`, `RoundType` | Structured competition formats and results |
| **Profile** | `User`, `UserProfile` | Archer identity, preferences, public profile |
| **Auth** | Better Auth models | Authentication and session management only |

---

### Aggregate Design Rules

- Each aggregate has a single **root entity** (e.g., `Practice` is the root of the practice aggregate; it owns `End` and `Arrow` records).
- Mutations to an aggregate go through the root. Do not write directly to child records (e.g., `End` or `Arrow`) without going through the `Practice` API route.
- Aggregate boundaries map to API route groupings: `app/api/practices/`, `app/api/bows/`, etc.

---

### Value Objects

Prefer value objects (plain TypeScript types or Zod-validated inputs) over primitive obsession:

```ts
// ❌ Primitive obsession
function logPractice(userId: string, distanceMeters: number, score: number) { ... }

// ✅ Named value objects aligned with the domain
function logPractice(archer: Archer, distance: Distance, roundScore: RoundScore) { ... }
```

Check `lib/types.ts` and `lib/validations/` for existing value types before creating new ones.

---

### Domain Events

Use `lib/events.ts` for lightweight domain event communication between bounded contexts (currently used for equipment changes). Follow the same pattern for any cross-context notifications:

```ts
import { emitEquipmentChanged, onEquipmentChanged } from '@/lib/events';
```

Do not use global state, React context, or prop drilling to communicate cross-context events – use the event bus.

---

### Applying TDD + DDD Together

When starting a new feature:

1. **Identify the bounded context** – Which context owns this feature?
2. **Name things in the domain language** – What are the entities, value objects, and behaviors involved?
3. **Write a failing test using domain terms** – The test description should read like a business rule: `it('awards the "first practice" achievement when an archer logs their first practice session')`.
4. **Implement using the ubiquitous language** – Variable and function names in the implementation must match the test description.
5. **Refactor toward the domain model** – After going green, check if the implementation introduces any leaky abstractions or primitive obsession that should be replaced with proper domain types.

---

### Checklist Before Marking a Feature Done

- [ ] Tests are written before or alongside the implementation (not after).
- [ ] Test descriptions use domain language (Norwegian terms acceptable when they match the UI).
- [ ] No generic names (`data`, `item`, `obj`, `temp`) in domain logic.
- [ ] New types added to `lib/types.ts` if they represent domain concepts.
- [ ] New Norwegian labels added to `lib/labels.ts` instead of inline strings.
- [ ] Aggregate boundaries respected – no direct child record mutations bypassing the root.
- [ ] `npm test` passes with no regressions.
- [ ] `npm run lint` passes clean.
