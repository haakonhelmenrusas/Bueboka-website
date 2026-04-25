---
name: ask-questions
description: >-
  Skill for asking targeted clarifying questions before starting work, to build a
  shared understanding of the project domain, the user's intent, and the expected
  outcome – preventing wasted effort and wrong-direction implementations.
user-invocable: true
---

# Asking Clarifying Questions Before Starting Work

Use this skill **before diving into implementation** whenever a task involves ambiguity about scope, intent, domain concepts, or expected behavior. Asking the right questions upfront prevents wasted effort, wrong-direction code, and mismatched expectations.

## When to Invoke This Skill

Invoke this skill when any of the following are true:

- The task description is vague, uses domain terms not defined in the codebase, or could be interpreted in multiple ways.
- The feature touches multiple bounded contexts (e.g., practices, equipment, achievements, sight marks) and it is unclear which one is the primary owner.
- The acceptance criteria or "done" state is not explicit.
- The UI/UX behavior is described in abstract terms (e.g., "make it better", "add a summary").
- The request involves a new data model or schema change with no examples provided.
- The request is about Norwegian-language copy or labeling, where the exact wording matters.

---

## Question Framework

Structure your questions in two tiers:

### Tier 1 – Blocking Questions (must be answered before any code is written)

Ask these only when proceeding without an answer would result in fundamentally wrong code or design.

1. **Domain intent**: What real-world archery action or workflow does this feature support? (e.g., "Is this for indoor or outdoor practice?", "Is a 'round' the same as a 'practice session'?")
2. **User role**: Which user persona triggers this flow – the archer logging a training session, a club admin, or a guest viewing a public profile?
3. **Acceptance criteria**: What does success look like concretely? (e.g., "Which fields are required?", "What should happen on validation failure?")
4. **Data ownership**: Does this require a new Prisma model, a new field on an existing model, or is it purely derived/computed data?
5. **Edge cases**: What happens when the data is missing, zero, or invalid? (e.g., "What if no arrows have been logged yet?")

### Tier 2 – Clarifying Questions (can be answered with reasonable assumptions if the user is unavailable)

Ask these when you have a working hypothesis but want to confirm before finalizing:

1. **Scope**: Is this change isolated to a single component/route, or does it affect shared state/caches?
2. **Existing patterns**: Should this follow an existing component pattern (e.g., a modal with `useModalBehavior`, a form using common `Input`/`Select` primitives)?
3. **Norwegian copy**: What is the exact Norwegian label or message to display? (Avoid translating from English yourself – use `lib/labels.ts` if it exists, or ask for the exact string.)
4. **Performance sensitivity**: Is this on the hot path (e.g., the stats dashboard) where caching via `statsCache` or `roundTypesCache` is important?
5. **Mobile/responsive**: Are there specific mobile layout requirements, or should it follow the existing responsive CSS Module patterns?

---

## How to Ask

- Ask questions **grouped and numbered**, not one at a time in separate messages.
- Lead with the most impactful question first.
- Offer your **current assumption** alongside each question so the user can simply confirm or correct: e.g., *"I'm assuming this is a mutation that needs to invalidate `statsCache` – is that correct?"*
- Keep questions **short and concrete**. Avoid open-ended questions like "Can you tell me more?" – instead ask "Should this be a POST or a PATCH request?"

### Example Opening

> Before I start, I have a few questions to make sure I build the right thing:
>
> 1. [Blocking] Should this change write to the database, or is it purely a UI/display concern?
> 2. [Clarifying] I'm assuming the Norwegian label should be "Legg til økt" – is that correct, or should I check `lib/labels.ts` for an existing constant?
> 3. [Clarifying] Should validation errors appear inline (below each field) or as a toast/banner at the top of the form?

---

## Project-Specific Domain Concepts to Clarify

When working in this codebase, always verify your understanding of these domain terms if they appear in a task:

| Term | Likely meaning – confirm before assuming |
|---|---|
| **Økt / Practice** | A single training session with arrows, equipment, and conditions logged |
| **Runde / Round** | A structured competition format (e.g., 18m, WA 25m) – defined in `RoundType` |
| **Bue / Bow** | The archer's primary equipment item – has `BowType` (RECURVE, COMPOUND, etc.) |
| **Sikte / Sight mark** | Distance-specific sight setting stored per bow |
| **Achievement** | A milestone unlocked based on cumulative practice data – statically defined, not in DB |
| **Environment** | Indoor vs. outdoor (`Environment` enum in `lib/prismaEnums.ts`) |
| **Poengsystem / Scoring** | The scoring system used in a round (e.g., 10-zone, 5-zone) |

---

## After Questions Are Answered

Once you have answers:

1. Restate your understanding in one short paragraph.
2. Identify which files and Prisma models will be touched.
3. Confirm the expected test coverage (unit tests for logic, component tests for UI).
4. Then begin implementation.
