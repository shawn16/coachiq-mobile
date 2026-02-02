import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";
import { calculatePersonalizedTargetPaces } from "@/lib/utils/pace-calculations";

/**
 * GET /api/mobile/v1/athlete/workouts
 *
 * Returns the authenticated athlete's upcoming workouts (with personalized
 * target paces) and recent workout history (with actual results and splits).
 *
 * Query params:
 *   upcoming (Int, default 5)  — number of upcoming workouts to return
 *   history  (Int, default 10) — number of past workouts to return
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

    if (auth.role !== "athlete") {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }

    const athleteId = auth.userId;

    // 2. Parse query params
    const url = new URL(request.url);
    const upcomingCount = Math.max(
      1,
      Math.min(50, parseInt(url.searchParams.get("upcoming") ?? "5", 10) || 5)
    );
    const historyCount = Math.max(
      1,
      Math.min(50, parseInt(url.searchParams.get("history") ?? "10", 10) || 10)
    );

    // 3. Look up athlete record for groupId and baseline
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: {
        groupId: true,
        current1600mTime: true,
      },
    });

    const athleteGroupId = athlete?.groupId ?? null;
    const athleteBaseline = athlete?.current1600mTime ?? null;

    // Today at 00:00:00 UTC for date comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 4. Query upcoming workouts
    const upcomingWorkouts = athleteGroupId
      ? await prisma.workout.findMany({
          where: {
            date: { gte: today },
            workoutGroups: {
              some: {
                groupId: athleteGroupId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            date: true,
            workoutType: true,
            ptgZone: true,
            structureJson: true,
            targetPace: true,
          },
          orderBy: { date: "asc" },
          take: upcomingCount,
        })
      : [];

    // Build upcoming response with personalized target paces
    const upcoming = upcomingWorkouts.map((workout) => {
      const targetPaces = calculatePersonalizedTargetPaces(
        athleteBaseline,
        workout.structureJson,
        workout.targetPace
      );

      return {
        id: workout.id,
        name: workout.name,
        date: workout.date,
        type: workout.workoutType,
        classification: workout.ptgZone,
        targetPaces,
      };
    });

    // 5. Query workout history — past workouts where athlete has a result
    const historyResults = await prisma.workoutResult.findMany({
      where: {
        athleteId,
        workout: {
          date: { lt: today },
        },
      },
      select: {
        workout: {
          select: {
            id: true,
            name: true,
            date: true,
            workoutType: true,
            ptgZone: true,
            structureJson: true,
            targetPace: true,
          },
        },
        weci: true,
        rpe: true,
        splitDetails: {
          select: {
            repNumber: true,
            time: true,
            offPaceAmount: true,
          },
          orderBy: { repNumber: "asc" },
        },
      },
      orderBy: {
        workout: { date: "desc" },
      },
      take: historyCount,
    });

    // Build history response with splits and target calculations
    const history = historyResults.map((result) => {
      const { workout } = result;

      // Calculate what the target paces would have been for this workout
      const targetPaces = calculatePersonalizedTargetPaces(
        athleteBaseline,
        workout.structureJson,
        workout.targetPace
      );

      // Build a lookup of target times by rep number
      const targetByRep = new Map(
        targetPaces.map((tp) => [tp.repNumber, tp.targetTime])
      );

      const splits = result.splitDetails.map((split) => ({
        repNumber: split.repNumber,
        time: split.time,
        target: targetByRep.get(split.repNumber) ?? null,
        deviation: split.offPaceAmount ?? null,
      }));

      return {
        id: workout.id,
        name: workout.name,
        date: workout.date,
        type: workout.workoutType,
        classification: workout.ptgZone,
        result: {
          weci: result.weci,
          rpe: result.rpe,
          splits,
        },
      };
    });

    return successResponse({ upcoming, history });
  } catch (error) {
    console.error("Athlete workouts error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
