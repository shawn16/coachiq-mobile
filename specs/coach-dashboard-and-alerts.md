# Coach Dashboard and Alerts

## Job to be Done

**When** a coach opens the mobile app,
**they want** a quick overview of their team's wellness status and any alerts requiring attention,
**so that** they can make informed decisions about practice without opening the full web app.

## Problem Statement

There are no mobile API endpoints for coaches to view team overview data or review wellness alerts. Two GET endpoints are needed: a dashboard summary and an alerts list with filtering.

---

## Specification

### Dashboard Overview

The dashboard provides a snapshot of today's team status:

- How many athletes have submitted wellness today vs. total
- How many athletes have submitted RPE for the most recent workout
- Count of unresolved alerts by severity
- Quick summary of concerning values

### Alerts List

Paginated, filterable list of WellnessAlert records for the coach's team.

---

## Endpoint Specifications

### GET /api/mobile/v1/coach/dashboard

**Auth:** Required (JWT, role = "coach")

**Query Parameters:**

| Param  | Type   | Default              | Description        |
| ------ | ------ | -------------------- | ------------------ |
| teamId | String | Coach's primary team | Which team to view |

**Success Response (200):**

```
{
  team: { id, name, athleteCount },
  wellnessToday: {
    submitted: 12,
    total: 18,
    responseRate: 0.67
  },
  rpeLatest: {
    workoutName: "6x400 @3200",
    workoutDate: "2026-01-31",
    submitted: 15,
    total: 18,
    responseRate: 0.83
  },
  alertSummary: {
    critical: 1,
    high: 3,
    medium: 5,
    low: 2,
    total: 11
  }
}
```

**Key rules:**

- wellnessToday counts submissions for the current calendar day
- rpeLatest shows response rates for the team's most recent workout
- alertSummary counts only unresolved alerts (isResolved = false)
- Coach can only view teams they own

### GET /api/mobile/v1/coach/alerts

**Auth:** Required (JWT, role = "coach")

**Query Parameters:**

| Param    | Type    | Default              | Description                                   |
| -------- | ------- | -------------------- | --------------------------------------------- |
| teamId   | String  | Coach's primary team | Which team                                    |
| severity | String  | null                 | Filter by severity (critical/high/medium/low) |
| groupId  | String  | null                 | Filter by athlete group                       |
| resolved | Boolean | false                | Include resolved alerts                       |
| limit    | Int     | 20                   | Results per page                              |
| offset   | Int     | 0                    | Pagination offset                             |

**Success Response (200):**

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
  pagination: {
    total, limit, offset, hasMore
  }
}
```

**Key rules:**

- Default: only unresolved alerts (resolved=false)
- Sorted by severity (critical first) then by createdAt descending
- Each alert includes the athlete's name and group for context
- Each alert includes the full wellness check data so the coach can see all values
- Coach can only see alerts for their own teams

**Error Responses (both endpoints):**

| Status | Code         | Message                                   |
| ------ | ------------ | ----------------------------------------- |
| 400    | INVALID_TEAM | Team not found or does not belong to you. |
| 401    | UNAUTHORIZED | Authentication required.                  |

---

## User Stories

### US-001: View Team Dashboard Summary

**As a** coach checking in on my team,
**I want** to see today's wellness response rate and alert counts at a glance,
**so that** I know the team's status before practice.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/coach/dashboard returns team, wellnessToday, rpeLatest, alertSummary
- [ ] wellnessToday.submitted counts WellnessChecks created today for this team
- [ ] wellnessToday.total counts active athletes on this team
- [ ] responseRate = submitted / total (decimal, 0.0 to 1.0)
- [ ] Coach can only view their own teams
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: View RPE Response Rate for Latest Workout

**As a** coach checking if athletes rated their last workout,
**I want** to see the RPE response rate for the most recent workout,
**so that** I know who still needs to submit.

**Acceptance Criteria:**

- [ ] rpeLatest shows the team's most recent workout (by date)
- [ ] submitted counts athletes who have an RPE value for that workout
- [ ] total counts athletes assigned to that workout
- [ ] If no recent workout exists, rpeLatest is null
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: View Alert Summary Counts

**As a** coach scanning for issues,
**I want** to see how many unresolved alerts exist at each severity level,
**so that** I know if anything needs immediate attention.

**Acceptance Criteria:**

- [ ] alertSummary counts only where isResolved = false
- [ ] Counts are broken out by severity: critical, high, medium, low
- [ ] total equals sum of all severity counts
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: List Alerts with Filtering

**As a** coach reviewing specific concerns,
**I want** to filter alerts by severity and group,
**so that** I can focus on the most urgent issues or a specific group of athletes.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/coach/alerts returns paginated alert list
- [ ] Default: only unresolved alerts, sorted by severity then recency
- [ ] severity filter returns only alerts of that level
- [ ] groupId filter returns only alerts for athletes in that group
- [ ] resolved=true includes resolved alerts
- [ ] Each alert includes athlete name, group, and full wellness check data
- [ ] Pagination works (limit, offset, hasMore)
- [ ] Typecheck passes
- [ ] Lint passes

### US-005: Prevent Cross-Team Data Access

**As the** system enforcing data isolation,
**I want** to verify that coaches can only access their own team's data,
**so that** no coach sees another team's dashboard or alerts.

**Acceptance Criteria:**

- [ ] teamId not belonging to coach returns 400 INVALID_TEAM
- [ ] No alerts from other teams appear in results
- [ ] No athletes from other teams appear in dashboard counts
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Dashboard happy path:** Team of 20 athletes, 15 submitted wellness today, 3 unresolved critical alerts → returns correct counts

**Dashboard empty:** No submissions today, no alerts → wellnessToday.submitted=0, alertSummary all zeros

**Alerts filtered by severity:** 10 alerts (2 critical, 3 high, 5 medium), filter severity=critical → returns 2 alerts

**Alerts filtered by group:** Group A has 3 alerts, Group B has 5 → filter groupId=GroupA → returns 3 alerts

**Alerts pagination:** 25 total alerts, limit=10, offset=0 → returns 10 alerts, hasMore=true

**Cross-team:** Coach A requests Coach B's team → 400 INVALID_TEAM

---

## Out of Scope

- Resolving/acknowledging alerts (could be a future PATCH endpoint)
- Alert detail view beyond what's in the list response
- Web app changes
- Historical dashboard snapshots or trends
- Mobile app UI for dashboard and alerts

## Technical Notes

- Coach's teamId comes from JWT for the default, but query param allows coaches with multiple teams to switch
- Alert severity sort order: critical (1) > high (2) > medium (3) > low (4), then by createdAt DESC within each level
- The wellness check data included with each alert avoids a second API call from the mobile app
- Consider database indexes on WellnessAlert (teamId, isResolved, severity) for query performance
- The "active athletes" count for response rates should exclude athletes with status = "inactive" or similar
