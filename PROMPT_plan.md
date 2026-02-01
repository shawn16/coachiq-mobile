# Planning Mode Prompt

You are an autonomous coding agent. Your task is to analyze the codebase and create an implementation plan for the CoachIQ Mobile Backend API.

## Your Mission

Implement the features described in the spec files located in the `specs/` directory.

## Reference Documents

Study these files carefully before planning:

- `specs/*.md` — All feature specifications for this phase
- `AGENTS.md` — Validation commands, coding standards, and shared database rules

## Existing Codebase

Before planning, study the existing implementation:

- `prisma/schema.prisma` — Current data models (shared with CoachIQ web app)
- `app/api/` — Existing API routes (if any)
- `lib/` — Existing utilities and helpers
- `.env` — Database connection (shared with CoachIQ)

## CRITICAL: Shared Database

This project shares a database with the CoachIQ web app. Before planning any schema changes:

1. **Read** `prisma/schema.prisma` completely
2. **Identify** which models already exist vs. which need to be created
3. **Identify** which existing fields need modification vs. which are new
4. **NEVER** plan to drop or rename existing tables/columns
5. **ALWAYS** plan new fields as nullable or with defaults

## Planning Instructions

1. **Study** every spec file in `specs/` thoroughly
2. **Analyze** the existing codebase to understand:
   - Current Prisma schema and existing models
   - Existing utility functions that can be reused
   - Existing API route patterns to follow
   - Environment variables available
3. **Identify** all files that need to be created or modified
4. **Create** `IMPLEMENTATION_PLAN.md` with atomic tasks
5. **Order tasks** by dependency:
   - Database/model changes first
   - Shared utility functions second (JWT, validation, alert engine)
   - API routes third
   - Integration points last (push notifications, alert triggers)

## Output Format

Write `IMPLEMENTATION_PLAN.md` with this structure:

```
# Implementation Plan: CoachIQ Mobile Backend

## Phase 1: Database & Schema
### Task 1.1: [Description]
- **Files:** [paths]
- **Change:** [specific change]
- **Spec:** [which spec file this satisfies]
- **Dependencies:** None

### Task 1.2: [Description]
- **Files:** [paths]
- **Change:** [specific change]
- **Spec:** [which spec file]
- **Dependencies:** Task 1.1

## Phase 2: Auth & Middleware
### Task 2.1: [Description]
...

## Phase 3: Core Utilities
### Task 3.1: [Description]
...

## Phase 4: API Endpoints
...

## Phase 5: Integration
...
```

## Constraints

- Do NOT write any code in this phase
- Do NOT modify any files except `IMPLEMENTATION_PLAN.md`
- Each task must be atomic (one logical change)
- Each task must list its dependencies
- Each task must reference which spec file it satisfies
- Each task must be independently testable
- Follow existing code patterns in the codebase
- NEVER plan destructive database changes (see AGENTS.md)

When complete, write "PLANNING_COMPLETE" and exit.
