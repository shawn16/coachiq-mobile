# Implementation Plan: CoachIQ Mobile Backend

## Overview

This plan covers all features described in the `specs/` directory for the CoachIQ Mobile Backend API. After a thorough audit of the codebase against every spec:

- **5 of 8 specs are fully implemented** — athlete endpoints, auth, alert engine, and wellness/RPE submissions
- **3 specs have no implementation yet** — push notification service, coach request endpoints, and coach dashboard/alerts
- **1 integration gap** in an implemented endpoint — wellness submission does not send push notifications to the coach on critical alerts

### What's Already Complete

| Spec File | Endpoints/Utilities | Status |
|-----------|-------------------|--------|
| `wellness-submission.md` | `POST /api/mobile/v1/athlete/wellness` | DONE |
| `rpe-submission.md` | `POST /api/mobile/v1/athlete/rpe` | DONE |
| `athlete-pending-requests.md` | `GET /api/mobile/v1/athlete/pending` | DONE |
| `athlete-workouts-and-stats.md` | `GET /api/mobile/v1/athlete/workouts`, `GET /api/mobile/v1/athlete/stats` | DONE |
| `wellness-alert-engine.md` | `lib/utils/alert-engine.ts` (17 rules, correct thresholds/messages) | DONE |

### What Needs to Be Built

| Spec File | Endpoints/Utilities | Status |
|-----------|-------------------|--------|
| `push-notification-service.md` | `lib/utils/push-notifications.ts` | NOT STARTED |
| `coach-request-endpoints.md` | `POST /api/mobile/v1/coach/wellness-request`, `POST /api/mobile/v1/coach/rpe-request` | NOT STARTED |
| `coach-dashboard-and-alerts.md` | `GET /api/mobile/v1/coach/dashboard`, `GET /api/mobile/v1/coach/alerts` | NOT STARTED |
| `push-notification-service.md` (integration) | Critical alert → coach push notification in `wellness+api.ts` | NOT STARTED |

---

## Phase 1: Database & Schema

### Task 1.1: Add composite index on WellnessAlert for coach queries [DONE]
- **Files:** `prisma/schema.prisma`
- **Change:** Add a composite index `@@index([teamId, isResolved, severity])` on the `WellnessAlert` model. The coach alerts endpoint (`GET /api/mobile/v1/coach/alerts`) filters by all three columns simultaneously. Individual indexes already exist but a composite index will be significantly more efficient for the paginated, filtered queries described in the spec.
- **Spec:** `specs/coach-dashboard-and-alerts.md` (Technical Notes: "Consider database indexes on WellnessAlert (teamId, isResolved, severity) for query performance")
- **Dependencies:** None
- **Validation:** `pnpm prisma generate && pnpm prisma migrate dev --name add_wellness_alert_composite_index && pnpm lint && pnpm build`

---

## Phase 2: Push Notification Service

### Task 2.1: Implement push notification utility [DONE]
- **Files:** `lib/utils/push-notifications.ts` (NEW)
- **Change:** Create a push notification service utility that:
  1. **Exports `sendPushNotifications(notifications)` function** — accepts an array of Expo push notification objects and sends them via the Expo Push API (`https://exp.host/--/api/v2/push/send`)
  2. **Batches tokens** in groups of 100 (Expo API limit per request)
  3. **Fire-and-forget pattern** — the function sends batches but does NOT await the Expo API responses within the calling endpoint's request/response cycle. Use `void Promise` pattern so the caller doesn't block.
  4. **Handles DeviceNotRegistered errors** — when Expo returns `DeviceNotRegistered` for a token, set `DeviceToken.isActive = false` in the database so future sends skip it
  5. **Exports helper functions for each notification type:**
     - `sendWellnessRequestNotifications(params)` — resolves target athletes (team/group scoped), queries their active DeviceTokens, builds notification payloads with title "Wellness Check-In", body "Coach {name} is requesting a wellness check-in", and data `{ type: "wellness_request", requestId }`. Returns `notificationsSent` count.
     - `sendRpeRequestNotifications(params)` — same pattern with title "Rate Your Effort", body "How hard was {workoutName}? Submit your RPE.", and data `{ type: "rpe_request", requestId, workoutId }`. Returns `notificationsSent` count.
     - `sendCriticalAlertNotification(params)` — queries DeviceTokens for the coach (userRole = "coach", userId = coachId), sends notification with title "⚠️ Critical Alert", body "{athleteName} needs attention: {alertMessage}", and data `{ type: "critical_alert", alertId }`. Returns `notificationsSent` count.
  6. **Recipient resolution:**
     - Athletes: query `Athlete` where `teamId` matches AND (groupId matches OR request has no groupId), status = "active", then query `DeviceToken` for those athlete IDs where `isActive = true` and `userRole = "athlete"`
     - Coach: query `DeviceToken` where `userId = coachId`, `isActive = true`, `userRole = "coach"`
  7. **Each notification object** includes: `to`, `title`, `body`, `data`, `sound: "default"`, `priority: "high"`
  8. **Use `fetch()`** for HTTP calls to Expo API (no external dependency needed)
  9. **Import `prisma` from `@/lib/db`** for DeviceToken queries and deactivation
- **Spec:** `specs/push-notification-service.md` US-001 through US-004
- **Dependencies:** None (DeviceToken model already exists in schema)
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 3: Coach API Endpoints

### Task 3.1: Create coach wellness request endpoint [DONE]
- **Files:** `app/api/mobile/v1/coach/wellness-request+api.ts` (NEW)
- **Change:** Implement `POST /api/mobile/v1/coach/wellness-request` following the established endpoint pattern:
  1. **Authenticate** via `authenticateRequest(request)` — verify JWT, require `role = "coach"`
  2. **Parse and validate request body:**
     - `teamId` (required, string) — must belong to the authenticated coach
     - `groupId` (optional, string) — if provided, must belong to the specified team
     - `deadline` (required, ISO datetime string) — must be in the future
     - `message` (optional, string) — max 200 characters
  3. **Ownership verification:**
     - Query `Team` where `id = teamId AND coachId = auth.userId` — if not found, return `400 INVALID_TEAM "Team not found or does not belong to you."`
     - If `groupId` provided, query `Group` where `id = groupId AND teamId = teamId` — if not found, return `400 INVALID_GROUP "Group not found or does not belong to this team."`
     - If deadline <= now, return `400 INVALID_DEADLINE "Deadline must be in the future."`
  4. **Create `WellnessRequest` record** with `teamId`, `groupId` (nullable), `coachId` (from JWT), `message`, `deadline`
  5. **Trigger push notifications** — call `sendWellnessRequestNotifications()` from `lib/utils/push-notifications.ts` with the request details and coach name
  6. **Return 201** with `{ request: <created record>, notificationsSent: <count> }`
  7. **Error responses:** Use `errorResponse()` from `lib/utils/errors.ts` for all error cases
  8. **Set `coachId` from JWT** — never trust request body for identity
- **Spec:** `specs/coach-request-endpoints.md` US-001, US-003, US-004
- **Dependencies:** Task 2.1 (push notification service)
- **Validation:** `pnpm lint && pnpm build`

### Task 3.2: Create coach RPE request endpoint [DONE]
- **Files:** `app/api/mobile/v1/coach/rpe-request+api.ts` (NEW)
- **Change:** Implement `POST /api/mobile/v1/coach/rpe-request` following the established endpoint pattern:
  1. **Authenticate** via `authenticateRequest(request)` — verify JWT, require `role = "coach"`
  2. **Parse and validate request body:**
     - `teamId` (required, string) — must belong to the authenticated coach
     - `workoutId` (required, string) — must belong to the specified team
     - `groupId` (optional, string) — if provided, must belong to the specified team
     - `deadline` (required, ISO datetime string) — must be in the future
     - `message` (optional, string) — max 200 characters
  3. **Ownership verification:**
     - Query `Team` where `id = teamId AND coachId = auth.userId` — if not found, return `400 INVALID_TEAM`
     - Query `Workout` where `id = workoutId AND teamId = teamId` — if not found, return `400 INVALID_WORKOUT "Workout not found or does not belong to this team."`
     - If `groupId` provided, query `Group` where `id = groupId AND teamId = teamId` — if not found, return `400 INVALID_GROUP`
     - If deadline <= now, return `400 INVALID_DEADLINE`
  4. **Create `RPERequest` record** with `teamId`, `workoutId`, `groupId` (nullable), `coachId` (from JWT), `message`, `deadline`
  5. **Trigger push notifications** — call `sendRpeRequestNotifications()` from `lib/utils/push-notifications.ts`
  6. **Return 201** with `{ request: <created record>, notificationsSent: <count> }`
- **Spec:** `specs/coach-request-endpoints.md` US-002, US-003, US-004
- **Dependencies:** Task 2.1 (push notification service)
- **Validation:** `pnpm lint && pnpm build`

### Task 3.3: Create coach dashboard endpoint
- **Files:** `app/api/mobile/v1/coach/dashboard+api.ts` (NEW)
- **Change:** Implement `GET /api/mobile/v1/coach/dashboard`:
  1. **Authenticate** — verify JWT, require `role = "coach"`
  2. **Parse query params:**
     - `teamId` (optional, string) — defaults to coach's primary team (first team by createdAt)
  3. **Team ownership check:** Query `Team` where `id = teamId AND coachId = auth.userId`. If not found, return `400 INVALID_TEAM "Team not found or does not belong to you."`. Select `id`, `name`, and count of active athletes.
  4. **Count active athletes:** `Athlete.count({ where: { teamId, status: "active" } })`
  5. **Wellness today:**
     - Count WellnessChecks where `athleteId IN (active athletes of this team)` AND `date = today`
     - Calculate `responseRate = submitted / total` (decimal 0.0-1.0)
  6. **RPE latest:**
     - Find the team's most recent workout by date
     - If no workout exists, return `rpeLatest: null`
     - Count athletes assigned to that workout (via WorkoutGroup → Group → Athletes)
     - Count athletes who have a WorkoutResult with non-null RPE for that workout
     - Calculate `responseRate = submitted / total`
  7. **Alert summary:**
     - Count WellnessAlerts where `teamId = teamId AND isResolved = false`, grouped by severity
     - Return `{ critical, high, medium, low, total }`
  8. **Return 200** with `{ team: { id, name, athleteCount }, wellnessToday, rpeLatest, alertSummary }`
- **Spec:** `specs/coach-dashboard-and-alerts.md` US-001, US-002, US-003, US-005
- **Dependencies:** Task 1.1 (composite index, optional but recommended)
- **Validation:** `pnpm lint && pnpm build`

### Task 3.4: Create coach alerts endpoint
- **Files:** `app/api/mobile/v1/coach/alerts+api.ts` (NEW)
- **Change:** Implement `GET /api/mobile/v1/coach/alerts`:
  1. **Authenticate** — verify JWT, require `role = "coach"`
  2. **Parse query params:**
     - `teamId` (optional, string) — defaults to coach's primary team
     - `severity` (optional, string) — filter by "critical", "high", "medium", "low"
     - `groupId` (optional, string) — filter alerts to athletes in this group
     - `resolved` (optional, boolean) — default `false`; if `true`, include resolved alerts
     - `limit` (optional, int) — default 20, max 100
     - `offset` (optional, int) — default 0
  3. **Team ownership check:** Query `Team` where `id = teamId AND coachId = auth.userId`. If not found, return `400 INVALID_TEAM`.
  4. **Build Prisma where clause:**
     ```
     where: {
       teamId,
       isResolved: resolved === "true" ? undefined : false,
       severity: severity || undefined,
       athlete: groupId ? { groupId } : undefined,
     }
     ```
  5. **Query WellnessAlerts** with:
     - Pagination: `take: limit`, `skip: offset`
     - Sort: severity order (critical > high > medium > low), then `createdAt DESC`. Since severity is a string, use a raw ordering approach or post-sort. Recommended: use Prisma `orderBy: [{ createdAt: 'desc' }]` and define a severity sort via `CASE WHEN` in a `$queryRaw` or sort in-memory for the limited page size. Simplest approach: `orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }]` — alphabetical sort happens to produce `critical < high < low < medium`, which is NOT correct. Instead, add an ordering helper that maps severity to a numeric rank and use `orderBy: { createdAt: 'desc' }` with in-application severity sort, OR use Prisma's `$queryRaw` for the sort. **Recommended approach:** query with `orderBy: { createdAt: 'desc' }`, then sort in-application by severity rank before returning. Given `limit` is bounded (max 100), this is performant.
     - Include `athlete { id, firstName, lastName, group { name } }` for context
     - Include `wellnessCheck { sleepHours, sleepQuality, hydration, energyLevel, motivation, focus, foodTiming, sorenessAreas, illnessSymptoms }` for full check data
  6. **Count total** matching the same where clause for pagination metadata
  7. **Shape response:**
     ```
     {
       alerts: [
         {
           id, ruleId, severity, message,
           details: { ... },
           isResolved,
           createdAt,
           athlete: { id, firstName, lastName, groupName },
           wellnessCheck: { sleepHours, hydration, energy, ... }
         }
       ],
       pagination: { total, limit, offset, hasMore: offset + limit < total }
     }
     ```
- **Spec:** `specs/coach-dashboard-and-alerts.md` US-004, US-005
- **Dependencies:** Task 1.1 (composite index, optional but recommended)
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 4: Integration

### Task 4.1: Wire push notifications into wellness submission for critical alerts
- **Files:** `app/api/mobile/v1/athlete/wellness+api.ts`
- **Change:** After the alert engine runs and WellnessAlert records are created, check if any alerts have `severity = "critical"`. If so, send a push notification to the coach:
  1. **Import** `sendCriticalAlertNotification` from `@/lib/utils/push-notifications`
  2. **After step 9** (alert record creation), check: `const criticalAlerts = alertResults.filter(a => a.severity === "critical")`
  3. **If critical alerts exist:**
     - Look up the athlete's team to find the `coachId`: query `Team` where `id = teamId`, select `coachId`
     - For each critical alert (or the first/most important one), call `sendCriticalAlertNotification({ coachId, athleteName, alertMessage: alert.message, alertId: <created alert ID> })`
     - The push is fire-and-forget — do NOT await it or let it block the 201 response
  4. **To get the alertId** for the notification's data payload, the created WellnessAlert records need to be queried back after `createMany`. Adjust to: after `createMany`, query the created alerts by `wellnessCheckId` to get their IDs. Alternatively, switch from `createMany` to individual `create` calls within a transaction to capture IDs directly. Given that most submissions trigger 0-3 alerts, individual creates in a transaction are acceptable.
  5. **The 201 response shape does not change** — the push notification happens in the background
- **Spec:** `specs/push-notification-service.md` US-002, `specs/wellness-alert-engine.md` (Engine Behavior item 6: "CRITICAL alerts also trigger a push notification to the coach")
- **Dependencies:** Task 2.1 (push notification service)
- **Validation:** `pnpm lint && pnpm build`

---

## Phase 5: Final Validation

### Task 5.1: Run full lint and build validation
- **Files:** None (validation only)
- **Change:** Run `pnpm lint` and `pnpm build` across the entire project. Fix any TypeScript errors, ESLint issues, or build failures introduced by the changes.
- **Spec:** `AGENTS.md` (Build & Validation Commands)
- **Dependencies:** All previous tasks
- **Validation:** Both commands exit 0 with no errors

---

## Summary

### New Files (5)
| File | Phase | Description |
|------|-------|-------------|
| `lib/utils/push-notifications.ts` | 2 | Expo Push API service with batching, fire-and-forget, token deactivation |
| `app/api/mobile/v1/coach/wellness-request+api.ts` | 3 | Coach creates wellness request + triggers push to athletes |
| `app/api/mobile/v1/coach/rpe-request+api.ts` | 3 | Coach creates RPE request + triggers push to athletes |
| `app/api/mobile/v1/coach/dashboard+api.ts` | 3 | Coach team overview: wellness/RPE response rates, alert summary |
| `app/api/mobile/v1/coach/alerts+api.ts` | 3 | Paginated, filterable list of wellness alerts for coach |

### Modified Files (2)
| File | Phase | Change |
|------|-------|--------|
| `prisma/schema.prisma` | 1 | Add composite index on WellnessAlert(teamId, isResolved, severity) |
| `app/api/mobile/v1/athlete/wellness+api.ts` | 4 | Wire critical alert push notification to coach |

### Dependency Graph

```
Task 1.1 (schema index) ─────────────────────────────────────────┐
                                                                  │
Task 2.1 (push service) ──┬── Task 3.1 (wellness-request) ──┐    │
                           ├── Task 3.2 (rpe-request) ───────┤    │
                           └── Task 4.1 (wellness push) ─────┤    │
                                                              │    │
                           ┌── Task 3.3 (dashboard) ──────────┤    │
                           └── Task 3.4 (alerts) ─────────────┤    │
                                                              │    │
                                                              └────┴── Task 5.1 (validation)
```

### Implementation Notes

1. **Follow existing code patterns.** All new endpoints should use the same structure as existing ones: `authenticateRequest()` → role check → body parsing → validation → business logic → `successResponse()`/`errorResponse()`. Refer to `wellness+api.ts` and `rpe+api.ts` as templates.

2. **Coach JWT contains `teamId`** from the `signCoachToken(coachId, teamId)` call. However, coaches may have multiple teams. The dashboard and alerts endpoints accept an optional `teamId` query param to override the JWT default. The request endpoints require `teamId` in the body. All cases must verify the team belongs to the coach.

3. **Push notification fire-and-forget.** Per `AGENTS.md`: "Fire-and-forget (don't block the request/response cycle)." The `sendPushNotifications()` function should NOT be awaited in the endpoint handler. Use `void sendPushNotifications(...)` to fire without blocking.

4. **Severity sort for alerts endpoint.** Alphabetical sort on the `severity` string does NOT produce the correct order (critical > high > medium > low). Options:
   - Sort in-application with a severity rank map: `{ critical: 0, high: 1, medium: 2, low: 3 }`
   - Use `$queryRaw` with a `CASE WHEN` expression
   - Given the bounded page size (max 100 rows), in-application sort is simplest and adequate

5. **No schema changes to existing models.** All required models (WellnessRequest, RPERequest, WellnessAlert, DeviceToken) already exist with correct fields. The only schema change is adding a composite index (additive, non-destructive).

6. **Shared database safety.** The composite index addition is non-destructive — it creates a new index without modifying any existing tables, columns, or data. This is safe per `AGENTS.md` rules.
