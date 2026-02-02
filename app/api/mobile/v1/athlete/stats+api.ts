import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/** Event name mapping from PersonalRecord.event to API response keys. */
const EVENT_MAP: Record<string, string> = {
  "1600m": "mile",
  "3200m": "threeTwo",
  "5K XC": "fiveK",
  "5000m": "fiveK",
};

/**
 * GET /api/mobile/v1/athlete/stats
 *
 * Returns performance trends, wellness summary, personal records,
 * and current baseline time for the authenticated athlete.
 *
 * Query params:
 *   workoutCount (Int, default 10)  — number of workouts for WECI/RPE trends
 *   wellnessDays (Int, default 7)   — number of days for wellness averages
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
    const workoutCount = Math.max(
      1,
      Math.min(
        50,
        parseInt(url.searchParams.get("workoutCount") ?? "10", 10) || 10
      )
    );
    const wellnessDays = Math.max(
      1,
      Math.min(
        90,
        parseInt(url.searchParams.get("wellnessDays") ?? "7", 10) || 7
      )
    );

    // 3. Query WECI trend — last N workouts with a WECI score, oldest first
    const weciResults = await prisma.workoutResult.findMany({
      where: {
        athleteId,
        weci: { not: null },
      },
      select: {
        weci: true,
        workout: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
      },
      orderBy: { workout: { date: "desc" } },
      take: workoutCount,
    });

    // Reverse so oldest is first (for charting), after taking the most recent N
    const weciTrend = weciResults.reverse().map((r) => ({
      workoutId: r.workout.id,
      workoutName: r.workout.name,
      date: r.workout.date,
      weci: r.weci,
    }));

    // 4. Query RPE trend — last N workouts with an RPE score, oldest first
    const rpeResults = await prisma.workoutResult.findMany({
      where: {
        athleteId,
        rpe: { not: null },
      },
      select: {
        rpe: true,
        workout: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
      },
      orderBy: { workout: { date: "desc" } },
      take: workoutCount,
    });

    const rpeTrend = rpeResults.reverse().map((r) => ({
      workoutId: r.workout.id,
      workoutName: r.workout.name,
      date: r.workout.date,
      rpe: r.rpe,
    }));

    // 5. Query wellness summary — averages over last N days
    const wellnessCutoff = new Date();
    wellnessCutoff.setUTCDate(wellnessCutoff.getUTCDate() - wellnessDays);
    wellnessCutoff.setUTCHours(0, 0, 0, 0);

    const wellnessAgg = await prisma.wellnessCheck.aggregate({
      where: {
        athleteId,
        createdAt: { gte: wellnessCutoff },
      },
      _avg: {
        sleepHours: true,
        sleepQuality: true,
        hydration: true,
        energyLevel: true,
        motivation: true,
        focus: true,
      },
      _count: {
        id: true,
      },
    });

    const submissionCount = wellnessAgg._count.id;
    const round1 = (val: number | null): number | null =>
      val !== null ? Math.round(val * 10) / 10 : null;

    const wellnessSummary = {
      avgSleepHours: round1(wellnessAgg._avg.sleepHours),
      avgSleepQuality: round1(wellnessAgg._avg.sleepQuality),
      avgHydration: round1(wellnessAgg._avg.hydration),
      avgEnergy: round1(wellnessAgg._avg.energyLevel),
      avgMotivation: round1(wellnessAgg._avg.motivation),
      avgFocus: round1(wellnessAgg._avg.focus),
      submissionCount,
    };

    // 6. Query personal records
    const prRecords = await prisma.personalRecord.findMany({
      where: { athleteId },
      select: {
        event: true,
        time: true,
        date: true,
      },
    });

    const personalRecords: Record<
      string,
      { time: number; date: Date } | null
    > = {
      mile: null,
      threeTwo: null,
      fiveK: null,
    };

    for (const pr of prRecords) {
      const key = EVENT_MAP[pr.event];
      if (key && key in personalRecords) {
        personalRecords[key] = { time: pr.time, date: pr.date };
      }
    }

    // 7. Query baseline time
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: {
        current1600mTime: true,
        targetEvent: true,
      },
    });

    const baselineTime = {
      event: athlete?.targetEvent ?? null,
      time: athlete?.current1600mTime ?? null,
    };

    return successResponse({
      weciTrend,
      rpeTrend,
      wellnessSummary,
      personalRecords,
      baselineTime,
    });
  } catch (error) {
    console.error("Athlete stats error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
