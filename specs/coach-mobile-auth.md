# Coach Mobile Authentication and Device Registration

## Job to be Done

**When** a coach opens the mobile app,
**they need** to log in with the same email/password they use on the web app,
**so that** they can access their team's mobile dashboard and manage requests.

**When** any user (coach or athlete) successfully logs in,
**the app needs** to register their device for push notifications,
**so that** the system can deliver real-time alerts and request notifications.

## Problem Statement

Coaches need mobile access using their existing credentials, and both coaches and athletes need their devices registered for push notifications. There is currently no mobile login endpoint for coaches and no device token storage mechanism.

---

## Specification

### Coach Login Flow

1. Coach opens mobile app, selects "I'm a Coach"
2. Coach enters email and password
3. App sends POST to `/api/mobile/v1/auth/coach-login`
4. Server verifies credentials against existing auth system
5. Server returns JWT token + coach profile
6. App stores JWT in secure storage

### Coach JWT Structure

| Claim  | Value                   |
| ------ | ----------------------- |
| sub    | Coach ID                |
| role   | "coach"                 |
| teamId | Coach's primary team ID |
| iat    | Issued at timestamp     |
| exp    | 7 days from issuance    |

### Coach Login Error States

| Condition        | Error Response                                     |
| ---------------- | -------------------------------------------------- |
| Email not found  | "Invalid email or password."                       |
| Wrong password   | "Invalid email or password."                       |
| Account disabled | "Your account has been disabled. Contact support." |

### Device Registration Flow

1. After successful login (athlete OR coach), app obtains Expo push token
2. App sends POST to `/api/mobile/v1/auth/register-device`
3. Server creates or updates DeviceToken record
4. If token already exists for this user, update it; if new token, create new record
5. Old tokens for the same user on different devices remain active

---

## Endpoint Specifications

### POST /api/mobile/v1/auth/coach-login

**Auth:** None (public endpoint)

**Request Body:**

| Field    | Type   | Required | Validation         |
| -------- | ------ | -------- | ------------------ |
| email    | String | Yes      | Valid email format |
| password | String | Yes      | Non-empty          |

**Success Response (200):**

| Field | Type   | Description                                |
| ----- | ------ | ------------------------------------------ |
| token | String | JWT token                                  |
| coach | Object | { id, firstName, lastName, email, teamId } |

**Error Responses:**

| Status | Code                | Message                         |
| ------ | ------------------- | ------------------------------- |
| 401    | INVALID_CREDENTIALS | Invalid email or password.      |
| 403    | ACCOUNT_DISABLED    | Your account has been disabled. |

### POST /api/mobile/v1/auth/register-device

**Auth:** Required (JWT — athlete or coach)

**Request Body:**

| Field    | Type   | Required | Validation                                                 |
| -------- | ------ | -------- | ---------------------------------------------------------- |
| token    | String | Yes      | Must match Expo push token format (ExponentPushToken[...]) |
| platform | String | No       | "ios" or "android" (informational)                         |

**Success Response (200):**

| Field    | Type    | Description           |
| -------- | ------- | --------------------- |
| success  | Boolean | true                  |
| deviceId | String  | DeviceToken record ID |

**Error Responses:**

| Status | Code                 | Message                    |
| ------ | -------------------- | -------------------------- |
| 400    | INVALID_TOKEN_FORMAT | Invalid push token format. |
| 401    | UNAUTHORIZED         | Authentication required.   |

---

## User Stories

### US-001: Authenticate Coach via Email/Password

**As a** coach logging into the mobile app,
**I want** to use my existing email and password,
**so that** I don't need separate credentials for mobile.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/auth/coach-login accepts { email, password }
- [ ] Verifies credentials against existing coach auth system
- [ ] Returns JWT with sub=coachId, role="coach", teamId
- [ ] Returns coach profile (id, firstName, lastName, email, teamId)
- [ ] JWT expires in 7 days
- [ ] Invalid credentials return 401 (same message for wrong email or wrong password)
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Register Device for Push Notifications

**As a** logged-in user (athlete or coach),
**I want** my device's push token stored on the server,
**so that** I receive push notifications for requests and alerts.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/auth/register-device accepts { token }
- [ ] Requires valid JWT in Authorization header
- [ ] Creates new DeviceToken record if token doesn't exist for this user
- [ ] Updates existing DeviceToken record if token already registered for this user
- [ ] Sets isActive = true on create/update
- [ ] Extracts userId and userRole from JWT claims
- [ ] Returns success with deviceId
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Reject Invalid Device Tokens

**As the** system validating push token registration,
**I want** to reject malformed Expo push tokens,
**so that** only valid tokens are stored and notification delivery doesn't fail silently.

**Acceptance Criteria:**

- [ ] Token not matching ExponentPushToken format returns 400
- [ ] Missing Authorization header returns 401
- [ ] Expired JWT returns 401
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Coach happy path:** email "coach@school.edu", correct password → returns 200 with JWT (role="coach", exp=7 days)

**Coach wrong password:** correct email, wrong password → returns 401 INVALID_CREDENTIALS

**Device registration happy path:** valid JWT + "ExponentPushToken[abc123]" → returns 200, DeviceToken record created with isActive=true

**Device registration duplicate:** same user registers same token again → returns 200, existing record updated (not duplicated)

**Device registration no auth:** no Authorization header → returns 401

---

## Out of Scope

- Coach account creation or password reset (web app handles this)
- Mobile app UI for login screens (React Native, not this project)
- Athlete login (separate spec)
- Push notification delivery logic (separate spec)
- Token deactivation on Expo errors (handled in push notification spec)

## Technical Notes

- Coach authentication should use the same credential verification as the web app (Supabase Auth or existing auth system)
- Do NOT create a separate auth system for mobile — reuse existing coach credentials
- Device token registration is used by both athletes and coaches, so the endpoint must accept JWTs with either role
- The DeviceToken model has a unique compound index on (userId, token) to prevent duplicates
