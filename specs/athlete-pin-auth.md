# Athlete PIN Authentication

## Job to be Done

**When** a high school athlete opens the mobile app for the first time,
**they need** to activate their account using a PIN code provided by their coach,
**so that** they can access their team's mobile features without needing a personal email address.

## Problem Statement

High school athletes often lack school email accounts and may not have personal email. The existing CoachIQ authentication (email/password via Supabase) doesn't work for this audience. A PIN-based activation system is needed where the coach generates a code and the athlete enters it once to activate their mobile account.

---

## Specification

### PIN Properties

| Property       | Value                                                     |
| -------------- | --------------------------------------------------------- |
| Format         | 6 characters, alphanumeric (A-Z, 0-9), uppercase          |
| Expiry         | 7 days from generation                                    |
| Usage          | Single-use — cleared after successful activation          |
| Storage        | Athlete.inviteCode field (already exists in schema)       |
| Expiry storage | Athlete.inviteCodeExpiry field (already exists in schema) |

### Activation Flow

1. Coach generates PIN via web app (assigns it to an athlete record)
2. Coach gives PIN to athlete (verbally, printed, etc.)
3. Athlete opens mobile app, selects "I'm an Athlete"
4. Athlete enters 6-character PIN
5. App sends POST to `/api/mobile/v1/auth/athlete-login` with `{ pin: "ABC123" }`
6. Server finds Athlete where inviteCode matches AND inviteCodeExpiry > now AND status != "active"
7. Server sets Athlete.status = "active", clears inviteCode and inviteCodeExpiry
8. Server returns JWT token + athlete profile data
9. App stores JWT in secure storage for future sessions

### JWT Token Structure

| Claim  | Value                 |
| ------ | --------------------- |
| sub    | Athlete ID            |
| role   | "athlete"             |
| teamId | Athlete's team ID     |
| iat    | Issued at timestamp   |
| exp    | 30 days from issuance |

### Returning Athlete (Already Activated)

Once activated, the athlete's JWT is stored locally. On subsequent app opens:

- If JWT is valid and not expired → proceed to athlete home screen
- If JWT is expired → show "Your session has expired. Please contact your coach for a new PIN."
- Coach must generate a new PIN to re-activate

### Error States

| Condition              | Error Response                                                             |
| ---------------------- | -------------------------------------------------------------------------- |
| PIN not found          | "Invalid PIN. Please check with your coach."                               |
| PIN expired            | "This PIN has expired. Please ask your coach for a new one."               |
| Athlete already active | "This account is already activated. If you need help, contact your coach." |
| Rate limited           | "Too many attempts. Please wait 15 minutes."                               |

### Rate Limiting

- 5 failed PIN attempts per IP address per 15-minute window
- After 5 failures, block that IP for 15 minutes
- Successful activation resets the counter

---

## Endpoint Specification

### POST /api/mobile/v1/auth/athlete-login

**Auth:** None (public endpoint)

**Request Body:**

| Field | Type   | Required | Validation                                   |
| ----- | ------ | -------- | -------------------------------------------- |
| pin   | String | Yes      | Exactly 6 alphanumeric characters, uppercase |

**Success Response (200):**

| Field   | Type   | Description                                  |
| ------- | ------ | -------------------------------------------- |
| token   | String | JWT token                                    |
| athlete | Object | { id, firstName, lastName, teamId, groupId } |

**Error Responses:**

| Status | Code           | Message                                                    |
| ------ | -------------- | ---------------------------------------------------------- |
| 401    | INVALID_PIN    | Invalid PIN. Please check with your coach.                 |
| 401    | PIN_EXPIRED    | This PIN has expired. Please ask your coach for a new one. |
| 409    | ALREADY_ACTIVE | This account is already activated.                         |
| 429    | RATE_LIMITED   | Too many attempts. Please wait 15 minutes.                 |

---

## User Stories

### US-001: Validate and Activate Athlete via PIN

**As an** athlete entering my PIN for the first time,
**I want** the server to verify my PIN and activate my account,
**so that** I receive a JWT and can use the mobile app.

**Acceptance Criteria:**

- [ ] POST /api/mobile/v1/auth/athlete-login accepts { pin: "ABC123" }
- [ ] Finds athlete where inviteCode = pin AND inviteCodeExpiry > now AND status != "active"
- [ ] Sets athlete status to "active"
- [ ] Clears inviteCode and inviteCodeExpiry fields
- [ ] Returns JWT with sub=athleteId, role="athlete", teamId
- [ ] Returns athlete profile (id, firstName, lastName, teamId, groupId)
- [ ] JWT expires in 30 days
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Reject Invalid PIN Attempts

**As the** system protecting against unauthorized access,
**I want** to return clear error messages for invalid PINs,
**so that** athletes know what went wrong and what to do next.

**Acceptance Criteria:**

- [ ] Non-existent PIN returns 401 with INVALID_PIN code
- [ ] Expired PIN returns 401 with PIN_EXPIRED code
- [ ] Already-activated athlete returns 409 with ALREADY_ACTIVE code
- [ ] PIN validation is case-insensitive (accepts "abc123" same as "ABC123")
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Rate Limit PIN Attempts

**As the** system protecting against brute-force attacks,
**I want** to block excessive failed PIN attempts from the same IP,
**so that** PINs cannot be guessed through rapid trial and error.

**Acceptance Criteria:**

- [ ] 6th failed attempt from same IP within 15 minutes returns 429
- [ ] Successful activation resets the failure counter
- [ ] After 15 minutes, blocked IP can try again
- [ ] Typecheck passes
- [ ] Lint passes

---

## Test Cases

**Happy path:** PIN "ABC123" exists, not expired, athlete not yet active → returns 200 with JWT, athlete status = "active", inviteCode = null

**Expired PIN:** PIN "XYZ789" exists but inviteCodeExpiry is yesterday → returns 401 PIN_EXPIRED

**Already active:** PIN "DEF456" matches an athlete with status = "active" → returns 409 ALREADY_ACTIVE

**Rate limit:** 5 consecutive failures from 192.168.1.1 → 6th attempt returns 429

---

## Out of Scope

- PIN generation UI on the web app (coach already has this capability)
- Mobile app UI for PIN entry (React Native, not this project)
- Coach authentication (separate spec)
- Device token registration (separate spec)
- Token refresh endpoint (athletes get a new PIN if JWT expires)

## Technical Notes

- The Athlete model already has inviteCode (String?) and inviteCodeExpiry (DateTime?) fields — no schema change needed for PIN storage
- JWT signing should use a server-side secret (environment variable)
- The PIN lookup should be case-insensitive to avoid confusion (store uppercase, compare uppercase)
- All mobile API routes live under /api/mobile/v1/
