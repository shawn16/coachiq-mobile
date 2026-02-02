import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/**
 * GET /api/mobile/v1/athlete/pending
 *
 * Returns outstanding coach requests (wellness check-ins and RPE ratings)
 * that the authenticated athlete has not yet completed.
 *
 * A request is "pending" if:
 * - It targets the athlete's team (and group, if specified)
 * - Its deadline has not passed
 * - The athlete has NOT submitted a response linked to it
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
    const teamId = auth.teamId;

    // 2. Look up athlete record to get groupId
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { groupId: true },
    });

    const athleteGroupId = athlete?.groupId ?? null;
    const now = new Date();

    // 3. Query pending wellness requests
    const pendingWellnessRequests = await prisma.wellnessRequest.findMany({
      where: {
        teamId,
        // Group scoping: request targets entire team (null) or athlete's group
        OR: [
          { groupId: null },
          ...(athleteGroupId ? [{ groupId: athleteGroupId }] : []),
        ],
        // Not expired
        deadline: { gt: now },
        // Athlete has NOT submitted a WellnessCheck linked to this request
        NOT: {
          wellnessChecks: {
            some: {
              athleteId,
            },
          },
        },
      },
      include: {
        coach: {
          select: { name: true },
        },
      },
      orderBy: { deadline: "asc" },
    });

    // 4. Query pending RPE requests
    // An RPE request is pending if the athlete has no RPESubmission for the
    // request's workoutId. The check goes through WorkoutResult (which has
    // workoutId + athleteId) → RPESubmission, not via rpeRequestId FK.
    // Strategy: fetch candidate requests, then post-filter using the athlete's
    // existing RPE submissions for the relevant workouts.
    const candidateRpeRequests = await prisma.rPERequest.findMany({
      where: {
        teamId,
        OR: [
          { groupId: null },
          ...(athleteGroupId ? [{ groupId: athleteGroupId }] : []),
        ],
        deadline: { gt: now },
      },
      include: {
        coach: {
          select: { name: true },
        },
        workout: {
          select: { id: true, name: true, date: true, workoutType: true },
        },
      },
      orderBy: { deadline: "asc" },
    });

    // Find which of the candidate workouts the athlete already submitted RPE for
    const candidateWorkoutIds = candidateRpeRequests.map((r) => r.workoutId);
    const submittedWorkoutResults = candidateWorkoutIds.length > 0
      ? await prisma.workoutResult.findMany({
          where: {
            athleteId,
            workoutId: { in: candidateWorkoutIds },
            rpeSubmission: { isNot: null },
          },
          select: { workoutId: true },
        })
      : [];
    const submittedWorkoutIds = new Set(
      submittedWorkoutResults.map((wr) => wr.workoutId)
    );

    // Filter out requests for workouts where RPE was already submitted
    const pendingRpeRequests = candidateRpeRequests.filter(
      (req) => !submittedWorkoutIds.has(req.workoutId)
    );

    // 5. Shape response
    const wellnessRequests = pendingWellnessRequests.map((req) => ({
      id: req.id,
      message: req.message,
      deadline: req.deadline,
      createdAt: req.createdAt,
      coachName: req.coach.name,
    }));

    const rpeRequests = pendingRpeRequests.map((req) => ({
      id: req.id,
      message: req.message,
      deadline: req.deadline,
      createdAt: req.createdAt,
      coachName: req.coach.name,
      workout: {
        id: req.workout.id,
        name: req.workout.name,
        date: req.workout.date,
        type: req.workout.workoutType,
      },
    }));

    return successResponse({ wellnessRequests, rpeRequests });
  } catch (error) {
    console.error("Pending requests error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
