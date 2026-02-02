import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/** UUID v4 format regex */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Response shape for wellness today section */
interface WellnessTodayResponse {
  submitted: number;
  total: number;
  responseRate: number;
}

/** Response shape for RPE latest section */
interface RpeLatestResponse {
  workoutName: string;
  workoutDate: string;
  submitted: number;
  total: number;
  responseRate: number;
}

/** Response shape for alert summary section */
interface AlertSummaryResponse {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

/** Full dashboard response shape */
interface DashboardResponse {
  team: { id: string; name: string; athleteCount: number };
  wellnessToday: WellnessTodayResponse;
  rpeLatest: RpeLatestResponse | null;
  alertSummary: AlertSummaryResponse;
}

/**
 * GET /api/mobile/v1/coach/dashboard
 *
 * Returns a snapshot of the coach's team status:
 * - Team info with active athlete count
 * - Wellness check-in response rate for today
 * - RPE response rate for the most recent workout
 * - Unresolved alert counts by severity
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

    // 3. Resolve teamId — use param or default to coach's primary team
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
      // Default to coach's primary team (first by createdAt)
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

    // 4. Team ownership check
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true, coachId: true },
    });

    if (!team || team.coachId !== coachId) {
      return errorResponse(
        400,
        "INVALID_TEAM",
        "Team not found or does not belong to you."
      );
    }

    // 5. Count active athletes
    const athleteCount = await prisma.athlete.count({
      where: { teamId, status: "active" },
    });

    // 6. Wellness today — count submissions for today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const wellnessSubmittedToday = await prisma.wellnessCheck.count({
      where: {
        athlete: { teamId, status: "active" },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const wellnessTotal = athleteCount;
    const wellnessResponseRate =
      wellnessTotal > 0 ? wellnessSubmittedToday / wellnessTotal : 0;

    const wellnessToday: WellnessTodayResponse = {
      submitted: wellnessSubmittedToday,
      total: wellnessTotal,
      responseRate: Math.round(wellnessResponseRate * 100) / 100,
    };

    // 7. RPE latest — find the most recent workout and its response rate
    let rpeLatest: RpeLatestResponse | null = null;

    const latestWorkout = await prisma.workout.findFirst({
      where: { teamId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
      },
    });

    if (latestWorkout) {
      // Count athletes assigned to this workout via WorkoutGroup → Group → Athletes
      const workoutGroups = await prisma.workoutGroup.findMany({
        where: { workoutId: latestWorkout.id },
        select: { groupId: true },
      });

      const groupIds = workoutGroups.map((wg) => wg.groupId);

      let rpeTotal: number;
      if (groupIds.length > 0) {
        // Count active athletes in the workout's assigned groups
        rpeTotal = await prisma.athlete.count({
          where: {
            teamId,
            status: "active",
            groupId: { in: groupIds },
          },
        });
      } else {
        // No groups assigned — fall back to all active athletes on the team
        rpeTotal = athleteCount;
      }

      // Count athletes who have a WorkoutResult with non-null RPE for this workout
      const rpeSubmitted = await prisma.workoutResult.count({
        where: {
          workoutId: latestWorkout.id,
          rpe: { not: null },
          athlete: { teamId, status: "active" },
        },
      });

      const rpeResponseRate = rpeTotal > 0 ? rpeSubmitted / rpeTotal : 0;

      rpeLatest = {
        workoutName: latestWorkout.name,
        workoutDate: latestWorkout.date.toISOString().split("T")[0],
        submitted: rpeSubmitted,
        total: rpeTotal,
        responseRate: Math.round(rpeResponseRate * 100) / 100,
      };
    }

    // 8. Alert summary — count unresolved alerts grouped by severity
    const alertCounts = await prisma.wellnessAlert.groupBy({
      by: ["severity"],
      where: {
        teamId,
        isResolved: false,
      },
      _count: { id: true },
    });

    const alertSummary: AlertSummaryResponse = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    for (const entry of alertCounts) {
      const severity = entry.severity as keyof Omit<AlertSummaryResponse, "total">;
      if (severity in alertSummary) {
        alertSummary[severity] = entry._count.id;
        alertSummary.total += entry._count.id;
      }
    }

    // 9. Return dashboard response
    const dashboard: DashboardResponse = {
      team: {
        id: team.id,
        name: team.name,
        athleteCount,
      },
      wellnessToday,
      rpeLatest,
      alertSummary,
    };

    return successResponse(dashboard);
  } catch (error) {
    console.error("Coach dashboard error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
