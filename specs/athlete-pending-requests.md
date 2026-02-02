# Athlete Pending Requests

## Job to be Done

**When** an athlete opens the mobile app,
**they need** to see any outstanding requests from their coach (wellness check-ins or RPE ratings),
**so that** they can quickly complete what's been asked of them.

## Problem Statement

There is no mobile API endpoint for athletes to discover pending requests. When a coach sends a wellness or RPE request, the athlete receives a push notification, but if they miss the notification or open the app later, they need a way to see what's pending.

---

## Specification

### What Counts as "Pending"

**Wellness Request is pending if:**

- Request targets the athlete's team (and group, if specified)
- Request deadline has not passed
- Athlete has NOT submitted a WellnessCheck linked to this request

**RPE Request is pending if:**

- Request targets the athlete's team (and group, if specified)
- Request deadline has not passed
- Athlete has NOT submitted an RPE for the specified workout

### Group Filtering Feature

- If request has groupId = null → targets ALL athletes on the team
- If request has groupId = "group-123" → targets only athletes in that group
- Athlete sees request only if they're in the targeted scope

---

## Endpoint Specification

### GET /api/mobile/v1/athlete/pending

**Auth:** Required (JWT, role = "athlete")

**Success Response (200):**

```
{
  wellnessRequests: [
    {
      id, message, deadline, createdAt,
      coachName
    }
  ],
  rpeRequests: [
    {
      id, message, deadline, createdAt,
      coachName,
      workout: { id, name, date, type }
    }
  ]
}
```

**Error Responses:**

| Status | Code         | Message                  |
| ------ | ------------ | ------------------------ |
| 401    | UNAUTHORIZED | Authentication required. |

---

## User Stories

### US-001: Retrieve Pending Wellness Requests

**As an** athlete checking what my coach needs from me,
**I want** to see any wellness check-in requests I haven't completed,
**so that** I can respond before the deadline.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/pending returns wellnessRequests array
- [ ] Only includes requests where deadline > now
- [ ] Only includes requests targeting athlete's team/group
- [ ] Excludes requests the athlete has already responded to (WellnessCheck with matching wellnessRequestId exists)
- [ ] Includes coach name and deadline for each request
- [ ] Sorted by deadline ascending (most urgent first)
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Retrieve Pending RPE Requests

**As an** athlete checking what my coach needs from me,
**I want** to see any RPE rating requests I haven't completed,
**so that** I can submit my effort rating before the deadline.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/pending returns rpeRequests array
- [ ] Only includes requests where deadline > now
- [ ] Only includes requests targeting athlete's team/group
- [ ] Excludes requests where athlete has already submitted RPE for that workout
- [ ] Includes workout details (name, date, type) for context
- [ ] Sorted by deadline ascending (most urgent first)
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Return Empty Arrays When Nothing is Pending

**As an** athlete with no outstanding requests,
**I want** the endpoint to return empty arrays,
**so that** the app can show a "You're all caught up" message.

**Acceptance Criteria:**

- [ ] No pending requests → returns { wellnessRequests: [], rpeRequests: [] }
- [ ] Does not return 404 or error when nothing is pending
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Pending wellness:** Coach sent wellness request yesterday, deadline tomorrow, athlete hasn't responded → appears in wellnessRequests

**Completed wellness:** Coach sent request, athlete already submitted linked WellnessCheck → does NOT appear in results

**Expired request:** Deadline was yesterday → does NOT appear in results

**Group scoping:** Request targets Group A, athlete is in Group B → does NOT appear. Athlete in Group A → appears.

**Team-wide request:** Request has groupId = null → appears for ALL athletes on the team

---

## Out of Scope

- Creating requests (coach endpoint, separate spec)
- Push notifications for new requests (separate spec)
- Marking requests as "seen" or "dismissed"
- Mobile app UI for pending requests view

## Technical Notes

- The "has athlete responded" check requires joining WellnessCheck/RPESubmission tables to see if a matching record exists
- For RPE requests, check if athlete has an RPESubmission linked to the request's workoutId (via WorkoutResult)
- Group membership is determined by the athlete's groupId field
- coachName requires joining to the Coach model through the request's coachId
