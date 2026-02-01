# Wellness Check Model Expansion

## Job to be Done

**When** an athlete submits a daily wellness check-in from their phone,
**they need** to report across 9 wellness categories with granular scales,
**so that** the coach receives detailed wellness data that powers the alert engine and trend analysis.

## Problem Statement

The existing WellnessCheck model uses 1-5 integer scales for a limited set of fields. The mobile app requires 1-10 scales for finer granularity, additional categories (focus, food timing), and structured body-area tracking for soreness and illness instead of single integer values. The current model cannot support the mobile wellness workflow.

---

## Specification

### Current WellnessCheck Fields to Modify

| Field        | Current   | New        | Notes                     |
| ------------ | --------- | ---------- | ------------------------- |
| sleepQuality | Int (1-5) | Int (1-10) | Scale expansion           |
| hydration    | Int (1-5) | Int (1-10) | Scale expansion           |
| energy       | Int (1-5) | Int (1-10) | Scale expansion           |
| motivation   | Int (1-5) | Int (1-10) | Scale expansion           |
| soreness     | Int (1-5) | REMOVE     | Replaced by sorenessAreas |

### New Fields to Add

| Field             | Type     | Constraints                                                   | Description                          |
| ----------------- | -------- | ------------------------------------------------------------- | ------------------------------------ |
| focus             | Int      | 1-10                                                          | Mental focus/concentration level     |
| foodTiming        | String   | Enum: "havent_eaten", "just_ate", "1_2_hours", "3_plus_hours" | Time since last meal before practice |
| sorenessAreas     | String[] | Values from allowed set                                       | Body areas with soreness             |
| illnessSymptoms   | String[] | Values from allowed set                                       | Current illness symptoms             |
| wellnessRequestId | String?  | FK to WellnessRequest, optional                               | Links submission to a coach request  |

### Allowed Soreness Areas

`quads`, `hamstrings`, `calves`, `shins`, `knees`, `ankles`, `feet`, `hips`, `lower_back`, `upper_back`, `shoulders`, `neck`

### Allowed Illness Symptoms

`headache`, `sore_throat`, `congestion`, `cough`, `nausea`, `fever`, `fatigue`, `body_aches`, `dizziness`

### Unchanged Fields

These fields remain as-is: `id`, `athleteId`, `teamId`, `sleepHours` (Float, 4.0-12.0), `notes`, `createdAt`, `updatedAt`

---

## User Stories

### US-001: Expand Scale Fields from 1-5 to 1-10

**As a** developer running the migration,
**I want** sleepQuality, hydration, energy, and motivation to accept 1-10 values,
**so that** athletes can report with finer granularity on the mobile app.

**Acceptance Criteria:**

- [ ] sleepQuality accepts integers 1-10
- [ ] hydration accepts integers 1-10
- [ ] energy accepts integers 1-10
- [ ] motivation accepts integers 1-10
- [ ] Existing records with 1-5 values are preserved (no data loss)
- [ ] Prisma validate passes
- [ ] Prisma migrate dev runs without error

### US-002: Add Focus Field

**As a** developer expanding the wellness model,
**I want** a `focus` integer field (1-10) on WellnessCheck,
**so that** athletes can report their mental focus level.

**Acceptance Criteria:**

- [ ] focus field exists on WellnessCheck model
- [ ] Accepts integers 1-10
- [ ] Defaults to null for existing records
- [ ] Prisma validate passes

### US-003: Add Food Timing Field

**As a** developer expanding the wellness model,
**I want** a `foodTiming` string field on WellnessCheck,
**so that** athletes can report when they last ate relative to practice.

**Acceptance Criteria:**

- [ ] foodTiming field exists on WellnessCheck model
- [ ] Accepts values: "havent_eaten", "just_ate", "1_2_hours", "3_plus_hours"
- [ ] Defaults to null for existing records
- [ ] Prisma validate passes

### US-004: Replace Soreness Integer with Soreness Areas Array

**As a** developer expanding the wellness model,
**I want** to replace the single `soreness` integer with a `sorenessAreas` string array,
**so that** athletes can identify specific body areas that are sore.

**Acceptance Criteria:**

- [ ] sorenessAreas field exists as String[] on WellnessCheck
- [ ] Accepts values only from the allowed soreness areas set
- [ ] Empty array is valid (no soreness)
- [ ] Old soreness integer field is removed
- [ ] Prisma validate passes
- [ ] Prisma migrate dev runs without error

### US-005: Add Illness Symptoms Array

**As a** developer expanding the wellness model,
**I want** an `illnessSymptoms` string array on WellnessCheck,
**so that** athletes can report specific illness symptoms for the alert engine.

**Acceptance Criteria:**

- [ ] illnessSymptoms field exists as String[] on WellnessCheck
- [ ] Accepts values only from the allowed illness symptoms set
- [ ] Empty array is valid (no symptoms)
- [ ] Defaults to empty array for existing records
- [ ] Prisma validate passes

### US-006: Add Wellness Request Foreign Key

**As a** developer linking submissions to requests,
**I want** an optional `wellnessRequestId` FK on WellnessCheck,
**so that** a submission can be traced back to the coach request that prompted it.

**Acceptance Criteria:**

- [ ] wellnessRequestId field exists as optional String on WellnessCheck
- [ ] References WellnessRequest model (created in separate spec)
- [ ] Null is valid (athlete submitted without a request)
- [ ] Prisma validate passes

---

## Test Cases

**Migration safety test:** After migration, query existing WellnessCheck records. All pre-existing data should be intact. New fields should be null or empty array.

**Scale boundary test:** Attempting to save sleepQuality = 0 or sleepQuality = 11 should fail validation. sleepQuality = 1 and sleepQuality = 10 should succeed.

---

## Out of Scope

- API endpoints for submitting wellness data (separate spec)
- Alert engine that processes wellness data (separate spec)
- Mobile UI for wellness form (React Native app, not this project)
- Any changes to the web app's existing wellness views

## Technical Notes

- This migration modifies an existing model with production data — migration must be non-destructive
- The WellnessRequest model referenced by wellnessRequestId is created in the `mobile-data-models.md` spec
- Run this spec BEFORE the mobile-data-models spec to avoid FK reference issues, OR run them together in the same migration
