import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";
import { validateWellnessInput } from "@/lib/utils/wellness-validation";
import { evaluateWellnessAlerts } from "@/lib/utils/alert-engine";
import { sendCriticalAlertNotification } from "@/lib/utils/push-notifications";
import { Prisma } from "@prisma/client";

/**
 * POST /api/mobile/v1/athlete/wellness
 *
 * Authenticated endpoint for athlete wellness check-in submission.
 * Validates all 9 wellness categories, enforces one-per-day,
 * triggers the alert engine, and optionally links to a coach request.
 */
export async function POST(request: Request): Promise<Response> {
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

    // 2. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
    }

    // 3. Validate input
    const validation = validateWellnessInput(body);
    if (!validation.success) {
      return errorResponse(400, "VALIDATION_ERROR", validation.errors.join(" "));
    }

    const data = validation.data;

    // 4. If wellnessRequestId provided, verify it exists and belongs to athlete's team
    if (data.wellnessRequestId) {
      const wellnessRequest = await prisma.wellnessRequest.findUnique({
        where: { id: data.wellnessRequestId },
      });

      if (!wellnessRequest || wellnessRequest.teamId !== teamId) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          "wellnessRequestId is invalid or does not belong to your team."
        );
      }
    }

    // 5. Query athlete name and prior submission count for alert engine
    const [athlete, priorSubmissionCount] = await Promise.all([
      prisma.athlete.findUniqueOrThrow({
        where: { id: athleteId },
        select: { firstName: true, lastName: true },
      }),
      prisma.wellnessCheck.count({ where: { athleteId } }),
    ]);

    const athleteName = `${athlete.firstName} ${athlete.lastName}`;

    // 6. Create WellnessCheck record
    //    - date is today (Date only) for the unique constraint
    //    - Map "energy" input field to "energyLevel" DB column
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let wellnessCheck;
    try {
      wellnessCheck = await prisma.wellnessCheck.create({
        data: {
          athleteId,
          date: today,
          sleepHours: data.sleepHours,
          sleepQuality: data.sleepQuality,
          hydration: data.hydration,
          energyLevel: data.energy,
          motivation: data.motivation,
          focus: data.focus,
          foodTiming: data.foodTiming,
          sorenessAreas: data.sorenessAreas,
          illnessSymptoms: data.illnessSymptoms,
          notes: data.notes ?? null,
          sorenessNotes: data.sorenessNotes ?? null,
          illnessNotes: data.illnessNotes ?? null,
          wellnessRequestId: data.wellnessRequestId ?? null,
        },
      });
    } catch (err) {
      // 7. Catch unique constraint violation on [athleteId, date]
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return errorResponse(
          409,
          "ALREADY_SUBMITTED",
          "You have already submitted a wellness check today."
        );
      }
      throw err;
    }

    // 8. Run alert engine against submission data
    const alertResults = evaluateWellnessAlerts(
      {
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        hydration: data.hydration,
        energy: data.energy,
        motivation: data.motivation,
        focus: data.focus,
        foodTiming: data.foodTiming,
        sorenessAreas: data.sorenessAreas,
        illnessSymptoms: data.illnessSymptoms,
      },
      athleteName,
      priorSubmissionCount
    );

    // 9. If alerts triggered, batch-create WellnessAlert records
    if (alertResults.length > 0) {
      await prisma.wellnessAlert.createMany({
        data: alertResults.map((alert) => ({
          wellnessCheckId: wellnessCheck.id,
          athleteId,
          teamId,
          ruleId: alert.ruleId,
          severity: alert.severity,
          message: alert.message,
          details: alert.details as Prisma.InputJsonValue,
        })),
      });

      // 9b. If any critical alerts, send push notification to the coach (fire-and-forget)
      const criticalAlerts = alertResults.filter(
        (a) => a.severity === "critical"
      );

      if (criticalAlerts.length > 0) {
        // Query the created alert records to get their IDs for the push payload
        const createdAlerts = await prisma.wellnessAlert.findMany({
          where: {
            wellnessCheckId: wellnessCheck.id,
            severity: "critical",
          },
          select: { id: true, message: true },
        });

        // Look up the coach for this team
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          select: { coachId: true },
        });

        if (team?.coachId && createdAlerts.length > 0) {
          for (const alert of createdAlerts) {
            void sendCriticalAlertNotification({
              coachId: team.coachId,
              athleteName,
              alertMessage: alert.message,
              alertId: alert.id,
            });
          }
        }
      }
    }

    // 10. Return 201 with created record and alerts
    return successResponse(
      {
        wellnessCheck,
        alerts: alertResults.map((alert) => ({
          ruleId: alert.ruleId,
          severity: alert.severity,
          message: alert.message,
        })),
      },
      201
    );
  } catch (error) {
    console.error("Wellness submission error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
