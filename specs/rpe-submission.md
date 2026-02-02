# RPE Submission

## Job to be Done

**When** an athlete finishes a workout and receives a push notification asking for their RPE,
**they need** to rate their perceived exertion on a 1-10 scale,
**so that** the coach has subjective effort data alongside objective split times for that workout.

## Problem Statement

There is no mobile API endpoint for athletes to submit RPE ratings for specific workouts. The mobile app needs a POST endpoint that accepts an RPE value linked to a specific workout result, validates the input, prevents duplicate submissions, and performs a dual-write to both the RPESubmission table and the WorkoutResult.rpe field.

---

## Specification

### RPE Scale

| Value | Label          |
| ----- | -------------- |
| 1     | Very Light     |
| 2     | Light          |
| 3     | Light-Moderate |
| 4     | Moderate       |
| 5     | Moderate       |
| 6     | Moderate-Hard  |
| 7     | Hard           |
| 8     | Very Hard      |
| 9     | Very Hard      |
| 10    | Maximum Effort |

### Business Rules

1. **Linked to WorkoutResult:** Every RPE submission must reference a specific WorkoutResult (the athlete's participation in a specific workout)
2. **Ownership validation:** The WorkoutResult must belong to the submitting athlete
3. **One per workout:** Each athlete can submit one RPE per WorkoutResult. Second submission returns an error.
4. **Dual write:** RPE value is written to both RPESubmission table AND WorkoutResult.rpe field

---

## Endpoint Specification

### POST /api/mobile/v1/athlete/rpe

**Auth:** Required (JWT, role = "athlete")

**Request Body:**

| Field           | Type   | Required | Validation                                       |
| --------------- | ------ | -------- | ------------------------------------------------ |
| workoutResultId | String | Yes      | Valid UUID, must belong to this athlete          |
| rpe             | Int    | Yes      | 1-10                                             |
| notes           | String | No       | Max 500 characters                               |
| rpeRequestId    | String | No       | Valid RPERequest UUID, belongs to athlete's team |

**Success Response (201):**

| Field         | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| rpeSubmission | Object | The created RPESubmission record |

**Error Responses:**

| Status | Code              | Message                                             |
| ------ | ----------------- | --------------------------------------------------- |
| 400    | VALIDATION_ERROR  | Field-specific validation error                     |
| 400    | INVALID_WORKOUT   | Workout result not found or does not belong to you. |
| 401    | UNAUTHORIZED      | Authentication required.                            |
| 409    | ALREADY_SUBMITTED | You have already submitted RPE for this workout.    |

---

## User Stories

### US-001: Submit RPE for a Workout

**As an** athlete rating my workout effort,
**I want** to submit an RPE value for a specific workout,
**so that** my coach sees how hard the workout felt alongside my split times.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/athlete/rpe creates an RPESubmission record
- [ ] rpe value (1-10) and workoutResultId are saved
- [ ] athleteId and teamId are set from JWT claims
- [ ] Optional notes field is saved when provided
- [ ] Returns 201 with the created RPESubmission
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Dual-Write RPE to WorkoutResult

**As the** system maintaining data consistency,
**I want** the RPE value written to both RPESubmission AND WorkoutResult.rpe,
**so that** the workout view on the web app shows RPE without needing to join tables.

**Acceptance Criteria:**

- [ ] After creating RPESubmission, WorkoutResult.rpe is updated to the same value
- [ ] Both writes happen in the same transaction
- [ ] If either write fails, both are rolled back
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Validate Workout Ownership

**As the** system enforcing athlete data privacy,
**I want** to verify the WorkoutResult belongs to the submitting athlete,
**so that** athletes cannot submit RPE for other athletes' workouts.

**Acceptance Criteria:**

- [ ] WorkoutResult must exist in the database
- [ ] WorkoutResult.athleteId must match the JWT's athlete ID
- [ ] Non-existent workoutResultId returns 400 INVALID_WORKOUT
- [ ] WorkoutResult belonging to different athlete returns 400 INVALID_WORKOUT
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Prevent Duplicate RPE Submissions

**As the** system ensuring data integrity,
**I want** to reject a second RPE submission for the same workout,
**so that** each workout has exactly one RPE rating per athlete.

**Acceptance Criteria:**

- [ ] First RPE for a workoutResultId → 201 success
- [ ] Second RPE for same workoutResultId → 409 ALREADY_SUBMITTED
- [ ] Different workoutResultId from same athlete → 201 success (different workout)
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Happy path:** Valid workoutResultId belonging to athlete, rpe = 7 → 201, RPESubmission created, WorkoutResult.rpe = 7

**Wrong athlete:** workoutResultId belongs to different athlete → 400 INVALID_WORKOUT

**Duplicate:** Submit rpe=7, then rpe=8 for same workoutResultId → first returns 201, second returns 409

**Invalid RPE:** rpe = 0 → 400 VALIDATION_ERROR. rpe = 11 → 400 VALIDATION_ERROR.

---

## Out of Scope

- Mobile app UI for RPE submission (React Native, not this project)
- RPE trend analysis or historical queries (see athlete stats spec)
- Web app RPE display changes
- RPE labels/descriptions in the API response (mobile app handles display)

## Technical Notes

- The RPESubmission model already exists in the schema
- WorkoutResult model already has an rpe field — this dual-write keeps it in sync
- Use a database transaction for the dual-write to ensure consistency
- athleteId must come from JWT, never from request body
