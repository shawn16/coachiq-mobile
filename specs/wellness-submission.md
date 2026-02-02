# Wellness Check-In Submission

## Job to be Done

**When** an athlete receives a push notification (or opens the app proactively),
**they need** to submit a wellness check-in covering 9 categories,
**so that** their coach gets real-time visibility into how the athlete is feeling before practice.

## Problem Statement

There is no mobile API endpoint for athletes to submit wellness data. The mobile app needs a single POST endpoint that accepts all 9 wellness categories, validates inputs, enforces one-submission-per-day, triggers the alert engine, and optionally links the submission to a coach's request.

---

## Specification

### Wellness Categories

| Field           | Type     | Range/Values                                            | Required             |
| --------------- | -------- | ------------------------------------------------------- | -------------------- |
| sleepHours      | Float    | 4.0 - 12.0, increments of 0.5                           | Yes                  |
| sleepQuality    | Int      | 1 - 10                                                  | Yes                  |
| hydration       | Int      | 1 - 10                                                  | Yes                  |
| energy          | Int      | 1 - 10                                                  | Yes                  |
| motivation      | Int      | 1 - 10                                                  | Yes                  |
| focus           | Int      | 1 - 10                                                  | Yes                  |
| foodTiming      | String   | "havent_eaten", "just_ate", "1_2_hours", "3_plus_hours" | Yes                  |
| sorenessAreas   | String[] | From allowed set (see wellness-check-expansion spec)    | Yes (empty array OK) |
| illnessSymptoms | String[] | From allowed set (see wellness-check-expansion spec)    | Yes (empty array OK) |

### Optional Fields

| Field             | Type   | Constraints                                               |
| ----------------- | ------ | --------------------------------------------------------- |
| notes             | String | Max 1000 characters                                       |
| sorenessNotes     | String | Max 500 characters                                        |
| illnessNotes      | String | Max 500 characters                                        |
| wellnessRequestId | String | Valid WellnessRequest UUID, must belong to athlete's team |

### Business Rules

1. **One per day:** Each athlete may submit one wellness check per calendar day. Second submission on the same day returns an error.
2. **Alert trigger:** After successful submission, the alert engine runs synchronously and any triggered alerts are included in the response.
3. **Request linking:** If wellnessRequestId is provided, the submission is linked to that request. The request must exist and belong to the athlete's team.

---

## Endpoint Specification

### POST /api/mobile/v1/athlete/wellness

**Auth:** Required (JWT, role = "athlete")

**Request Body:**

| Field             | Type     | Required | Validation                            |
| ----------------- | -------- | -------- | ------------------------------------- |
| sleepHours        | Float    | Yes      | 4.0-12.0, 0.5 increments              |
| sleepQuality      | Int      | Yes      | 1-10                                  |
| hydration         | Int      | Yes      | 1-10                                  |
| energy            | Int      | Yes      | 1-10                                  |
| motivation        | Int      | Yes      | 1-10                                  |
| focus             | Int      | Yes      | 1-10                                  |
| foodTiming        | String   | Yes      | One of 4 allowed values               |
| sorenessAreas     | String[] | Yes      | Each value from allowed set           |
| illnessSymptoms   | String[] | Yes      | Each value from allowed set           |
| notes             | String   | No       | Max 1000 chars                        |
| sorenessNotes     | String   | No       | Max 500 chars                         |
| illnessNotes      | String   | No       | Max 500 chars                         |
| wellnessRequestId | String   | No       | Valid UUID, belongs to athlete's team |

**Success Response (201):**

| Field         | Type   | Description                                            |
| ------------- | ------ | ------------------------------------------------------ |
| wellnessCheck | Object | The created WellnessCheck record                       |
| alerts        | Array  | Any alerts triggered by this submission (may be empty) |

Each alert in the array:

| Field    | Type   | Description                         |
| -------- | ------ | ----------------------------------- |
| ruleId   | String | Which rule fired                    |
| severity | String | "critical", "high", "medium", "low" |
| message  | String | Human-readable alert message        |

**Error Responses:**

| Status | Code              | Message                                            |
| ------ | ----------------- | -------------------------------------------------- |
| 400    | VALIDATION_ERROR  | Field-specific validation error                    |
| 401    | UNAUTHORIZED      | Authentication required.                           |
| 409    | ALREADY_SUBMITTED | You have already submitted a wellness check today. |

---

## User Stories

### US-001: Submit Wellness Check-In

**As an** athlete completing my daily check-in,
**I want** to submit all 9 wellness categories in a single request,
**so that** my coach receives my wellness data.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/athlete/wellness creates a WellnessCheck record
- [ ] All 9 required fields are saved correctly
- [ ] athleteId and teamId are set from JWT claims (not from request body)
- [ ] Optional notes fields are saved when provided
- [ ] Returns 201 with the created record
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Enforce One Submission Per Day

**As the** system preventing duplicate submissions,
**I want** to reject a second wellness check on the same calendar day,
**so that** data integrity is maintained and coaches see one report per athlete per day.

**Acceptance Criteria:**

- [ ] First submission today → 201 success
- [ ] Second submission today → 409 ALREADY_SUBMITTED
- [ ] Submission the next calendar day → 201 success (new day resets)
- [ ] "Today" is based on the team's timezone or server time (consistent across checks)
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Validate All Input Fields

**As the** system ensuring data quality,
**I want** to reject submissions with invalid values,
**so that** only clean data enters the database.

**Acceptance Criteria:**

- [ ] sleepHours outside 4.0-12.0 returns 400
- [ ] sleepHours not in 0.5 increments (e.g., 7.3) returns 400
- [ ] Any 1-10 scale value outside range returns 400
- [ ] Invalid foodTiming value returns 400
- [ ] sorenessAreas containing invalid body area returns 400
- [ ] illnessSymptoms containing invalid symptom returns 400
- [ ] notes exceeding 1000 chars returns 400
- [ ] sorenessNotes or illnessNotes exceeding 500 chars returns 400
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Link Submission to Coach Request

**As an** athlete responding to a coach's wellness request,
**I want** my submission linked to that specific request,
**so that** the coach can track response rates and see who has responded.

**Acceptance Criteria:**

- [ ] When wellnessRequestId is provided, it's saved on the WellnessCheck record
- [ ] Invalid wellnessRequestId returns 400
- [ ] wellnessRequestId belonging to a different team returns 400
- [ ] When wellnessRequestId is omitted, submission succeeds without linking
- [ ] Typecheck passes
- [ ] Lint passes

### US-005: Trigger Alert Engine After Submission

**As a** coach monitoring athlete wellness,
**I want** alerts to be generated immediately when concerning wellness data is submitted,
**so that** I'm notified of issues without having to manually review every submission.

**Acceptance Criteria:**

- [ ] After successful wellness creation, alert engine runs against the submission
- [ ] Any triggered alerts are saved as WellnessAlert records
- [ ] Triggered alerts are included in the 201 response
- [ ] If no alerts trigger, empty array is returned
- [ ] Alert engine does NOT run on failed/rejected submissions
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Happy path:** All 9 fields valid, first submission today → 201, WellnessCheck created, alerts array returned

**Duplicate submission:** Submit twice on same day → first returns 201, second returns 409

**Validation failure:** sleepHours = 3.5 (below minimum) → 400 VALIDATION_ERROR

**Alert trigger:** hydration = 2 → 201, alerts array contains critical hydration alert

---

## Out of Scope

- Alert engine rules and logic (separate spec: wellness-alert-engine.md)
- Push notification to coach when critical alert fires (separate spec)
- Mobile app UI for the wellness form (React Native, not this project)
- Wellness trend calculations or historical queries
- Web app changes

## Technical Notes

- The alert engine is called as a function after successful database insert — it's synchronous within the request
- athleteId and teamId must come from the JWT, never from the request body (security: athletes can only submit their own data)
- The "one per day" check should query for existing WellnessCheck where athleteId matches and createdAt is within the current calendar day
