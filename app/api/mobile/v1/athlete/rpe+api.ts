import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";
import { Prisma } from "@prisma/client";

/** UUID v4 format regex */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validated RPE input shape */
interface ValidatedRpeInput {
  workoutResultId: string;
  rpe: number;
  notes?: string;
  rpeRequestId?: string;
}

/**
 * Validates the RPE submission request body.
 * Returns either validated data or an array of error strings.
 */
function validateRpeInput(body: unknown): {
  success: true;
  data: ValidatedRpeInput;
} | {
  success: false;
  errors: string[];
} {
  if (!body || typeof body !== "object") {
    return { success: false, errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];
  const input = body as Record<string, unknown>;

  // workoutResultId: required, UUID
  if (
    typeof input.workoutResultId !== "string" ||
    !UUID_REGEX.test(input.workoutResultId)
  ) {
    errors.push("workoutResultId is required and must be a valid UUID.");
  }

  // rpe: required, Int, 1-10
  if (
    typeof input.rpe !== "number" ||
    !Number.isInteger(input.rpe) ||
    input.rpe < 1 ||
    input.rpe > 10
  ) {
    errors.push("rpe is required and must be an integer between 1 and 10.");
  }

  // notes: optional, String, max 500 chars
  if (input.notes !== undefined && input.notes !== null) {
    if (typeof input.notes !== "string") {
      errors.push("notes must be a string.");
    } else if (input.notes.length > 500) {
      errors.push("notes must be 500 characters or less.");
    }
  }

  // rpeRequestId: optional, UUID
  if (input.rpeRequestId !== undefined && input.rpeRequestId !== null) {
    if (
      typeof input.rpeRequestId !== "string" ||
      !UUID_REGEX.test(input.rpeRequestId)
    ) {
      errors.push("rpeRequestId must be a valid UUID.");
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      workoutResultId: input.workoutResultId as string,
      rpe: input.rpe as number,
      notes: input.notes as string | undefined,
      rpeRequestId: input.rpeRequestId as string | undefined,
    },
  };
}

/**
 * POST /api/mobile/v1/athlete/rpe
 *
 * Authenticated endpoint for athlete RPE submission.
 * Validates input, verifies workout ownership, prevents duplicates,
 * and performs a dual-write to RPESubmission and WorkoutResult.rpe.
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
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Request body must be valid JSON."
      );
    }

    // 3. Validate input
    const validation = validateRpeInput(body);
    if (!validation.success) {
      return errorResponse(400, "VALIDATION_ERROR", validation.errors.join(" "));
    }

    const data = validation.data;

    // 4. Verify WorkoutResult exists and belongs to this athlete
    const workoutResult = await prisma.workoutResult.findUnique({
      where: { id: data.workoutResultId },
    });

    if (!workoutResult || workoutResult.athleteId !== athleteId) {
      return errorResponse(
        400,
        "INVALID_WORKOUT",
        "Workout result not found or does not belong to you."
      );
    }

    // 5. If rpeRequestId provided, verify RPERequest exists and teamId matches
    if (data.rpeRequestId) {
      const rpeRequest = await prisma.rPERequest.findUnique({
        where: { id: data.rpeRequestId },
      });

      if (!rpeRequest || rpeRequest.teamId !== teamId) {
        return errorResponse(
          400,
          "VALIDATION_ERROR",
          "rpeRequestId is invalid or does not belong to your team."
        );
      }
    }

    // 6. Dual-write in a transaction: create RPESubmission + update WorkoutResult.rpe
    let rpeSubmission;
    try {
      const [createdSubmission] = await prisma.$transaction([
        prisma.rPESubmission.create({
          data: {
            workoutResultId: data.workoutResultId,
            athleteId,
            rpe: data.rpe,
            notes: data.notes ?? null,
            rpeRequestId: data.rpeRequestId ?? null,
          },
        }),
        prisma.workoutResult.update({
          where: { id: data.workoutResultId },
          data: { rpe: data.rpe },
        }),
      ]);
      rpeSubmission = createdSubmission;
    } catch (err) {
      // 7. Catch unique constraint violation on RPESubmission.workoutResultId
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return errorResponse(
          409,
          "ALREADY_SUBMITTED",
          "You have already submitted RPE for this workout."
        );
      }
      throw err;
    }

    // 8. Return 201 with created record
    return successResponse({ rpeSubmission }, 201);
  } catch (error) {
    console.error("RPE submission error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
