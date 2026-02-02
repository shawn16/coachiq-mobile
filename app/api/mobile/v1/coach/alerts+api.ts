import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/** UUID v4 format regex */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Severity rank for sorting: critical first, low last */
const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Valid severity filter values */
const VALID_SEVERITIES = new Set(["critical", "high", "medium", "low"]);

/** Maximum allowed limit for pagination */
const MAX_LIMIT = 100;

/** Default pagination limit */
const DEFAULT_LIMIT = 20;

/** Shape of an athlete in the alert response */
interface AlertAthleteResponse {
  id: string;
  firstName: string;
  lastName: string;
  groupName: string | null;
}

/** Shape of the wellness check data in the alert response */
interface AlertWellnessCheckResponse {
  sleepHours: number | null;
  sleepQuality: number | null;
  hydration: number | null;
  energyLevel: number | null;
  motivation: number | null;
  focus: number | null;
  foodTiming: string | null;
  sorenessAreas: string[];
  illnessSymptoms: string[];
}

/** Shape of a single alert in the response */
interface AlertResponse {
  id: string;
  ruleId: string;
  severity: string;
  message: string;
  details: unknown;
  isResolved: boolean;
  createdAt: Date;
  athlete: AlertAthleteResponse;
  wellnessCheck: AlertWellnessCheckResponse;
}

/** Shape of pagination metadata */
interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Full alerts response shape */
interface AlertsResponse {
  alerts: AlertResponse[];
  pagination: PaginationResponse;
}

/**
 * GET /api/mobile/v1/coach/alerts
 *
 * Returns a paginated, filterable list of wellness alerts for the coach's team.
 * Supports filtering by severity, group, and resolved status.
 * Sorted by severity (critical first) then by createdAt descending.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // 1. Authenticate — verify JWT and extract claims
    let auth;
    try {
      auth = authenticateRequest(request);
    } catch (err) {
      if (err instanceof AuthError) {
        return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
      }
      throw err;
    }

    if (auth.role !== "coach") {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }

    const coachId = auth.userId;

    // 2. Parse query params
    const url = new URL(request.url);
    const teamIdParam = url.searchParams.get("teamId");
    const severityParam = url.searchParams.get("severity");
    const groupIdParam = url.searchParams.get("groupId");
    const resolvedParam = url.searchParams.get("resolved");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    // 3. Validate severity filter
    if (severityParam && !VALID_SEVERITIES.has(severityParam)) {
      return errorResponse(
        400,
        "INVALID_SEVERITY",
        "Severity must be one of: critical, high, medium, low."
      );
    }

    // 4. Parse pagination params
    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1) {
        limit = DEFAULT_LIMIT;
      } else {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    let offset = 0;
    if (offsetParam) {
      const parsed = parseInt(offsetParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        offset = parsed;
      }
    }

    // 5. Resolve teamId — use param or default to coach's primary team
    let teamId: string;
    if (teamIdParam) {
      if (!UUID_REGEX.test(teamIdParam)) {
        return errorResponse(
          400,
          "INVALID_TEAM",
          "Team not found or does not belong to you."
        );
      }
      teamId = teamIdParam;
    } else {
      const primaryTeam = await prisma.team.findFirst({
        where: { coachId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!primaryTeam) {
        return errorResponse(
          400,
          "INVALID_TEAM",
          "Team not found or does not belong to you."
        );
      }
      teamId = primaryTeam.id;
    }

    // 6. Team ownership check
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, coachId: true },
    });

    if (!team || team.coachId !== coachId) {
      return errorResponse(
        400,
        "INVALID_TEAM",
        "Team not found or does not belong to you."
      );
    }

    // 7. Validate groupId if provided
    if (groupIdParam && !UUID_REGEX.test(groupIdParam)) {
      return errorResponse(
        400,
        "INVALID_GROUP",
        "Group not found or does not belong to this team."
      );
    }

    // 8. Build Prisma where clause
    const resolved = resolvedParam === "true";
    const whereClause: {
      teamId: string;
      isResolved?: boolean;
      severity?: string;
      athlete?: { groupId: string };
    } = {
      teamId,
    };

    // Default: only unresolved alerts. If resolved=true, show all (no filter)
    if (!resolved) {
      whereClause.isResolved = false;
    }

    if (severityParam) {
      whereClause.severity = severityParam;
    }

    if (groupIdParam) {
      whereClause.athlete = { groupId: groupIdParam };
    }

    // 9. Query alerts with pagination, sorted by createdAt desc
    //    (severity sort applied in-application given bounded page size)
    const [alerts, total] = await Promise.all([
      prisma.wellnessAlert.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              group: {
                select: { name: true },
              },
            },
          },
          wellnessCheck: {
            select: {
              sleepHours: true,
              sleepQuality: true,
              hydration: true,
              energyLevel: true,
              motivation: true,
              focus: true,
              foodTiming: true,
              sorenessAreas: true,
              illnessSymptoms: true,
            },
          },
        },
      }),
      prisma.wellnessAlert.count({ where: whereClause }),
    ]);

    // 10. Sort by severity rank (critical > high > medium > low), then by createdAt desc
    alerts.sort((a, b) => {
      const severityDiff =
        (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // 11. Shape response
    const shapedAlerts: AlertResponse[] = alerts.map((alert) => ({
      id: alert.id,
      ruleId: alert.ruleId,
      severity: alert.severity,
      message: alert.message,
      details: alert.details,
      isResolved: alert.isResolved,
      createdAt: alert.createdAt,
      athlete: {
        id: alert.athlete.id,
        firstName: alert.athlete.firstName,
        lastName: alert.athlete.lastName,
        groupName: alert.athlete.group?.name ?? null,
      },
      wellnessCheck: {
        sleepHours: alert.wellnessCheck.sleepHours,
        sleepQuality: alert.wellnessCheck.sleepQuality,
        hydration: alert.wellnessCheck.hydration,
        energyLevel: alert.wellnessCheck.energyLevel,
        motivation: alert.wellnessCheck.motivation,
        focus: alert.wellnessCheck.focus,
        foodTiming: alert.wellnessCheck.foodTiming,
        sorenessAreas: alert.wellnessCheck.sorenessAreas,
        illnessSymptoms: alert.wellnessCheck.illnessSymptoms,
      },
    }));

    const response: AlertsResponse = {
      alerts: shapedAlerts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    return successResponse(response);
  } catch (error) {
    console.error("Coach alerts error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
