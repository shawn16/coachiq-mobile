# Athlete Workouts and Stats

## Job to be Done

**When** an athlete opens the mobile app between practices,
**they want** to see their upcoming workouts with personalized target paces and their performance trends,
**so that** they know what's coming, how to prepare, and how they've been performing.

## Problem Statement

There are no mobile API endpoints for athletes to view their workout schedule, personalized paces, or performance history. Two GET endpoints are needed: one for workout data and one for stats/trends.

---

## Specification

### Workouts Endpoint

Returns two lists:

1. **Upcoming workouts** — future workouts the athlete is assigned to, with personalized target paces
2. **Recent workouts** — past workouts with the athlete's actual results

**Personalized paces:** Each athlete sees target splits calculated from their own baseline time and the workout's pace reference. An athlete with a 4:25 mile sees different targets than an athlete with a 5:30 mile.

**Privacy:** Athletes see only their own results, never other athletes' data.

### Stats Endpoint

Returns performance trends and summary statistics:

- WECI trend (last N workouts)
- RPE trend (last N workouts)
- Wellness summary (averages over last 7 days)
- Personal records (PRs)
- Current baseline time

---

## Endpoint Specifications

### GET /api/mobile/v1/athlete/workouts

**Auth:** Required (JWT, role = "athlete")

**Query Parameters:**

| Param    | Type | Default | Description                           |
| -------- | ---- | ------- | ------------------------------------- |
| upcoming | Int  | 5       | Number of upcoming workouts to return |
| history  | Int  | 10      | Number of past workouts to return     |

**Success Response (200):**

```
{
  upcoming: [
    {
      id, name, date, type, classification,
      targetPaces: [
        { repNumber, distance, paceReference, targetTime }
      ]
    }
  ],
  history: [
    {
      id, name, date, type, classification,
      result: {
        weci, rpe, splits: [ { repNumber, time, target, deviation } ]
      }
    }
  ]
}
```

**Key rules:**

- Upcoming: only workouts where the athlete is assigned AND workout date >= today
- History: only workouts where the athlete has a WorkoutResult AND workout date < today
- Target paces are calculated per-athlete based on their baseline time and the workout structure
- History results include only this athlete's data (no other athletes)

### GET /api/mobile/v1/athlete/stats

**Auth:** Required (JWT, role = "athlete")

**Query Parameters:**

| Param        | Type | Default | Description                                   |
| ------------ | ---- | ------- | --------------------------------------------- |
| workoutCount | Int  | 10      | Number of recent workouts for WECI/RPE trends |
| wellnessDays | Int  | 7       | Number of days for wellness averages          |

**Success Response (200):**

```
{
  weciTrend: [ { workoutId, workoutName, date, weci } ],
  rpeTrend: [ { workoutId, workoutName, date, rpe } ],
  wellnessSummary: {
    avgSleepHours, avgSleepQuality, avgHydration,
    avgEnergy, avgMotivation, avgFocus,
    submissionCount
  },
  personalRecords: {
    mile: { time, date },
    threeTwo: { time, date },
    fiveK: { time, date }
  },
  baselineTime: { event, time }
}
```

---

## User Stories

### US-001: Retrieve Upcoming Workouts with Personalized Paces

**As an** athlete planning for practice,
**I want** to see my upcoming workouts with target splits calculated for my fitness level,
**so that** I know exactly what paces I should be hitting.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/workouts returns upcoming workouts
- [ ] Only workouts this athlete is assigned to are included
- [ ] Only future-dated workouts are included
- [ ] Each workout includes personalized targetPaces based on athlete's baseline
- [ ] Target paces vary by athlete (two athletes see different targets for the same workout)
- [ ] Sorted by date ascending (nearest first)
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Retrieve Workout History with Results

**As an** athlete reviewing my recent performance,
**I want** to see my past workouts with my actual splits, WECI, and RPE,
**so that** I can track how I've been executing.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/workouts returns history with results
- [ ] Only workouts where this athlete has a WorkoutResult are included
- [ ] Each result includes splits, WECI score, and RPE (if submitted)
- [ ] No other athletes' results are visible
- [ ] Sorted by date descending (most recent first)
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Retrieve Performance Trends

**As an** athlete tracking my progress,
**I want** to see my WECI and RPE trends over recent workouts,
**so that** I can see if I'm improving or declining.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/stats returns weciTrend and rpeTrend arrays
- [ ] Each entry includes workoutId, workoutName, date, and value
- [ ] Trends are sorted by date ascending (oldest first, for charting)
- [ ] Only this athlete's data is included
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Retrieve Wellness Summary

**As an** athlete monitoring my overall wellbeing,
**I want** to see average wellness metrics over the last week,
**so that** I can identify trends in my sleep, hydration, and energy.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/stats returns wellnessSummary
- [ ] Averages are calculated over the last N days (default 7)
- [ ] All averages are rounded to 1 decimal place
- [ ] submissionCount shows how many check-ins were included
- [ ] If no wellness data exists, return nulls with submissionCount = 0
- [ ] Typecheck passes
- [ ] Lint passes

### US-005: Retrieve Personal Records and Baseline

**As an** athlete seeing my best performances,
**I want** to see my PRs and current baseline time,
**so that** I know where I stand and what I'm building from.

**Acceptance Criteria:**

- [ ] GET /api/mobile/v1/athlete/stats returns personalRecords
- [ ] Each PR includes time and date achieved
- [ ] If no PR exists for a distance, that field is null
- [ ] baselineTime shows current event and time used for pace calculations
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Upcoming workouts:** Athlete assigned to 3 future workouts → returns 3 workouts with personalized paces

**Empty upcoming:** Athlete not assigned to any future workouts → returns empty upcoming array

**History with results:** Athlete has 5 completed workouts → returns 5 with splits, WECI, RPE

**Stats with no data:** New athlete with no workouts or wellness → returns empty trends, null averages, null PRs

**Privacy:** Athlete A requests workouts → sees only Athlete A's results, never Athlete B's

---

## Out of Scope

- Workout creation or modification (web app only)
- Team-wide workout views (coach endpoints)
- Pace calculation formulas (these already exist in CoachIQ core calculations)
- Mobile app UI for displaying this data

## Technical Notes

- Personalized pace calculation should reuse existing pace utilities from the web app (lib/calculations or similar)
- WECI calculation should reuse existing WECI utilities
- The workouts endpoint is potentially data-heavy — consider pagination for history if performance is an issue
- All data is scoped to the authenticated athlete via JWT — no athleteId parameter needed
