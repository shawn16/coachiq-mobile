# AGENTS.md - CoachIQ Mobile Backend Operational Guide

## Build & Validation Commands

All code changes MUST pass these checks before committing:

```bash
pnpm lint              # ESLint + TypeScript checks
pnpm build             # Production build validation
```

## Shared Database Rules (CRITICAL)

This project shares a PostgreSQL database with the CoachIQ web app.

### What You CAN Do

- ADD new models to `prisma/schema.prisma`
- ADD new fields to existing models (with defaults or nullable)
- ADD new indexes
- Run `pnpm prisma generate` after schema changes
- Run `pnpm prisma migrate dev --name <description>` for new migrations

### What You MUST NEVER Do

- DROP or RENAME existing tables
- DROP or RENAME existing columns
- MODIFY existing column types
- DELETE existing relations
- Run `prisma migrate reset` (this destroys production data)
- Modify any model field that the CoachIQ web app depends on UNLESS the current spec explicitly requires it (e.g., expanding scale from 1-5 to 1-10)

### Migration Safety

- Every migration must be non-destructive
- New fields must be nullable OR have a default value
- Test migrations against a copy of the database before production
- If a spec says to REMOVE a field (e.g., `soreness` integer), create a new migration that drops it AFTER the replacement field exists

## API Route Structure

All mobile API routes live under `/api/mobile/v1/`:

```
/api/mobile/v1/auth/       — Authentication endpoints
/api/mobile/v1/athlete/    — Athlete-facing endpoints
/api/mobile/v1/coach/      — Coach-facing endpoints
```

### Route Conventions

- Follow existing CoachIQ route patterns for response shapes
- Use consistent error response format: `{ error: { code: "ERROR_CODE", message: "Human-readable message" } }`
- Always validate JWT before processing authenticated requests
- Extract userId, role, and teamId from JWT claims — never trust request body for identity

## Commit Guidelines

- One logical change per commit
- Run all validation commands before committing
- Commit message format: `feat(mobile-api): [task description]`

## Coding Standards

### Prisma/Database

- Run `pnpm prisma generate` after schema changes
- Run `pnpm prisma migrate dev --name <description>` for migrations
- Follow existing naming conventions in schema.prisma
- Use transactions for multi-table writes (e.g., RPE dual-write)

### TypeScript

- Use existing type patterns from the codebase
- Export types from appropriate locations
- No `any` types unless absolutely necessary
- Define request/response types for every endpoint

### API Routes

- Follow existing route structure from CoachIQ
- Use existing validation patterns
- Return consistent response shapes
- Include proper HTTP status codes (201 for creates, 200 for reads, 400/401/409 for errors)

### Utilities

- Place shared utilities in `lib/utils/`
- Export from appropriate index files
- Include JSDoc comments for complex functions
- The alert engine should be a pure function importable by the wellness submission endpoint

### JWT & Auth

- JWT signing uses server-side secret from environment variable
- Athlete JWTs: 30-day expiry, role="athlete"
- Coach JWTs: 7-day expiry, role="coach"
- Auth middleware should extract and validate JWT before route handlers run

### Push Notifications

- Use Expo Push API (`https://exp.host/--/api/v2/push/send`)
- Batch tokens in groups of 100
- Fire-and-forget (don't block the request/response cycle)
- Deactivate tokens on DeviceNotRegistered errors
