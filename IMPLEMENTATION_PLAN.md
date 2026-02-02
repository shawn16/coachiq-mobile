# Implementation Plan: CoachIQ Mobile Backend — Phase 2

## Overview

This plan implements the remaining spec files for the mobile backend API:
1. **`specs/wellness-submission.md`** — Athlete wellness check-in submission
2. **`specs/rpe-submission.md`** — Athlete RPE rating submission
3. **`specs/athlete-workouts-and-stats.md`** — Workout schedule and performance stats
4. **`specs/athlete-pending-requests.md`** — Outstanding coach requests

### Already Implemented (Phase 1 — Complete)
- **Prisma schema** — All models exist: Coach, Team, Group, Athlete, Workout, WorkoutResult, Split, WellnessCheck (with expanded fields), RPESubmission, WellnessRequest, RPERequest, DeviceToken, WellnessAlert, PersonalRecord, AthleteBaselineHistory
- **Auth endpoints** — `POST /api/mobile/v1/auth/athlete-login`, `coach-login`, `register-device`
- **Utilities** — `lib/db.ts` (Prisma singleton), `lib/supabase.ts`, `lib/utils/jwt.ts`, `lib/utils/errors.ts`, `lib/utils/rate-limit.ts`, `lib/middleware/auth.ts`

### Key Schema Notes
- `WellnessCheck.energyLevel` in Prisma maps to API field `energy` (name mismatch to handle)
- `WellnessCheck` has `@@unique([athleteId, date])` — enforces one-per-day at DB level
- `WellnessCheck` has no `teamId` column — derivable from `athlete.teamId`; use JWT's teamId for WellnessAlert creation
- `RPESubmission.workoutResultId` is `@unique` — enforces one RPE per workout result at DB level
- `RPESubmission` currently lacks `rpeRequestId` — needs schema addition (Task 1.2)
- `WellnessCheck` currently lacks `sorenessNotes` and `illnessNotes` — needs schema addition (Task 1.1)

### Constraints
- **Shared database** — no destructive changes; new fields must be nullable or have defaults
- All mobile API routes live under `/api/mobile/v1/`
- Follow existing Expo Router `+api.ts` route pattern
- Error format: `{ error: { code: "ERROR_CODE", message: "Human-readable message" } }`
- Validate with `pnpm lint && pnpm build` after each task

---

## Phase 1: Schema Updates

### Task 1.1: Add sorenessNotes and illnessNotes to WellnessCheck [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add two new nullable String fields to the `WellnessCheck` model:
  ```prisma
  sorenessNotes     String?  @map("soreness_notes")
  illnessNotes      String?  @map("illness_notes")
  ```
  Place after `illnessSymptoms` and before `wellnessRequestId`.
- **Spec:** `specs/wellness-submission.md` (Optional Fields table: sorenessNotes max 500 chars, illnessNotes max 500 chars)
- **Dependencies:** None
- **Validation:** `pnpm prisma validate`

### Task 1.2: Add rpeRequestId FK to RPESubmission [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add optional FK field and relation to `RPESubmission` model:
  ```prisma
  rpeRequestId    String?     @map("rpe_request_id")
  rpeRequest      RPERequest? @relation(fields: [rpeRequestId], references: [id], onDelete: SetNull)
  ```
  Add the inverse relation on the `RPERequest` model:
  ```prisma
  rpeSubmissions RPESubmission[]
  ```
- **Spec:** `specs/rpe-submission.md` (Request body: `rpeRequestId | String | No | Valid RPERequest UUID`)
- **Dependencies:** None
- **Validation:** `pnpm prisma validate`

### Task 1.3: Run Prisma migration and generate client [DONE]
- **Files:** `prisma/migrations/` (auto-generated)
- **Change:** Run:
  1. `pnpm prisma migrate dev --name add-mobile-submission-fields`
  2. `pnpm prisma generate`
- **Spec:** `specs/wellness-submission.md`, `specs/rpe-submission.md`
- **Dependencies:** Task 1.1, Task 1.2
- **Validation:** Migration runs without error; `pnpm prisma generate` succeeds; `pnpm build` passes

---

## Phase 2: Shared Utilities

### Task 2.1: Create wellness input validation utility [DONE]
- **Files:** `lib/utils/wellness-validation.ts` (new)
- **Change:** Create a validation module exporting `validateWellnessInput(body: unknown)` that returns either a validated/typed data object or an array of field-specific error strings. Validation rules:
  - `sleepHours`: required, Float, 4.0–12.0 inclusive, must be in 0.5 increments (e.g., 4.0, 4.5, 5.0 ... 12.0)
  - `sleepQuality`: required, Int, 1–10
  - `hydration`: required, Int, 1–10
  - `energy`: required, Int, 1–10
  - `motivation`: required, Int, 1–10
  - `focus`: required, Int, 1–10
  - `foodTiming`: required, String, one of `"havent_eaten"`, `"just_ate"`, `"1_2_hours"`, `"3_plus_hours"`
  - `sorenessAreas`: required, String[], each from allowed set: `quads`, `hamstrings`, `calves`, `shins`, `knees`, `ankles`, `feet`, `hips`, `lower_back`, `upper_back`, `shoulders`, `neck` — empty array is valid
  - `illnessSymptoms`: required, String[], each from allowed set: `headache`, `sore_throat`, `congestion`, `cough`, `nausea`, `fever`, `fatigue`, `body_aches`, `dizziness` — empty array is valid
  - `notes`: optional, String, max 1000 chars
  - `sorenessNotes`: optional, String, max 500 chars
  - `illnessNotes`: optional, String, max 500 chars
  - `wellnessRequestId`: optional, String, UUID format
  - Export the allowed sets as constants (for potential reuse)
  - Export TypeScript types for the validated input shape
- **Spec:** `specs/wellness-submission.md` US-003, `specs/wellness-check-expansion.md` (allowed sets)
- **Dependencies:** None
- **Validation:** `pnpm lint && pnpm build`

### Task 2.2: Create wellness alert engine [DONE]
- **Files:** `lib/utils/alert-engine.ts` (new)
- **Change:** Create a **pure function** (per AGENTS.md: "The alert engine should be a pure function importable by the wellness submission endpoint") that evaluates wellness data and returns alert results. Export:
  - `evaluateWellnessAlerts(data: WellnessData): AlertResult[]`
  - `AlertResult` type: `{ ruleId: string; severity: "critical" | "high" | "medium" | "low"; message: string; details: Record<string, unknown> }`
  - `WellnessData` type matching the validated wellness input fields

  Alert rules to implement:
  | Rule ID | Condition | Severity | Message |
  |---------|-----------|----------|---------|
  | `hydration_critical` | hydration <= 2 | critical | "Critically low hydration reported" |
  | `hydration_low` | hydration > 2 AND <= 4 | high | "Low hydration reported" |
  | `energy_critical` | energy <= 2 | critical | "Critically low energy reported" |
  | `energy_low` | energy > 2 AND <= 4 | high | "Low energy reported" |
  | `sleep_hours_critical` | sleepHours <= 5.0 | critical | "Very low sleep duration reported" |
  | `sleep_quality_low` | sleepQuality <= 3 | high | "Poor sleep quality reported" |
  | `motivation_low` | motivation <= 3 | medium | "Low motivation reported" |
  | `focus_low` | focus <= 3 | medium | "Low focus reported" |
  | `soreness_multiple` | sorenessAreas.length >= 4 | high | "Multiple soreness areas reported" |
  | `illness_critical` | illnessSymptoms.length >= 4 | critical | "Significant illness symptoms reported" |
  | `illness_symptoms` | illnessSymptoms.length >= 2 AND < 4 | high | "Multiple illness symptoms reported" |

  Each alert's `details` object includes the actual values and thresholds that triggered the rule (e.g., `{ hydration: 2, threshold: 2 }`).
- **Spec:** `specs/wellness-submission.md` US-005, `specs/mobile-data-models.md` (WellnessAlert model)
- **Dependencies:** None
- **Validation:** `pnpm lint && pnpm build`

### Task 2.3: Create pace calculation utility [DONE]
- **Files:** `lib/utils/pace-calculations.ts` (new)
- **Change:** Create utility functions for personalized workout target pace calculations. Export:
  - `calculatePersonalizedTargetPaces(athleteBaseline1600m: number | null, workoutStructureJson: unknown, workoutTargetPace: number | null): TargetPace[]`
    - `TargetPace` type: `{ repNumber: number; distance: number; paceReference: number; targetTime: number }`
    - Logic: Scale the workout's reference pace proportionally based on the athlete's 1600m baseline time relative to a standard/reference time. For each rep in the structure, compute: `targetTime = (repDistance / referenceDistance) * (athleteBaseline / referencePace) * targetSplitTime`
    - If `athleteBaseline1600m` is null or `workoutStructureJson` is null/invalid, return empty array
    - Parse `structureJson` safely — handle unknown structure formats gracefully
  - Export TypeScript types for the workout structure shape and target pace results
  - Handle edge cases: missing baselines, empty structures, unknown structure formats
- **Spec:** `specs/athlete-workouts-and-stats.md` US-001 ("personalized target paces based on athlete's baseline"), Technical Notes ("reuse existing pace utilities from the web app")
- **Dependencies:** None
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 3: Submission Endpoints

### Task 3.1: Create wellness submission endpoint [DONE]
- **Files:** `app/api/mobile/v1/athlete/wellness+api.ts` (new)
- **Change:** Implement `POST /api/mobile/v1/athlete/wellness` handler:

  **Logic (in order):**
  1. Authenticate via `authenticateRequest(request)` — verify role = `"athlete"`, extract `userId` (athleteId), `teamId`
  2. Parse request body as JSON
  3. Validate input using `validateWellnessInput(body)` → return 400 `VALIDATION_ERROR` with field errors if invalid
  4. If `wellnessRequestId` provided: query `prisma.wellnessRequest.findUnique()` and verify it exists AND `teamId` matches athlete's team → return 400 `VALIDATION_ERROR` if not
  5. Create `WellnessCheck` record via `prisma.wellnessCheck.create()`:
     - Set `athleteId` from JWT
     - Set `date` to today (Date only, no time) for the unique constraint
     - Map `energy` → `energyLevel` field name
     - Set all other fields from validated input
  6. Catch Prisma unique constraint error on `[athleteId, date]` → return 409 `ALREADY_SUBMITTED` ("You have already submitted a wellness check today.")
  7. Run alert engine: call `evaluateWellnessAlerts()` with submission data
  8. If alerts returned: batch-create `WellnessAlert` records via `prisma.wellnessAlert.createMany()`:
     - Set `wellnessCheckId`, `athleteId`, `teamId` (from JWT), `ruleId`, `severity`, `message`, `details` per alert
  9. Return 201 with `{ wellnessCheck: <created record>, alerts: [{ ruleId, severity, message }, ...] }`

  **Error responses:**
  | Status | Code | Message |
  |--------|------|---------|
  | 400 | VALIDATION_ERROR | Field-specific error message |
  | 401 | UNAUTHORIZED | Authentication required. |
  | 409 | ALREADY_SUBMITTED | You have already submitted a wellness check today. |

- **Spec:** `specs/wellness-submission.md` US-001 through US-005
- **Dependencies:** Task 1.3 (schema migration), Task 2.1 (validation), Task 2.2 (alert engine)
- **Validation:** `pnpm lint && pnpm build`

### Task 3.2: Create RPE submission endpoint
- **Files:** `app/api/mobile/v1/athlete/rpe+api.ts` (new)
- **Change:** Implement `POST /api/mobile/v1/athlete/rpe` handler:

  **Logic (in order):**
  1. Authenticate via `authenticateRequest(request)` — verify role = `"athlete"`, extract `userId` (athleteId), `teamId`
  2. Parse request body as JSON
  3. Validate input:
     - `rpe`: required, Int, 1–10
     - `workoutResultId`: required, String (UUID format)
     - `notes`: optional, String, max 500 chars
     - `rpeRequestId`: optional, String (UUID format)
  4. Query `WorkoutResult` by `workoutResultId` — verify it exists AND `athleteId` matches JWT → return 400 `INVALID_WORKOUT` ("Workout result not found or does not belong to you.") if not
  5. If `rpeRequestId` provided: verify `RPERequest` exists and `teamId` matches → return 400 `VALIDATION_ERROR` if not
  6. Execute dual-write in a `prisma.$transaction()`:
     a. `prisma.rPESubmission.create()` with `workoutResultId`, `athleteId`, `rpe`, `notes`, `rpeRequestId`
     b. `prisma.workoutResult.update()` setting `rpe` to the submitted value
  7. Catch Prisma unique constraint error on `RPESubmission.workoutResultId` → return 409 `ALREADY_SUBMITTED` ("You have already submitted RPE for this workout.")
  8. Return 201 with `{ rpeSubmission: <created record> }`

  **Error responses:**
  | Status | Code | Message |
  |--------|------|---------|
  | 400 | VALIDATION_ERROR | Field-specific error message |
  | 400 | INVALID_WORKOUT | Workout result not found or does not belong to you. |
  | 401 | UNAUTHORIZED | Authentication required. |
  | 409 | ALREADY_SUBMITTED | You have already submitted RPE for this workout. |

- **Spec:** `specs/rpe-submission.md` US-001 through US-004
- **Dependencies:** Task 1.3 (schema migration for rpeRequestId)
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 4: Read Endpoints

### Task 4.1: Create pending requests endpoint
- **Files:** `app/api/mobile/v1/athlete/pending+api.ts` (new)
- **Change:** Implement `GET /api/mobile/v1/athlete/pending` handler:

  **Logic (in order):**
  1. Authenticate via `authenticateRequest(request)` — verify role = `"athlete"`, extract `userId` (athleteId), `teamId`
  2. Look up athlete record to get `groupId` (for group-scoped filtering)
  3. Query **pending wellness requests** via `prisma.wellnessRequest.findMany()`:
     - WHERE `teamId` = athlete's team
     - AND (`groupId` IS NULL OR `groupId` = athlete's `groupId`) — team-wide or athlete's group
     - AND `deadline` > `new Date()` (not expired)
     - AND NOT EXISTS a `WellnessCheck` where `wellnessRequestId` = this request's ID AND `athleteId` = this athlete
     - Include `coach` relation for coach name
     - ORDER BY `deadline` ASC (most urgent first)
     - SELECT: `id`, `message`, `deadline`, `createdAt`, `coach.name` (as `coachName`)
  4. Query **pending RPE requests** via `prisma.rPERequest.findMany()`:
     - WHERE `teamId` = athlete's team
     - AND (`groupId` IS NULL OR `groupId` = athlete's `groupId`)
     - AND `deadline` > `new Date()`
     - AND the athlete does NOT have an `RPESubmission` where `workoutResult.workoutId` = this request's `workoutId` AND `athleteId` = this athlete
     - Include `coach` relation for coach name and `workout` relation for workout details
     - ORDER BY `deadline` ASC
     - SELECT: `id`, `message`, `deadline`, `createdAt`, `coach.name` (as `coachName`), workout `{ id, name, date, workoutType }`
  5. Return 200 with `{ wellnessRequests: [...], rpeRequests: [...] }` — empty arrays if nothing pending

  **Note on RPE pending check:** The RPE "already submitted" check looks for whether the athlete has any `RPESubmission` record linked (via `WorkoutResult`) to the same `workoutId` as the `RPERequest`. This requires either a subquery or a post-query filter.

  **Error responses:**
  | Status | Code | Message |
  |--------|------|---------|
  | 401 | UNAUTHORIZED | Authentication required. |

- **Spec:** `specs/athlete-pending-requests.md` US-001 through US-003
- **Dependencies:** Task 1.3 (schema)
- **Validation:** `pnpm lint && pnpm build`

### Task 4.2: Create athlete workouts endpoint
- **Files:** `app/api/mobile/v1/athlete/workouts+api.ts` (new)
- **Change:** Implement `GET /api/mobile/v1/athlete/workouts` handler:

  **Logic (in order):**
  1. Authenticate via `authenticateRequest(request)` — verify role = `"athlete"`, extract `userId` (athleteId)
  2. Parse query params from URL: `upcoming` (Int, default 5), `history` (Int, default 10)
  3. Look up athlete record to get `groupId` and `current1600mTime` (baseline for pace calculation)
  4. Query **upcoming workouts**:
     - `Workout` WHERE `date` >= today
     - AND has a `WorkoutGroup` entry where `groupId` = athlete's `groupId`
     - TAKE `upcoming` count
     - ORDER BY `date` ASC (nearest first)
     - Include `workoutGroups` for group info
     - For each workout: call `calculatePersonalizedTargetPaces(athlete.current1600mTime, workout.structureJson, workout.targetPace)`
     - Return: `{ id, name, date, type: workoutType, classification: ptgZone, targetPaces }`
  5. Query **workout history**:
     - `WorkoutResult` WHERE `athleteId` = this athlete
     - AND related `Workout.date` < today
     - Include `workout` (for name, date, type, ptgZone), `splitDetails` (for individual splits)
     - TAKE `history` count
     - ORDER BY workout `date` DESC (most recent first)
     - For each result: include splits with `repNumber`, `time`, target (calculated from pace), and `offPaceAmount` as deviation
     - Return: `{ id, name, date, type, classification, result: { weci, rpe, splits } }`
  6. Return 200 with `{ upcoming: [...], history: [...] }`

  **Error responses:**
  | Status | Code | Message |
  |--------|------|---------|
  | 401 | UNAUTHORIZED | Authentication required. |

- **Spec:** `specs/athlete-workouts-and-stats.md` US-001, US-002
- **Dependencies:** Task 2.3 (pace calculations)
- **Validation:** `pnpm lint && pnpm build`

### Task 4.3: Create athlete stats endpoint
- **Files:** `app/api/mobile/v1/athlete/stats+api.ts` (new)
- **Change:** Implement `GET /api/mobile/v1/athlete/stats` handler:

  **Logic (in order):**
  1. Authenticate via `authenticateRequest(request)` — verify role = `"athlete"`, extract `userId` (athleteId)
  2. Parse query params: `workoutCount` (Int, default 10), `wellnessDays` (Int, default 7)
  3. Query **WECI trend**:
     - `WorkoutResult` WHERE `athleteId` = this athlete AND `weci` IS NOT NULL
     - Include `workout` for `id`, `name`, `date`
     - TAKE `workoutCount`, ORDER BY workout `date` ASC (oldest first, for charting)
     - Return: `[ { workoutId, workoutName, date, weci } ]`
  4. Query **RPE trend**:
     - `WorkoutResult` WHERE `athleteId` = this athlete AND `rpe` IS NOT NULL
     - Include `workout` for `id`, `name`, `date`
     - TAKE `workoutCount`, ORDER BY workout `date` ASC
     - Return: `[ { workoutId, workoutName, date, rpe } ]`
  5. Query **wellness summary**:
     - `WellnessCheck` WHERE `athleteId` = this athlete AND `createdAt` >= (now minus `wellnessDays` days)
     - Calculate averages: `sleepHours`, `sleepQuality`, `hydration`, `energyLevel` (return as `avgEnergy`), `motivation`, `focus`
     - Use Prisma `_avg` aggregate or fetch records and calculate in JS
     - Round all averages to 1 decimal place
     - Count total submissions as `submissionCount`
     - If no data: return all averages as null with `submissionCount: 0`
  6. Query **personal records**:
     - `PersonalRecord` WHERE `athleteId` = this athlete
     - Map event names to response fields: `"1600m"` → `mile`, `"3200m"` → `threeTwo`, `"5K XC"` or `"5000m"` → `fiveK`
     - Each: `{ time, date }` or null if no PR for that event
  7. Query **baseline time**:
     - Look up `Athlete` for `current1600mTime` and `targetEvent`
     - Return: `{ event: targetEvent, time: current1600mTime }`
  8. Return 200 with `{ weciTrend, rpeTrend, wellnessSummary, personalRecords, baselineTime }`

  **Error responses:**
  | Status | Code | Message |
  |--------|------|---------|
  | 401 | UNAUTHORIZED | Authentication required. |

- **Spec:** `specs/athlete-workouts-and-stats.md` US-003, US-004, US-005
- **Dependencies:** None (uses existing schema and models only)
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 5: Final Validation

### Task 5.1: Run full lint and build validation
- **Files:** None (validation only)
- **Change:** Run `pnpm lint` and `pnpm build` across the entire project. Fix any TypeScript errors, ESLint issues, or build failures introduced by the implementation.
- **Spec:** `AGENTS.md` (Build & Validation Commands)
- **Dependencies:** All previous tasks
- **Validation:** Both commands exit 0 with no errors

---

## Summary

### New Files (8)
| File | Phase | Spec |
|------|-------|------|
| `lib/utils/wellness-validation.ts` | 2 | wellness-submission |
| `lib/utils/alert-engine.ts` | 2 | wellness-submission |
| `lib/utils/pace-calculations.ts` | 2 | athlete-workouts-and-stats |
| `app/api/mobile/v1/athlete/wellness+api.ts` | 3 | wellness-submission |
| `app/api/mobile/v1/athlete/rpe+api.ts` | 3 | rpe-submission |
| `app/api/mobile/v1/athlete/pending+api.ts` | 4 | athlete-pending-requests |
| `app/api/mobile/v1/athlete/workouts+api.ts` | 4 | athlete-workouts-and-stats |
| `app/api/mobile/v1/athlete/stats+api.ts` | 4 | athlete-workouts-and-stats |

### Modified Files (1)
| File | Phase | Change |
|------|-------|--------|
| `prisma/schema.prisma` | 1 | Add `sorenessNotes`, `illnessNotes` to WellnessCheck; add `rpeRequestId` + relation to RPESubmission; add inverse relation to RPERequest |

### New Endpoints (5)
| Method | Path | Auth | Spec |
|--------|------|------|------|
| POST | `/api/mobile/v1/athlete/wellness` | JWT (athlete) | wellness-submission |
| POST | `/api/mobile/v1/athlete/rpe` | JWT (athlete) | rpe-submission |
| GET | `/api/mobile/v1/athlete/pending` | JWT (athlete) | athlete-pending-requests |
| GET | `/api/mobile/v1/athlete/workouts` | JWT (athlete) | athlete-workouts-and-stats |
| GET | `/api/mobile/v1/athlete/stats` | JWT (athlete) | athlete-workouts-and-stats |

### Dependency Graph

```
Task 1.1 (schema: WellnessCheck fields) ──┐
Task 1.2 (schema: RPESubmission FK) ──────┤
                                          ├── Task 1.3 (migrate + generate)
                                          │         │
Task 2.1 (wellness validation) ───────────┤         │
Task 2.2 (alert engine) ─────────────────┤         │
                                          ├─────────┴── Task 3.1 (wellness endpoint)
                                          │
                                          ├──────────── Task 3.2 (RPE endpoint)
                                          │
                                          ├──────────── Task 4.1 (pending endpoint)
                                          │
Task 2.3 (pace calculations) ─────────────┴──────────── Task 4.2 (workouts endpoint)

Task 4.3 (stats endpoint) ── no utility dependencies

All tasks ── Task 5.1 (final validation)
```

### Parallelization Opportunities
- Tasks 1.1 + 1.2 can run in parallel (independent schema additions)
- Tasks 2.1 + 2.2 + 2.3 can run in parallel (independent utility files)
- Tasks 3.1 + 3.2 + 4.1 + 4.2 + 4.3 can run in parallel (after their dependencies are met)
- Task 4.3 has no dependencies on schema changes or new utilities
