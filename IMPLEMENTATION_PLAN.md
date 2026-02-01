# Implementation Plan: CoachIQ Mobile Backend — Auth & Device Registration

## Overview

This plan implements two spec files:
1. **`specs/athlete-pin-auth.md`** — PIN-based athlete activation and JWT issuance
2. **`specs/coach-mobile-auth.md`** — Coach email/password login (via Supabase Auth) and device token registration

### Prerequisites (Already Complete)
- Prisma schema has all required models: `Athlete` (with `inviteCode`/`inviteCodeExpiry`/`status`), `Coach`, `Team`, `DeviceToken`
- Database migrations applied for mobile models and wellness expansion
- `@prisma/client` and `prisma` dependencies installed

### Key Constraints
- **Shared database** — no destructive changes; read/write only via Prisma
- **Supabase Auth** for coach credentials — reuse existing auth, do not create a separate system
- **JWT signing** uses server-side secret (`JWT_SECRET` env var); separate from Supabase JWTs
- **Athlete JWTs**: 30-day expiry, `role="athlete"`
- **Coach JWTs**: 7-day expiry, `role="coach"`
- **API route pattern**: Expo Router API routes using `+api.ts` suffix under `app/api/mobile/v1/`
- **Utility placement**: Server-side utilities in `lib/` per AGENTS.md
- **Error format**: `{ error: { code: "ERROR_CODE", message: "Human-readable message" } }`

### Dependency Graph

```
Phase 1: Dependencies
  Task 1.1 (install jsonwebtoken)
  Task 1.2 (install @supabase/supabase-js)
  Task 1.3 (add JWT_SECRET env var)
      │
Phase 2: Core Utilities
  Task 2.1 (Prisma client singleton)
  Task 2.2 (JWT sign/verify) ──────────────┐
  Task 2.3 (Supabase server client)        │
  Task 2.4 (error response helper)         │
  Task 2.5 (rate limiter)                  │
  Task 2.6 (auth middleware) ◄─────────────┘
      │
Phase 3: API Endpoints
  Task 3.1 (athlete-login) ◄── 2.1, 2.2, 2.4, 2.5
  Task 3.2 (coach-login) ◄──── 2.1, 2.2, 2.3, 2.4
  Task 3.3 (register-device) ◄ 2.1, 2.4, 2.6
      │
Phase 4: Validation
  Task 4.1 (lint)
  Task 4.2 (typecheck / build)
```

---

## Phase 1: Dependencies & Environment

### Task 1.1: Install JWT Dependency [DONE]
- **Files:** `package.json`
- **Change:** Install `jsonwebtoken` for JWT signing/verification and its TypeScript types:
  - `pnpm add jsonwebtoken`
  - `pnpm add -D @types/jsonwebtoken`
- **Spec:** `athlete-pin-auth.md` (JWT issuance), `coach-mobile-auth.md` (JWT issuance)
- **Dependencies:** None
- **Validation:** `pnpm install` completes; package appears in `package.json`

### Task 1.2: Install Supabase Client [DONE]
- **Files:** `package.json`
- **Change:** Install `@supabase/supabase-js` for verifying coach credentials against the existing Supabase Auth system:
  - `pnpm add @supabase/supabase-js`
- **Spec:** `coach-mobile-auth.md` (coach credential verification)
- **Dependencies:** None
- **Validation:** `pnpm install` completes; package appears in `package.json`

### Task 1.3: Add JWT_SECRET Environment Variable [DONE]
- **Files:** `.env.local`
- **Change:** Add a `JWT_SECRET` variable for signing mobile JWTs. This is a server-side secret distinct from Supabase keys. Generate a strong random string (minimum 32 characters). Example:
  ```
  JWT_SECRET="your-secure-random-secret-at-least-32-chars"
  ```
  Also verify that `.env.local` already contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (confirmed present).
- **Spec:** AGENTS.md ("JWT signing uses server-side secret from environment variable")
- **Dependencies:** None
- **Validation:** Variable is set and accessible via `process.env.JWT_SECRET`

---

## Phase 2: Core Utilities

### Task 2.1: Create Prisma Client Singleton [DONE]
- **Files:** `lib/db.ts` (create)
- **Change:** Create a Prisma client singleton that reuses the same instance across API route invocations to avoid exhausting database connections. Follow the standard Prisma singleton pattern:
  ```typescript
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- **Spec:** Prerequisite for all database operations across both specs
- **Dependencies:** Task 1.1 (Prisma already installed, but dependencies must be resolved)
- **Validation:** File imports without errors; `pnpm lint` passes on this file

### Task 2.2: Create JWT Utility [DONE]
- **Files:** `lib/utils/jwt.ts` (create)
- **Change:** Create JWT sign and verify utility functions. Export:
  - `signAthleteToken(athleteId: string, teamId: string): string` — signs JWT with `{ sub: athleteId, role: "athlete", teamId }`, 30-day expiry
  - `signCoachToken(coachId: string, teamId: string): string` — signs JWT with `{ sub: coachId, role: "coach", teamId }`, 7-day expiry
  - `verifyToken(token: string): JWTPayload` — verifies and decodes JWT, throws on invalid/expired
  - `JWTPayload` type: `{ sub: string; role: "athlete" | "coach"; teamId: string; iat: number; exp: number }`

  Implementation uses `jsonwebtoken` library with `process.env.JWT_SECRET`. Throw a clear error if `JWT_SECRET` is not set.
- **Spec:** `athlete-pin-auth.md` (JWT structure table), `coach-mobile-auth.md` (Coach JWT structure table), AGENTS.md (JWT expiry rules)
- **Dependencies:** Task 1.1, Task 1.3
- **Validation:** TypeScript compiles; `pnpm lint` passes

### Task 2.3: Create Supabase Server Client [DONE]
- **Files:** `lib/supabase.ts` (create)
- **Change:** Create a Supabase client configured for server-side use with the service/anon key. Uses env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`. Export:
  - `supabase` — initialized Supabase client instance

  This client is used exclusively for `supabase.auth.signInWithPassword()` to verify coach credentials. No other Supabase features are needed.
- **Spec:** `coach-mobile-auth.md` ("use the same credential verification as the web app (Supabase Auth)")
- **Dependencies:** Task 1.2
- **Validation:** TypeScript compiles; client initializes without error

### Task 2.4: Create Error Response Helper
- **Files:** `lib/utils/errors.ts` (create)
- **Change:** Create a utility function for consistent JSON error responses across all API endpoints. Export:
  - `errorResponse(status: number, code: string, message: string): Response` — returns a `Response` object with the standard error shape:
    ```json
    { "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
    ```
  - `successResponse(data: unknown, status?: number): Response` — returns a `Response` object with JSON body and correct content-type header

  These follow the AGENTS.md error format convention and return standard `Response` objects compatible with Expo Router API routes.
- **Spec:** AGENTS.md ("Use consistent error response format")
- **Dependencies:** None
- **Validation:** TypeScript compiles; `pnpm lint` passes

### Task 2.5: Create In-Memory Rate Limiter
- **Files:** `lib/utils/rate-limit.ts` (create)
- **Change:** Create a simple in-memory rate limiter for PIN brute-force protection. Export:
  - `RateLimiter` class or `checkRateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number }` function
  - `resetRateLimit(key: string): void` — resets the counter for a key (called on successful activation)

  Implementation:
  - Uses a `Map<string, { count: number; firstAttempt: number }>` to track attempts per IP
  - 5 attempts per 15-minute window (configurable via parameters)
  - Auto-cleans expired entries on each check to prevent memory leaks
  - Successful activation calls `resetRateLimit()` to clear the counter

  Note: In-memory rate limiting resets on server restart. This is acceptable for a school coaching app. If horizontal scaling is needed later, this can be replaced with a database-backed or Redis-backed implementation.
- **Spec:** `athlete-pin-auth.md` US-003 (rate limiting specification)
- **Dependencies:** None
- **Validation:** TypeScript compiles; `pnpm lint` passes

### Task 2.6: Create Auth Middleware
- **Files:** `lib/middleware/auth.ts` (create)
- **Change:** Create an authentication middleware function that extracts and validates JWT from the `Authorization: Bearer <token>` header. Export:
  - `authenticateRequest(request: Request): { userId: string; role: "athlete" | "coach"; teamId: string }` — extracts Bearer token, verifies it via `verifyToken()`, returns decoded claims
  - Throws/returns errors for:
    - Missing Authorization header → 401 `UNAUTHORIZED`
    - Invalid/malformed token → 401 `UNAUTHORIZED`
    - Expired token → 401 `UNAUTHORIZED`

  This function is called at the start of any protected API route handler (e.g., `register-device`). It is NOT Express-style middleware — it's a utility function that route handlers call directly, since Expo Router API routes don't have a middleware pipeline.
- **Spec:** `coach-mobile-auth.md` US-002 (device registration requires JWT), AGENTS.md ("Always validate JWT before processing authenticated requests")
- **Dependencies:** Task 2.2 (uses `verifyToken`)
- **Validation:** TypeScript compiles; `pnpm lint` passes

---

## Phase 3: API Endpoints

### Task 3.1: Create Athlete PIN Login Endpoint
- **Files:** `app/api/mobile/v1/auth/athlete-login+api.ts` (create)
- **Change:** Implement `POST /api/mobile/v1/auth/athlete-login` as an Expo Router API route. Export:
  ```typescript
  export async function POST(request: Request): Promise<Response>
  ```

  **Request body:** `{ pin: string }`

  **Logic (in order):**
  1. Parse request body, extract `pin`
  2. Validate: `pin` must be exactly 6 alphanumeric characters; convert to uppercase
  3. Check rate limit for request IP (via `checkRateLimit`); if exceeded → 429 `RATE_LIMITED`
  4. Query `prisma.athlete.findFirst()` where `inviteCode` equals uppercase pin (case-insensitive lookup)
  5. If no athlete found → 401 `INVALID_PIN` (increment rate limit counter)
  6. If athlete found but `inviteCodeExpiry < now` → 401 `PIN_EXPIRED` (increment rate limit counter)
  7. If athlete found but `status === "active"` → 409 `ALREADY_ACTIVE`
  8. **Activate athlete** in a single `prisma.athlete.update()`:
     - Set `status` to `"active"`
     - Set `inviteCode` to `null`
     - Set `inviteCodeExpiry` to `null`
  9. Call `resetRateLimit(ip)` to clear the counter on success
  10. Sign JWT via `signAthleteToken(athlete.id, athlete.teamId)`
  11. Return 200 with `{ token, athlete: { id, firstName, lastName, teamId, groupId } }`

  **Error responses:**
  | Status | Code           | Message                                                    |
  |--------|----------------|------------------------------------------------------------|
  | 400    | INVALID_INPUT  | PIN must be exactly 6 alphanumeric characters.             |
  | 401    | INVALID_PIN    | Invalid PIN. Please check with your coach.                 |
  | 401    | PIN_EXPIRED    | This PIN has expired. Please ask your coach for a new one. |
  | 409    | ALREADY_ACTIVE | This account is already activated.                         |
  | 429    | RATE_LIMITED   | Too many attempts. Please wait 15 minutes.                 |

  **IP extraction:** Use `request.headers.get("x-forwarded-for")` or fallback to a default key. Expo Router API routes run behind various proxies, so `x-forwarded-for` is the standard approach.

- **Spec:** `athlete-pin-auth.md` US-001, US-002, US-003
- **Dependencies:** Task 2.1 (Prisma client), Task 2.2 (JWT signing), Task 2.4 (error responses), Task 2.5 (rate limiter)
- **Validation:** `pnpm lint` passes; typecheck passes; manual test: POST with valid/invalid PIN returns expected responses

### Task 3.2: Create Coach Login Endpoint
- **Files:** `app/api/mobile/v1/auth/coach-login+api.ts` (create)
- **Change:** Implement `POST /api/mobile/v1/auth/coach-login` as an Expo Router API route. Export:
  ```typescript
  export async function POST(request: Request): Promise<Response>
  ```

  **Request body:** `{ email: string, password: string }`

  **Logic (in order):**
  1. Parse request body, extract `email` and `password`
  2. Validate: `email` must be a valid email format; `password` must be non-empty
  3. Verify credentials against Supabase Auth:
     ```typescript
     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
     ```
  4. If Supabase returns error → 401 `INVALID_CREDENTIALS` ("Invalid email or password.")
     - Same error message for wrong email OR wrong password (security best practice)
  5. Look up Coach by email in our database:
     ```typescript
     const coach = await prisma.coach.findUnique({
       where: { email },
       include: { teams: { take: 1, orderBy: { createdAt: "desc" } } }
     });
     ```
  6. If no Coach record found → 401 `INVALID_CREDENTIALS` (coach exists in Supabase Auth but not in our DB)
  7. Determine `teamId` from `coach.teams[0]?.id` (primary/most recent team)
     - If coach has no teams, `teamId` can be `null` in the JWT (edge case)
  8. Sign JWT via `signCoachToken(coach.id, teamId)`
  9. Return 200 with:
     ```json
     { "token": "...", "coach": { "id": "...", "name": "...", "email": "...", "teamId": "..." } }
     ```

  **Note on response shape:** The spec requests `{ id, firstName, lastName, email, teamId }` but the Coach model has a single `name` field (not firstName/lastName). Return `name` as-is. The mobile app can handle display formatting.

  **Error responses:**
  | Status | Code                | Message                    |
  |--------|---------------------|----------------------------|
  | 400    | INVALID_INPUT       | Email and password required.|
  | 401    | INVALID_CREDENTIALS | Invalid email or password. |

- **Spec:** `coach-mobile-auth.md` US-001
- **Dependencies:** Task 2.1 (Prisma client), Task 2.2 (JWT signing), Task 2.3 (Supabase client), Task 2.4 (error responses)
- **Validation:** `pnpm lint` passes; typecheck passes; manual test: POST with valid/invalid credentials returns expected responses

### Task 3.3: Create Device Registration Endpoint
- **Files:** `app/api/mobile/v1/auth/register-device+api.ts` (create)
- **Change:** Implement `POST /api/mobile/v1/auth/register-device` as an Expo Router API route. Export:
  ```typescript
  export async function POST(request: Request): Promise<Response>
  ```

  **Request body:** `{ token: string, platform?: string }`

  **Logic (in order):**
  1. Authenticate request via `authenticateRequest(request)` — extracts `userId`, `role`, `teamId` from JWT
     - If auth fails → 401 `UNAUTHORIZED`
  2. Parse request body, extract `token` and optional `platform`
  3. Validate token format: must match Expo push token pattern `ExponentPushToken[...]`
     - Regex: `/^ExponentPushToken\[.+\]$/`
     - If invalid → 400 `INVALID_TOKEN_FORMAT`
  4. Upsert the DeviceToken record:
     ```typescript
     const deviceToken = await prisma.deviceToken.upsert({
       where: { userId_token: { userId, token } },
       create: { userId, userRole: role, token, isActive: true },
       update: { isActive: true, userRole: role }
     });
     ```
     This handles both new registrations and re-registrations (e.g., app reinstall).
  5. Return 200 with `{ success: true, deviceId: deviceToken.id }`

  **Error responses:**
  | Status | Code                 | Message                    |
  |--------|----------------------|----------------------------|
  | 400    | INVALID_TOKEN_FORMAT | Invalid push token format. |
  | 401    | UNAUTHORIZED         | Authentication required.   |

- **Spec:** `coach-mobile-auth.md` US-002, US-003
- **Dependencies:** Task 2.1 (Prisma client), Task 2.4 (error responses), Task 2.6 (auth middleware)
- **Validation:** `pnpm lint` passes; typecheck passes; manual test: POST with valid JWT + Expo token returns success

---

## Phase 4: Validation

### Task 4.1: Run Lint
- **Files:** None (read-only)
- **Change:** Run `pnpm lint` to verify no TypeScript or ESLint errors across all new files.
- **Spec:** AGENTS.md validation requirement
- **Dependencies:** Tasks 3.1, 3.2, 3.3
- **Validation:** `pnpm lint` exits 0

### Task 4.2: Run Build / Typecheck
- **Files:** None (read-only)
- **Change:** Run `pnpm build` (or `npx tsc --noEmit` if no build script) to verify the production build succeeds and all types are correct.
- **Spec:** AGENTS.md validation requirement
- **Dependencies:** Task 4.1
- **Validation:** Command exits 0; no type errors

---

## Summary of File Changes

| File | Change Type | Phase | Spec |
|------|------------|-------|------|
| `package.json` | Modify (add jsonwebtoken, @supabase/supabase-js) | 1 | Both |
| `.env.local` | Modify (add JWT_SECRET) | 1 | Both |
| `lib/db.ts` | Create (Prisma singleton) | 2 | Both |
| `lib/utils/jwt.ts` | Create (sign/verify) | 2 | Both |
| `lib/supabase.ts` | Create (Supabase client) | 2 | coach-mobile-auth |
| `lib/utils/errors.ts` | Create (response helpers) | 2 | Both |
| `lib/utils/rate-limit.ts` | Create (rate limiter) | 2 | athlete-pin-auth |
| `lib/middleware/auth.ts` | Create (JWT auth) | 2 | coach-mobile-auth |
| `app/api/mobile/v1/auth/athlete-login+api.ts` | Create (endpoint) | 3 | athlete-pin-auth |
| `app/api/mobile/v1/auth/coach-login+api.ts` | Create (endpoint) | 3 | coach-mobile-auth |
| `app/api/mobile/v1/auth/register-device+api.ts` | Create (endpoint) | 3 | coach-mobile-auth |

## Endpoints Created

| Method | Path | Auth | Spec |
|--------|------|------|------|
| POST | `/api/mobile/v1/auth/athlete-login` | None (public) | athlete-pin-auth |
| POST | `/api/mobile/v1/auth/coach-login` | None (public) | coach-mobile-auth |
| POST | `/api/mobile/v1/auth/register-device` | JWT required | coach-mobile-auth |

## No Schema Changes Required

All database models needed for these endpoints already exist:
- `Athlete` — has `inviteCode`, `inviteCodeExpiry`, `status` fields for PIN auth
- `Coach` — has `email`, `name` fields; related to `Team[]`
- `DeviceToken` — has `userId`, `userRole`, `token`, `isActive` fields with compound unique index
