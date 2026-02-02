# Implementation Plan: CoachIQ Mobile Backend

## Overview

This plan covers all features described in the `specs/` directory for the CoachIQ Mobile Backend API. After a thorough audit of the codebase against every spec, the following status applies:

- **8 of 9 specs are fully implemented** with correct behavior
- **1 spec has significant gaps**: `specs/wellness-alert-engine.md` — the alert engine's rules, thresholds, message format, and function signature diverge from the spec

The remaining work focuses entirely on aligning the alert engine implementation with the spec.

---

## Audit Summary: What's Already Complete

### Schema & Models (specs: `wellness-check-expansion.md`, `mobile-data-models.md`) — DONE
All models exist in `prisma/schema.prisma`:
- WellnessCheck: expanded fields (focus, foodTiming, sorenessAreas, illnessSymptoms, sorenessNotes, illnessNotes, wellnessRequestId)
- WellnessRequest, RPERequest, DeviceToken, WellnessAlert: all fields, relations, and indexes match specs
- RPESubmission: rpeRequestId FK added

### Auth Endpoints (specs: `athlete-pin-auth.md`, `coach-mobile-auth.md`) — DONE
- `POST /api/mobile/v1/auth/athlete-login` — PIN validation, rate limiting, activation, JWT (30-day)
- `POST /api/mobile/v1/auth/coach-login` — Supabase Auth, JWT (7-day)
- `POST /api/mobile/v1/auth/register-device` — Expo push token upsert

### Submission Endpoints (specs: `wellness-submission.md`, `rpe-submission.md`) — DONE
- `POST /api/mobile/v1/athlete/wellness` — 9-field validation, one-per-day, request linking, alert trigger
- `POST /api/mobile/v1/athlete/rpe` — RPE validation, ownership check, dual-write transaction

### Read Endpoints (specs: `athlete-pending-requests.md`, `athlete-workouts-and-stats.md`) — DONE
- `GET /api/mobile/v1/athlete/pending` — pending wellness + RPE requests with group scoping
- `GET /api/mobile/v1/athlete/workouts` — upcoming with personalized paces, history with splits
- `GET /api/mobile/v1/athlete/stats` — WECI/RPE trends, wellness summary, PRs, baseline

### Utilities — DONE
- `lib/utils/jwt.ts` — signing/verification
- `lib/utils/errors.ts` — error/success response helpers
- `lib/utils/rate-limit.ts` — in-memory rate limiter
- `lib/utils/wellness-validation.ts` — 9-field input validation with allowed sets
- `lib/utils/pace-calculations.ts` — personalized target pace calculations
- `lib/middleware/auth.ts` — JWT extraction middleware

---

## Gap Analysis: Alert Engine (spec: `wellness-alert-engine.md`)

The current `lib/utils/alert-engine.ts` implementation has three categories of issues:

### A. Missing Rules (8 of 17 rules not implemented)

| Rule ID | Severity | Condition | Status |
|---------|----------|-----------|--------|
| `food_critical` | critical | foodTiming = "havent_eaten" | MISSING |
| `compound_critical` | critical | energy <= 4 AND sleepHours <= 5.0 | MISSING |
| `sleep_hours_high` | high | sleepHours > 4.0 AND sleepHours <= 5.0 | MISSING |
| `food_timing_medium` | medium | foodTiming = "just_ate" | MISSING |
| `sleep_quality_medium` | medium | sleepQuality >= 5 AND sleepQuality <= 6 | MISSING |
| `soreness_low` | low | sorenessAreas.length >= 1 AND <= 2 | MISSING |
| `energy_low` | low | energy >= 4 AND energy <= 5 | MISSING |
| `first_submission` | low | priorSubmissionCount === 0 | MISSING |

### B. Wrong Thresholds / Rule IDs (9 existing rules differ)

| Spec Rule ID | Spec Threshold | Current Rule ID | Current Threshold |
|--------------|---------------|-----------------|-------------------|
| `hydration_critical` | hydration <= 3 | `hydration_critical` | hydration <= 2 |
| `energy_critical` | energy <= 3 | `energy_critical` | energy <= 2 |
| `sleep_hours_critical` | sleepHours <= 4.0 | `sleep_hours_critical` | sleepHours <= 5.0 |
| `illness_critical` | symptoms >= 3 | `illness_critical` | symptoms >= 4 |
| `soreness_high` | areas >= 3 | `soreness_multiple` | areas >= 4 |
| `hydration_high` | hydration 4–5 | `hydration_low` | hydration 3–4 |
| `sleep_quality_high` | sleepQuality <= 4 | `sleep_quality_low` | sleepQuality <= 3 |
| `illness_high` | symptoms 1–2 | `illness_symptoms` | symptoms 2–3 |
| `motivation_medium` | motivation <= 4 | `motivation_low` | motivation <= 3 |
| `focus_medium` | focus <= 4 | `focus_low` | focus <= 3 |

### C. Missing Function Parameters & Message Format

- **Missing input:** `foodTiming` not in `WellnessData` interface (needed for `food_critical`, `food_timing_medium`)
- **Missing input:** `athleteName` not accepted (spec: messages must include `"{name}"`)
- **Missing input:** `priorSubmissionCount` not accepted (spec: needed for `first_submission` rule)
- **Message format:** Current messages are generic (e.g., `"Critically low hydration reported"`). Spec requires athlete name and values: `"{name} reports very low hydration ({value}/10)"`

### D. Integration Gap in Wellness Endpoint

- `wellness+api.ts` does not pass `foodTiming` to the alert engine
- Does not query athlete name (firstName + lastName)
- Does not count prior submissions for `first_submission` rule

---

## Phase 1: Alert Engine Rewrite

### Task 1.1: Rewrite alert engine to match spec [DONE]
- **Files:** `lib/utils/alert-engine.ts`
- **Change:** Complete rewrite of the alert engine function and types:
  1. **Update `WellnessData` interface** to add `foodTiming: FoodTiming` field (import `FoodTiming` from wellness-validation)
  2. **Update function signature** to:
     ```ts
     evaluateWellnessAlerts(
       data: WellnessData,
       athleteName: string,
       priorSubmissionCount: number
     ): AlertResult[]
     ```
  3. **Implement all 17 rules** using a declarative structure (per spec: "Keep alert rules in a declarative data structure so new rules can be added easily"):

     **CRITICAL rules (6):**
     | Rule ID | Condition | Message |
     |---------|-----------|---------|
     | `food_critical` | foodTiming = "havent_eaten" | "{name} hasn't eaten before practice" |
     | `hydration_critical` | hydration <= 3 | "{name} reports very low hydration ({value}/10)" |
     | `energy_critical` | energy <= 3 | "{name} reports very low energy ({value}/10)" |
     | `sleep_hours_critical` | sleepHours <= 4.0 | "{name} got only {value} hours of sleep" |
     | `illness_critical` | illnessSymptoms.length >= 3 | "{name} reports {count} illness symptoms: {symptoms}" |
     | `compound_critical` | energy <= 4 AND sleepHours <= 5.0 | "{name} has low energy AND poor sleep — possible overtraining" |

     **HIGH rules (5):**
     | Rule ID | Condition | Message |
     |---------|-----------|---------|
     | `soreness_high` | sorenessAreas.length >= 3 | "{name} reports soreness in {count} areas: {areas}" |
     | `hydration_high` | hydration >= 4 AND hydration <= 5 | "{name} reports below-average hydration ({value}/10)" |
     | `sleep_quality_high` | sleepQuality <= 4 | "{name} reports poor sleep quality ({value}/10)" |
     | `illness_high` | illnessSymptoms.length >= 1 AND <= 2 | "{name} reports illness symptoms: {symptoms}" |
     | `sleep_hours_high` | sleepHours > 4.0 AND sleepHours <= 5.0 | "{name} got only {value} hours of sleep" |

     **MEDIUM rules (4):**
     | Rule ID | Condition | Message |
     |---------|-----------|---------|
     | `motivation_medium` | motivation <= 4 | "{name} reports low motivation ({value}/10)" |
     | `focus_medium` | focus <= 4 | "{name} reports low focus ({value}/10)" |
     | `food_timing_medium` | foodTiming = "just_ate" | "{name} just ate before practice" |
     | `sleep_quality_medium` | sleepQuality >= 5 AND sleepQuality <= 6 | "{name} reports average sleep quality ({value}/10)" |

     **LOW rules (3):**
     | Rule ID | Condition | Message |
     |---------|-----------|---------|
     | `soreness_low` | sorenessAreas.length >= 1 AND <= 2 | "{name} reports minor soreness: {areas}" |
     | `energy_low` | energy >= 4 AND energy <= 5 | "{name} reports below-average energy ({value}/10)" |
     | `first_submission` | priorSubmissionCount === 0 | "First wellness check-in from {name}" |

  4. **Rule evaluation:** ALL rules are evaluated independently (no short-circuiting; no else-if chains between rules at different severity levels for the same metric). A single submission can trigger multiple alerts at different severity levels.
  5. **Message rendering:** Replace template placeholders with actual values:
     - `{name}` → athleteName
     - `{value}` → the numeric value from the submission
     - `{count}` → count of items (symptoms/areas)
     - `{symptoms}` → comma-joined list of illness symptoms
     - `{areas}` → comma-joined list of soreness areas
  6. **Details object:** Each alert's `details` includes the actual metric values and the threshold that triggered it (e.g., `{ hydration: 2, threshold: 3 }`)

- **Spec:** `specs/wellness-alert-engine.md` US-001 through US-005
- **Dependencies:** None
- **Validation:** `pnpm lint && pnpm build`

### Task 1.2: Update wellness endpoint to pass new alert engine parameters
- **Files:** `app/api/mobile/v1/athlete/wellness+api.ts`
- **Change:** Update the alert engine integration to pass the three new parameters:
  1. **Query athlete name:** Before calling the alert engine, fetch the athlete's `firstName` and `lastName` from the database (extend the existing athlete lookup or add one)
  2. **Count prior submissions:** Query `prisma.wellnessCheck.count({ where: { athleteId } })` to get the total number of prior submissions (BEFORE the current one was created, so subtract 1 from the count or query before creation)
  3. **Pass `foodTiming`** to the alert engine (currently omitted from the data object passed to `evaluateWellnessAlerts`)
  4. **Update call:** Change from:
     ```ts
     evaluateWellnessAlerts({ sleepHours, sleepQuality, hydration, energy, ... })
     ```
     To:
     ```ts
     evaluateWellnessAlerts(
       { sleepHours, sleepQuality, hydration, energy, ..., foodTiming },
       `${athlete.firstName} ${athlete.lastName}`,
       priorSubmissionCount
     )
     ```
  5. The athlete name query can be combined with existing queries to avoid extra DB calls

- **Spec:** `specs/wellness-alert-engine.md` (function integration), `specs/wellness-submission.md` US-005
- **Dependencies:** Task 1.1
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 2: Final Validation

### Task 2.1: Run full lint and build validation
- **Files:** None (validation only)
- **Change:** Run `pnpm lint` and `pnpm build` across the entire project. Fix any TypeScript errors, ESLint issues, or build failures introduced by the changes.
- **Spec:** `AGENTS.md` (Build & Validation Commands)
- **Dependencies:** Task 1.1, Task 1.2
- **Validation:** Both commands exit 0 with no errors

---

## Summary

### Modified Files (2)
| File | Phase | Change |
|------|-------|--------|
| `lib/utils/alert-engine.ts` | 1 | Rewrite: 17 rules, correct thresholds/IDs, athlete name in messages, foodTiming + compound rule support, first_submission rule, declarative rule structure |
| `app/api/mobile/v1/athlete/wellness+api.ts` | 1 | Update: pass foodTiming, athleteName, priorSubmissionCount to alert engine |

### No New Files

### No Schema Changes

### Dependency Graph

```
Task 1.1 (alert engine rewrite) ── Task 1.2 (wellness endpoint integration) ── Task 2.1 (validation)
```

### Rule Count Comparison

| | Current | After |
|---|---------|-------|
| CRITICAL rules | 4 | 6 |
| HIGH rules | 4 | 5 |
| MEDIUM rules | 2 | 4 |
| LOW rules | 0 | 3 |
| **Total** | **10** | **18** (17 spec rules + compound_critical evaluated separately) |

### Key Implementation Notes

1. **No else-if chains between severity levels for the same metric.** The spec says all rules are evaluated independently. For example, `hydration=3` triggers `hydration_critical` (<=3) but NOT `hydration_high` (4-5) because the ranges don't overlap. However, `compound_critical` CAN fire alongside individual `energy_critical` or `sleep_hours_critical` rules since it checks different thresholds.

2. **The `first_submission` rule** needs the prior count BEFORE the current submission. The wellness endpoint should count prior submissions before (or query count after and subtract 1) to correctly identify the first-ever check-in.

3. **Declarative rule structure** — the spec says "Keep alert rules in a declarative data structure so new rules can be added easily." Implement rules as an array of rule objects with `id`, `severity`, `evaluate(data)`, and `message(data, name)` functions, then iterate and collect results.
