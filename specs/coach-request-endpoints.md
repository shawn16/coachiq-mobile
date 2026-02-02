# Coach Request Endpoints

## Job to be Done

**When** a coach wants wellness check-ins or RPE ratings from their athletes,
**they need** to create a request that triggers push notifications to the targeted athletes,
**so that** athletes are prompted to submit data and the coach can track response rates.

## Problem Statement

There are no mobile API endpoints for coaches to create wellness or RPE requests. Two POST endpoints are needed that create request records, trigger push notifications to targeted athletes, and return the created request.

---

## Specification

### Wellness Request

Coach requests wellness check-ins from their team or a specific group, with a deadline and optional message.

### RPE Request

Coach requests RPE ratings for a specific workout from their team or a specific group, with a deadline and optional message.

### Authorization Rules

- Coach must be authenticated (JWT, role = "coach")
- teamId must belong to the coach (coaches can only request from their own teams)
- groupId (if provided) must belong to the specified team
- workoutId (for RPE) must belong to the specified team

---

## Endpoint Specifications

### POST /api/mobile/v1/coach/wellness-request

**Auth:** Required (JWT, role = "coach")

**Request Body:**

| Field    | Type     | Required | Validation                                   |
| -------- | -------- | -------- | -------------------------------------------- |
| teamId   | String   | Yes      | Must belong to this coach                    |
| groupId  | String   | No       | Must belong to the team (null = entire team) |
| deadline | DateTime | Yes      | Must be in the future                        |
| message  | String   | No       | Max 200 characters                           |

**Success Response (201):**

| Field             | Type   | Description                        |
| ----------------- | ------ | ---------------------------------- |
| request           | Object | The created WellnessRequest record |
| notificationsSent | Int    | Number of push notifications sent  |

**Error Responses:**

| Status | Code             | Message                                          |
| ------ | ---------------- | ------------------------------------------------ |
| 400    | VALIDATION_ERROR | Field-specific validation error                  |
| 400    | INVALID_TEAM     | Team not found or does not belong to you.        |
| 400    | INVALID_GROUP    | Group not found or does not belong to this team. |
| 400    | INVALID_DEADLINE | Deadline must be in the future.                  |
| 401    | UNAUTHORIZED     | Authentication required.                         |

### POST /api/mobile/v1/coach/rpe-request

**Auth:** Required (JWT, role = "coach")

**Request Body:**

| Field     | Type     | Required | Validation                                   |
| --------- | -------- | -------- | -------------------------------------------- |
| teamId    | String   | Yes      | Must belong to this coach                    |
| workoutId | String   | Yes      | Must belong to the team                      |
| groupId   | String   | No       | Must belong to the team (null = entire team) |
| deadline  | DateTime | Yes      | Must be in the future                        |
| message   | String   | No       | Max 200 characters                           |

**Success Response (201):**

| Field             | Type   | Description                       |
| ----------------- | ------ | --------------------------------- |
| request           | Object | The created RPERequest record     |
| notificationsSent | Int    | Number of push notifications sent |

**Error Responses:**

| Status | Code             | Message                                            |
| ------ | ---------------- | -------------------------------------------------- |
| 400    | VALIDATION_ERROR | Field-specific validation error                    |
| 400    | INVALID_TEAM     | Team not found or does not belong to you.          |
| 400    | INVALID_WORKOUT  | Workout not found or does not belong to this team. |
| 400    | INVALID_GROUP    | Group not found or does not belong to this team.   |
| 400    | INVALID_DEADLINE | Deadline must be in the future.                    |
| 401    | UNAUTHORIZED     | Authentication required.                           |

---

## User Stories

### US-001: Create Wellness Request

**As a** coach preparing for practice,
**I want** to request wellness check-ins from my athletes,
**so that** I know how everyone is feeling before we start.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/coach/wellness-request creates a WellnessRequest record
- [ ] coachId is set from JWT claims
- [ ] teamId must belong to the authenticated coach
- [ ] groupId is optional — null means entire team
- [ ] deadline must be in the future
- [ ] message is optional, max 200 chars
- [ ] Returns 201 with created request and notification count
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Create RPE Request

**As a** coach wanting effort feedback after a workout,
**I want** to request RPE ratings from athletes who participated,
**so that** I can see how hard the workout felt alongside objective data.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/coach/rpe-request creates an RPERequest record
- [ ] coachId is set from JWT claims
- [ ] teamId must belong to the authenticated coach
- [ ] workoutId must exist and belong to the specified team
- [ ] groupId is optional — null means entire team
- [ ] deadline must be in the future
- [ ] Returns 201 with created request and notification count
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Trigger Push Notifications on Request Creation

**As a** coach sending a request,
**I want** my athletes to receive push notifications immediately,
**so that** they know to open the app and respond.

**Acceptance Criteria:**

- [ ] After creating a WellnessRequest, push notifications are sent to targeted athletes
- [ ] After creating an RPERequest, push notifications are sent to targeted athletes
- [ ] If groupId is specified, only athletes in that group receive notifications
- [ ] If groupId is null, all team athletes receive notifications
- [ ] notificationsSent in response reflects actual number sent
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Validate Team and Group Ownership

**As the** system enforcing coach authorization,
**I want** to verify that the team, group, and workout belong to the requesting coach,
**so that** coaches cannot send requests to teams they don't own.

**Acceptance Criteria:**

- [ ] teamId not belonging to coach returns 400 INVALID_TEAM
- [ ] groupId not belonging to team returns 400 INVALID_GROUP
- [ ] workoutId not belonging to team returns 400 INVALID_WORKOUT
- [ ] All ownership checks happen before record creation or notifications
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Wellness to full team:** teamId valid, groupId null → WellnessRequest created, all team athletes notified

**Wellness to group:** teamId valid, groupId = Group A → WellnessRequest created, only Group A athletes notified

**RPE request:** teamId valid, workoutId valid → RPERequest created, athletes notified

**Wrong team:** teamId belongs to different coach → 400 INVALID_TEAM, no record created, no notifications sent

**Past deadline:** deadline = yesterday → 400 INVALID_DEADLINE

**Long message:** message = 201 characters → 400 VALIDATION_ERROR

---

## Out of Scope

- Viewing request response rates (coach dashboard spec)
- Editing or canceling requests after creation
- Recurring/scheduled requests
- Mobile app UI for creating requests

## Technical Notes

- These endpoints call the push notification service (from push-notification-service.md spec) after creating the request record
- The notification should include the requestId in the data payload for deep linking
- coachId must come from JWT, never from request body
- The "notificationsSent" count comes from the push service — it may be less than the number of targeted athletes if some don't have registered devices
