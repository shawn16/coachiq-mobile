# Push Notification Service

## Job to be Done

**When** a coach creates a request or a critical alert fires,
**the system needs** to deliver push notifications to the right athletes or coaches,
**so that** users receive timely, actionable notifications on their mobile devices.

## Problem Statement

There is no push notification delivery mechanism. The system needs a service that queries DeviceToken records, sends notifications via the Expo Push API, handles delivery failures, and supports deep linking so tapping a notification opens the correct screen in the mobile app.

---

## Specification

### Expo Push API

- Endpoint: `https://exp.host/--/api/v2/push/send`
- Batch limit: 100 tokens per request
- Format: JSON array of notification objects

### Notification Types

| Type             | Trigger                        | Recipients                    | Title               | Body Example                                     |
| ---------------- | ------------------------------ | ----------------------------- | ------------------- | ------------------------------------------------ |
| wellness_request | Coach creates WellnessRequest  | Athletes on target team/group | "Wellness Check-In" | "Coach {name} is requesting a wellness check-in" |
| rpe_request      | Coach creates RPERequest       | Athletes on target team/group | "Rate Your Effort"  | "How hard was {workoutName}? Submit your RPE."   |
| critical_alert   | Critical WellnessAlert created | Coach of the athlete's team   | "⚠️ Critical Alert" | "{athleteName} needs attention: {alertMessage}"  |

### Notification Payload Structure

Each notification sent to Expo includes:

```
{
  to: "ExponentPushToken[xxx]",
  title: "Wellness Check-In",
  body: "Coach Smith is requesting a wellness check-in",
  data: {
    type: "wellness_request" | "rpe_request" | "critical_alert",
    requestId: "uuid" (for requests),
    alertId: "uuid" (for alerts),
    workoutId: "uuid" (for RPE requests)
  },
  sound: "default",
  priority: "high"
}
```

### Deep Linking

The `data.type` field tells the mobile app which screen to navigate to when the notification is tapped. The mobile app handles the routing — the backend just includes the type and relevant IDs.

### Token Management

- **On send failure (DeviceNotRegistered):** Set DeviceToken.isActive = false
- **On send:** Only query DeviceToken where isActive = true
- **Batch processing:** When sending to multiple recipients, chunk into batches of 100

### Recipient Resolution

| Notification Type                 | Who Gets It                     |
| --------------------------------- | ------------------------------- |
| wellness_request (groupId = null) | All athletes on the team        |
| wellness_request (groupId = X)    | Athletes in that specific group |
| rpe_request (groupId = null)      | All athletes on the team        |
| rpe_request (groupId = X)         | Athletes in that specific group |
| critical_alert                    | The coach of the athlete's team |

---

## User Stories

### US-001: Send Push Notifications to Athletes

**As the** system notifying athletes of a coach request,
**I want** to send Expo push notifications to all targeted athletes' devices,
**so that** athletes know they need to submit wellness data or RPE.

**Acceptance Criteria:**

- [ ] Queries DeviceToken for all targeted athletes (team/group scoped)
- [ ] Only sends to tokens where isActive = true
- [ ] Sends correct title and body based on notification type
- [ ] Includes data payload with type, requestId, and/or workoutId
- [ ] Batches into groups of 100 when sending to large teams
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Send Critical Alert Notification to Coach

**As the** system escalating critical wellness concerns,
**I want** to send a push notification to the coach when a critical alert fires,
**so that** the coach is immediately aware of the issue.

**Acceptance Criteria:**

- [ ] When a WellnessAlert with severity = "critical" is created, coach is notified
- [ ] Queries DeviceToken for the coach (userRole = "coach", userId = coachId)
- [ ] Notification title includes warning indicator
- [ ] Notification body includes athlete name and alert message
- [ ] data payload includes type = "critical_alert" and alertId
- [ ] Only CRITICAL alerts trigger coach push (not high/medium/low)
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Handle Failed Delivery (DeviceNotRegistered)

**As the** system maintaining clean device token records,
**I want** to deactivate tokens when Expo reports them as invalid,
**so that** future sends don't waste resources on dead tokens.

**Acceptance Criteria:**

- [ ] When Expo returns DeviceNotRegistered error for a token, set isActive = false
- [ ] Deactivated tokens are not included in future sends
- [ ] Other valid tokens in the same batch are not affected
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Batch Large Recipient Lists

**As the** system sending to teams with many athletes,
**I want** to chunk notifications into batches of 100,
**so that** the Expo API rate limits are respected.

**Acceptance Criteria:**

- [ ] 150 tokens are split into 2 batches (100 + 50)
- [ ] All batches are sent (no tokens dropped)
- [ ] Batch failures don't prevent subsequent batches from sending
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Wellness request to team:** Coach creates request for team of 25 athletes → 25 notifications sent (or fewer if some have no device token or inactive tokens)

**Wellness request to group:** Coach creates request for Group A (8 athletes) → only 8 notifications sent

**Critical alert:** Athlete submits hydration=2, alert engine fires critical → coach receives push with athlete name

**Dead token:** Expo returns DeviceNotRegistered for token X → DeviceToken.isActive set to false, next send skips token X

**No tokens:** Athlete has no registered device → notification is skipped (no error, no retry)

**Large batch:** Team of 250 athletes → 3 batches (100 + 100 + 50)

---

## Out of Scope

- Mobile app notification handling and deep link routing (React Native, not this project)
- Notification preferences or opt-out settings
- Notification history or read receipts
- Retry logic for transient Expo API failures (fire and forget for now)
- Non-critical alert push notifications (only CRITICAL goes to coach)

## Technical Notes

- The push service should be implemented as a utility function that other endpoints call (not a standalone API endpoint)
- Coach request endpoints call it when creating requests
- Wellness submission endpoint calls it when critical alerts are generated
- Use environment variable for Expo API configuration
- The Expo Push API is a POST to `https://exp.host/--/api/v2/push/send` with JSON body
- Consider making sends async (fire and forget) so they don't slow down the request/response cycle
