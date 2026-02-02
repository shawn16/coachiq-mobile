# Wellness Alert Engine

## Job to be Done

**When** an athlete submits a wellness check-in with concerning values,
**the system needs** to automatically detect and flag potential issues,
**so that** the coach is immediately aware of athletes who may need attention before practice.

## Problem Statement

There is no automated alert system that evaluates wellness submissions against defined concern thresholds. Coaches currently have to manually review every wellness check to spot problems. An alert engine is needed that runs after every wellness submission, evaluates 20+ rules, and creates WellnessAlert records for any triggered concerns.

---

## Specification

### Severity Levels

| Level    | Color  | Meaning                                                            |
| -------- | ------ | ------------------------------------------------------------------ |
| CRITICAL | Red    | Immediate attention required — athlete may not be safe to practice |
| HIGH     | Orange | Significant concern — coach should check in with athlete           |
| MEDIUM   | Yellow | Monitor closely — not urgent but worth noting                      |
| LOW      | Blue   | Informational — awareness item                                     |

### Alert Rules

#### CRITICAL Rules

| Rule ID              | Condition                         | Message Template                                               |
| -------------------- | --------------------------------- | -------------------------------------------------------------- |
| food_critical        | foodTiming = "havent_eaten"       | "{name} hasn't eaten before practice"                          |
| hydration_critical   | hydration <= 3                    | "{name} reports very low hydration ({value}/10)"               |
| energy_critical      | energy <= 3                       | "{name} reports very low energy ({value}/10)"                  |
| sleep_hours_critical | sleepHours <= 4.0                 | "{name} got only {value} hours of sleep"                       |
| illness_critical     | illnessSymptoms.length >= 3       | "{name} reports {count} illness symptoms: {symptoms}"          |
| compound_critical    | energy <= 4 AND sleepHours <= 5.0 | "{name} has low energy AND poor sleep — possible overtraining" |

#### HIGH Rules

| Rule ID            | Condition                                                   | Message Template                                      |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------- |
| soreness_high      | sorenessAreas.length >= 3                                   | "{name} reports soreness in {count} areas: {areas}"   |
| hydration_high     | hydration >= 4 AND hydration <= 5                           | "{name} reports below-average hydration ({value}/10)" |
| sleep_quality_high | sleepQuality <= 4                                           | "{name} reports poor sleep quality ({value}/10)"      |
| illness_high       | illnessSymptoms.length >= 1 AND illnessSymptoms.length <= 2 | "{name} reports illness symptoms: {symptoms}"         |
| sleep_hours_high   | sleepHours <= 5.0 AND sleepHours > 4.0                      | "{name} got only {value} hours of sleep"              |

#### MEDIUM Rules

| Rule ID              | Condition                               | Message Template                                    |
| -------------------- | --------------------------------------- | --------------------------------------------------- |
| motivation_medium    | motivation <= 4                         | "{name} reports low motivation ({value}/10)"        |
| focus_medium         | focus <= 4                              | "{name} reports low focus ({value}/10)"             |
| food_timing_medium   | foodTiming = "just_ate"                 | "{name} just ate before practice"                   |
| sleep_quality_medium | sleepQuality >= 5 AND sleepQuality <= 6 | "{name} reports average sleep quality ({value}/10)" |

#### LOW Rules

| Rule ID          | Condition                                               | Message Template                                   |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------- |
| soreness_low     | sorenessAreas.length >= 1 AND sorenessAreas.length <= 2 | "{name} reports minor soreness: {areas}"           |
| energy_low       | energy >= 4 AND energy <= 5                             | "{name} reports below-average energy ({value}/10)" |
| first_submission | This is the athlete's first-ever wellness check         | "First wellness check-in from {name}"              |

### Engine Behavior

1. Engine runs synchronously after every successful WellnessCheck creation
2. ALL rules are evaluated against the submission (not short-circuited)
3. Multiple alerts can fire from a single submission
4. Each triggered rule creates one WellnessAlert record
5. The alerts array is returned in the wellness submission response
6. CRITICAL alerts also trigger a push notification to the coach (handled in push spec)

### WellnessAlert Record

Each alert saves:

- wellnessCheckId (which submission)
- athleteId (which athlete)
- teamId (for coach queries)
- ruleId (which rule fired)
- severity (critical/high/medium/low)
- message (rendered with athlete name and values)
- details (Json — the actual values that triggered the rule, e.g., `{"hydration": 2, "threshold": 3}`)
- isResolved = false (default)

---

## User Stories

### US-001: Evaluate Critical Alert Rules

**As the** alert engine processing a wellness submission,
**I want** to detect critical-level concerns,
**so that** coaches are immediately notified of athletes who may need intervention.

**Acceptance Criteria:**

- [ ] foodTiming = "havent_eaten" triggers food_critical alert
- [ ] hydration <= 3 triggers hydration_critical alert
- [ ] energy <= 3 triggers energy_critical alert
- [ ] sleepHours <= 4.0 triggers sleep_hours_critical alert
- [ ] 3+ illness symptoms triggers illness_critical alert
- [ ] energy <= 4 AND sleepHours <= 5.0 triggers compound_critical alert
- [ ] Each alert has severity = "critical"
- [ ] Each alert message includes athlete name and actual values
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Evaluate High Alert Rules

**As the** alert engine processing a wellness submission,
**I want** to detect high-level concerns,
**so that** coaches see significant issues that warrant checking in with the athlete.

**Acceptance Criteria:**

- [ ] 3+ soreness areas triggers soreness_high alert
- [ ] hydration 4-5 triggers hydration_high alert
- [ ] sleepQuality <= 4 triggers sleep_quality_high alert
- [ ] 1-2 illness symptoms triggers illness_high alert
- [ ] sleepHours 4.1-5.0 triggers sleep_hours_high alert
- [ ] Each alert has severity = "high"
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Evaluate Medium and Low Alert Rules

**As the** alert engine processing a wellness submission,
**I want** to detect medium and low-level patterns,
**so that** coaches have awareness of trends even when not urgent.

**Acceptance Criteria:**

- [ ] motivation <= 4 triggers motivation_medium alert
- [ ] focus <= 4 triggers focus_medium alert
- [ ] foodTiming = "just_ate" triggers food_timing_medium alert
- [ ] sleepQuality 5-6 triggers sleep_quality_medium alert
- [ ] 1-2 soreness areas triggers soreness_low alert
- [ ] energy 4-5 triggers energy_low alert
- [ ] First-ever submission triggers first_submission alert
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Create WellnessAlert Records

**As the** system persisting alert data,
**I want** each triggered rule to create a WellnessAlert record in the database,
**so that** coaches can review alerts later and track resolution.

**Acceptance Criteria:**

- [ ] Each triggered rule creates exactly one WellnessAlert record
- [ ] Record includes correct wellnessCheckId, athleteId, teamId
- [ ] ruleId matches the rule that fired
- [ ] severity matches the rule's severity level
- [ ] message is rendered with athlete name and actual values (not template placeholders)
- [ ] details Json includes the actual metric values and thresholds
- [ ] isResolved defaults to false
- [ ] Typecheck passes
- [ ] Lint passes

### US-005: Handle Multiple Alerts Per Submission

**As the** alert engine processing a submission with multiple concerns,
**I want** all applicable rules to fire independently,
**so that** no concerns are missed when an athlete has multiple issues.

**Acceptance Criteria:**

- [ ] Submission with hydration=2 AND sleepHours=3.5 AND foodTiming="havent_eaten" → creates 3 separate CRITICAL alerts
- [ ] Rules are not short-circuited (all evaluated regardless of earlier matches)
- [ ] Alert count in response matches number of WellnessAlert records created
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Single critical:** hydration=2, all other values normal → 1 alert: hydration_critical

**Multiple critical:** hydration=2, energy=2, foodTiming="havent_eaten" → 3 alerts, all severity=critical

**Compound rule:** energy=4, sleepHours=5.0 → compound_critical fires. energy=4, sleepHours=6.0 → compound_critical does NOT fire.

**No alerts:** All values in healthy range → 0 alerts returned

**Mixed severity:** hydration=5 (high), motivation=3 (medium), sorenessAreas=["quads"] (low) → 3 alerts at different severity levels

**First submission:** New athlete's first wellness check → first_submission (low) fires regardless of values

**Details Json:** hydration_critical alert details should contain `{"hydration": 2, "threshold": 3}` (or similar structure with actual values)

---

## Out of Scope

- Push notification delivery for critical alerts (separate spec)
- Coach UI for viewing/resolving alerts (coach endpoints spec)
- Historical alert trending or analytics
- Custom alert thresholds per team (all teams use same rules)
- Alert escalation or auto-resolution logic

## Technical Notes

- The alert engine should be implemented as a pure function that takes a WellnessCheck record and returns an array of alert objects
- This function is called from the wellness submission endpoint (wellness-submission.md spec)
- The function should also receive the athlete's name (for message rendering) and a count of prior submissions (for first_submission rule)
- Keep alert rules in a declarative data structure so new rules can be added easily
- The compound_critical rule requires checking multiple fields — evaluate it separately from single-field rules
