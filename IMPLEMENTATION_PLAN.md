# Implementation Plan: CoachIQ Mobile Backend

## Overview

This plan implements two spec files:
1. **`specs/mobile-data-models.md`** — Four new database models (WellnessRequest, RPERequest, DeviceToken, WellnessAlert)
2. **`specs/wellness-check-expansion.md`** — Expand the existing WellnessCheck model (new fields, scale changes, soreness replacement)

Both specs are schema-only changes. API endpoints, alert engine, push notifications, and mobile UI are explicitly out of scope.

### Key Constraints
- **Shared database** with CoachIQ web app — all changes must be non-destructive
- **New fields must be nullable or have defaults** to avoid breaking existing records
- **Never drop/rename existing columns** except when the spec explicitly requires it (soreness removal) and only after the replacement field exists
- **Follow existing naming conventions**: camelCase Prisma fields, snake_case DB columns via `@map()`, plural snake_case table names via `@@map()`
- **Migration ordering**: WellnessRequest model must exist before WellnessCheck can FK to it

### Dependency Graph

```
Task 1.1 (install prisma)
    └── Task 2.1 (WellnessRequest model)
        ├── Task 2.2 (RPERequest model) [independent, but same phase]
        ├── Task 2.3 (DeviceToken model) [independent, but same phase]
        ├── Task 2.4 (WellnessAlert model) [depends on WellnessCheck relations from 3.x]
        └── Task 3.1 (WellnessCheck new fields)
            └── Task 3.2 (WellnessCheck FK to WellnessRequest)
                └── Task 3.3 (Update existing model relations)
                    └── Task 4.1 (Generate + Migrate)
                        └── Task 4.2 (Validate first migration)
                            └── Task 5.1 (Remove soreness field)
                                └── Task 5.2 (Second migration)
                                    └── Task 6.1 (Final validation)
```

---

## Phase 1: Project Setup

### Task 1.1: Install Prisma Dependencies [DONE]
- **Files:** `package.json`
- **Change:** Install `prisma` (devDependency) and `@prisma/client` (dependency). Neither is currently present in package.json. Run `pnpm add @prisma/client` and `pnpm add -D prisma`. Then run `pnpm prisma generate` to verify the existing schema compiles.
- **Spec:** Prerequisite for both specs
- **Dependencies:** None
- **Validation:** `pnpm prisma validate` exits 0

---

## Phase 2: New Data Models (mobile-data-models.md)

### Task 2.1: Add WellnessRequest Model [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the `WellnessRequest` model with the following fields and conventions:
  ```
  model WellnessRequest {
      id        String   @id @default(uuid())
      teamId    String   @map("team_id")
      groupId   String?  @map("group_id")
      coachId   String   @map("coach_id")
      message   String?  @db.VarChar(200)
      deadline  DateTime
      createdAt DateTime @default(now()) @map("created_at")

      // Relations
      team            Team             @relation(fields: [teamId], references: [id], onDelete: Cascade)
      group           Group?           @relation(fields: [groupId], references: [id], onDelete: SetNull)
      coach           Coach            @relation(fields: [coachId], references: [id], onDelete: Cascade)
      wellnessChecks  WellnessCheck[]

      @@index([teamId])
      @@index([coachId])
      @@map("wellness_requests")
  }
  ```
- **Spec:** `mobile-data-models.md` US-001
- **Dependencies:** Task 1.1
- **Validation:** `pnpm prisma validate` exits 0 (will fail until reverse relations are added in Task 3.3)

### Task 2.2: Add RPERequest Model [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the `RPERequest` model:
  ```
  model RPERequest {
      id        String   @id @default(uuid())
      teamId    String   @map("team_id")
      groupId   String?  @map("group_id")
      workoutId String   @map("workout_id")
      coachId   String   @map("coach_id")
      message   String?  @db.VarChar(200)
      deadline  DateTime
      createdAt DateTime @default(now()) @map("created_at")

      // Relations
      team    Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)
      group   Group?  @relation(fields: [groupId], references: [id], onDelete: SetNull)
      workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
      coach   Coach   @relation(fields: [coachId], references: [id], onDelete: Cascade)

      @@index([teamId])
      @@index([workoutId])
      @@index([coachId])
      @@map("rpe_requests")
  }
  ```
- **Spec:** `mobile-data-models.md` US-002
- **Dependencies:** Task 1.1
- **Validation:** `pnpm prisma validate` (after Task 3.3 adds reverse relations)

### Task 2.3: Add DeviceToken Model [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the `DeviceToken` model. Note: `userId` is a plain String (not a FK) because it can reference either an Athlete or Coach.
  ```
  model DeviceToken {
      id        String   @id @default(uuid())
      userId    String   @map("user_id")
      userRole  String   @map("user_role")    // "athlete" or "coach"
      token     String   @unique
      isActive  Boolean  @default(true) @map("is_active")
      createdAt DateTime @default(now()) @map("created_at")
      updatedAt DateTime @updatedAt @map("updated_at")

      @@unique([userId, token])
      @@index([userId])
      @@index([isActive])
      @@map("device_tokens")
  }
  ```
- **Spec:** `mobile-data-models.md` US-003
- **Dependencies:** Task 1.1
- **Validation:** `pnpm prisma validate` exits 0

### Task 2.4: Add WellnessAlert Model [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the `WellnessAlert` model:
  ```
  model WellnessAlert {
      id              String   @id @default(uuid())
      wellnessCheckId String   @map("wellness_check_id")
      athleteId       String   @map("athlete_id")
      teamId          String   @map("team_id")
      ruleId          String   @map("rule_id")
      severity        String                                // "critical", "high", "medium", "low"
      message         String
      details         Json
      isResolved      Boolean  @default(false) @map("is_resolved")
      createdAt       DateTime @default(now()) @map("created_at")

      // Relations
      wellnessCheck WellnessCheck @relation(fields: [wellnessCheckId], references: [id], onDelete: Cascade)
      athlete       Athlete       @relation(fields: [athleteId], references: [id], onDelete: Cascade)
      team          Team          @relation(fields: [teamId], references: [id], onDelete: Cascade)

      @@index([wellnessCheckId])
      @@index([athleteId])
      @@index([teamId])
      @@index([severity])
      @@index([isResolved])
      @@map("wellness_alerts")
  }
  ```
- **Spec:** `mobile-data-models.md` US-004
- **Dependencies:** Task 1.1
- **Validation:** `pnpm prisma validate` (after Task 3.3 adds reverse relations)

---

## Phase 3: WellnessCheck Expansion (wellness-check-expansion.md)

### Task 3.1: Add New Fields to WellnessCheck Model [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the following new fields to the existing `WellnessCheck` model. All new fields are nullable or default to empty array to preserve existing records:
  ```
  focus           Int?                                     @map("focus")             // 1-10
  foodTiming      String?              @map("food_timing")  // "havent_eaten", "just_ate", "1_2_hours", "3_plus_hours"
  sorenessAreas   String[]             @default([]) @map("soreness_areas")  // Body areas from allowed set
  illnessSymptoms String[]             @default([]) @map("illness_symptoms") // Symptoms from allowed set
  ```
  Also update the existing field comments to reflect the new 1-10 scale:
  - `sleepQuality` comment: `// 1-10` (was `// 1-5`)
  - `energyLevel` comment: `// 1-10` (was `// 1-5`)
  - `motivation` comment: `// 1-10` (was `// 1-5`)
  - `hydration` comment: `// 1-10` (was `// 1-5`)

  Note: The actual database column type for scale fields remains `Int?` — the scale expansion is a logical change, not a type change. Validation of the 1-10 range will be enforced at the application/API layer.
- **Spec:** `wellness-check-expansion.md` US-001, US-002, US-003, US-004, US-005
- **Dependencies:** Task 1.1
- **Validation:** `pnpm prisma validate` exits 0

### Task 3.2: Add WellnessRequest FK to WellnessCheck [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the optional FK field and relation to WellnessCheck:
  ```
  wellnessRequestId String?          @map("wellness_request_id")
  wellnessRequest   WellnessRequest? @relation(fields: [wellnessRequestId], references: [id], onDelete: SetNull)
  ```
  This links a wellness submission to the coach request that prompted it (null if the athlete submitted independently).
- **Spec:** `wellness-check-expansion.md` US-006
- **Dependencies:** Task 2.1 (WellnessRequest model must exist in schema)
- **Validation:** `pnpm prisma validate` exits 0

### Task 3.3: Add Reverse Relations to Existing Models [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add the relation arrays to existing models so Prisma can validate bidirectional relations. These are schema-only additions (no new DB columns):

  **Coach model — add:**
  ```
  wellnessRequests WellnessRequest[]
  rpeRequests      RPERequest[]
  ```

  **Team model — add:**
  ```
  wellnessRequests WellnessRequest[]
  rpeRequests      RPERequest[]
  wellnessAlerts   WellnessAlert[]
  ```

  **Group model — add:**
  ```
  wellnessRequests WellnessRequest[]
  rpeRequests      RPERequest[]
  ```

  **Workout model — add:**
  ```
  rpeRequests RPERequest[]
  ```

  **Athlete model — add:**
  ```
  wellnessAlerts WellnessAlert[]
  ```

  **WellnessCheck model — add:**
  ```
  wellnessAlerts WellnessAlert[]
  ```
- **Spec:** `mobile-data-models.md` (required for FK relation integrity across all four new models)
- **Dependencies:** Tasks 2.1, 2.2, 2.3, 2.4, 3.1, 3.2
- **Validation:** `pnpm prisma validate` exits 0 — this is the first point at which the full schema will validate, since all bidirectional relations are now complete

---

## Phase 4: First Migration

### Task 4.1: Generate Prisma Client and Run Migration [DONE]
- **Files:** `prisma/migrations/` (new migration directory will be auto-created)
- **Change:** Run the following commands:
  1. `pnpm prisma generate` — regenerate the Prisma client with all new models and fields
  2. `pnpm prisma migrate dev --name add-mobile-models-and-expand-wellness` — create and apply the migration

  This single migration captures all Phase 2 and Phase 3 changes:
  - Four new tables: `wellness_requests`, `rpe_requests`, `device_tokens`, `wellness_alerts`
  - New columns on `wellness_checks`: `focus`, `food_timing`, `soreness_areas`, `illness_symptoms`, `wellness_request_id`
  - New indexes on all new tables

  Existing data is preserved because:
  - All new columns are nullable or have `DEFAULT` values
  - No existing columns are modified or removed
  - No existing tables are altered destructively
- **Spec:** Both specs (migration applies all changes)
- **Dependencies:** Tasks 2.1–2.4, 3.1–3.3
- **Validation:** Migration runs without error; `pnpm prisma validate` exits 0; existing `wellness_checks` records retain their data

### Task 4.2: Verify Migration Success [DONE]
- **Files:** None (read-only verification)
- **Change:** Verify the migration was applied correctly:
  1. Check that `prisma/migrations/` contains the new migration directory
  2. Run `pnpm prisma validate` to confirm schema is valid
  3. Run `pnpm prisma generate` to confirm client generation works
- **Spec:** Both specs (validation step)
- **Dependencies:** Task 4.1
- **Validation:** All three commands exit 0

---

## Phase 5: Remove Deprecated Soreness Field

Per AGENTS.md: *"If a spec says to REMOVE a field, create a new migration that drops it AFTER the replacement field exists."* The `sorenessAreas` String[] field now exists (from Phase 3), so `soreness` can be safely removed.

### Task 5.1: Remove soreness Field from WellnessCheck [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Remove the line `soreness Int? // 1-5` from the WellnessCheck model. This is the ONLY column removal in the entire plan, and it is explicitly required by `wellness-check-expansion.md` US-004.
- **Spec:** `wellness-check-expansion.md` US-004
- **Dependencies:** Task 4.2 (sorenessAreas must exist in DB first)
- **Validation:** `pnpm prisma validate` exits 0

### Task 5.2: Generate Client and Run Soreness Removal Migration [DONE]
- **Files:** `prisma/migrations/` (new migration directory)
- **Change:** Run:
  1. `pnpm prisma generate`
  2. `pnpm prisma migrate dev --name remove-soreness-field`

  This migration drops the `soreness` column from `wellness_checks`. Existing values in that column will be lost, which is acceptable per the spec (replaced by `soreness_areas`).
- **Spec:** `wellness-check-expansion.md` US-004
- **Dependencies:** Task 5.1
- **Validation:** Migration runs without error; `pnpm prisma validate` exits 0

---

## Phase 6: Final Validation

### Task 6.1: Run Lint
- **Files:** None (read-only)
- **Change:** Run `pnpm lint` to verify no TypeScript or ESLint errors were introduced.
- **Spec:** AGENTS.md validation requirement
- **Dependencies:** Task 5.2
- **Validation:** `pnpm lint` exits 0

### Task 6.2: Run Build
- **Files:** None (read-only)
- **Change:** Run `pnpm build` to verify the production build succeeds. Note: if no `build` script exists in package.json, this step passes trivially and can be skipped.
- **Spec:** AGENTS.md validation requirement
- **Dependencies:** Task 6.1
- **Validation:** `pnpm build` exits 0 (or is not applicable)

---

## Summary of File Changes

| File | Change Type | Phase |
|------|------------|-------|
| `package.json` | Modify (add prisma dependencies) | 1 |
| `prisma/schema.prisma` | Modify (add 4 models, expand WellnessCheck, add relations, remove soreness) | 2, 3, 5 |
| `prisma/migrations/*` | Create (two new migration directories) | 4, 5 |

## Models Created
1. **WellnessRequest** — Coach request for athlete wellness check-ins
2. **RPERequest** — Coach request for athlete RPE submissions
3. **DeviceToken** — Expo push notification token storage
4. **WellnessAlert** — Alert engine output records

## Models Modified
1. **WellnessCheck** — New fields (focus, foodTiming, sorenessAreas, illnessSymptoms, wellnessRequestId), removed field (soreness), updated scale comments (1-5 → 1-10)
2. **Coach** — Added reverse relations (wellnessRequests, rpeRequests)
3. **Team** — Added reverse relations (wellnessRequests, rpeRequests, wellnessAlerts)
4. **Group** — Added reverse relations (wellnessRequests, rpeRequests)
5. **Workout** — Added reverse relation (rpeRequests)
6. **Athlete** — Added reverse relation (wellnessAlerts)
