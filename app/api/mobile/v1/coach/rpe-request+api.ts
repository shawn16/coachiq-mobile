import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";
import { sendRpeRequestNotifications } from "@/lib/utils/push-notifications";

/** UUID v4 format regex */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validated RPE request input shape */
interface ValidatedRpeRequestInput {
  teamId: string;
  workoutId: string;
  groupId?: string;
  deadline: string;
  message?: string;
}

/**
 * Validates the coach RPE request body.
 * Returns either validated data or an array of error strings.
 */
function validateRpeRequestInput(body: unknown): {
  success: true;
  data: ValidatedRpeRequestInput;
} | {
  success: false;
  errors: string[];
} {
  if (!body || typeof body !== "object") {
    return { success: false, errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];
  const input = body as Record<string, unknown>;

  // teamId: required, UUID
  if (
    typeof input.teamId !== "string" ||
    !UUID_REGEX.test(input.teamId)
  ) {
    errors.push("teamId is required and must be a valid UUID.");
  }

  // workoutId: required, UUID
  if (
    typeof input.workoutId !== "string" ||
    !UUID_REGEX.test(input.workoutId)
  ) {
    errors.push("workoutId is required and must be a valid UUID.");
  }

  // groupId: optional, UUID
  if (input.groupId !== undefined && input.groupId !== null) {
    if (
      typeof input.groupId !== "string" ||
      !UUID_REGEX.test(input.groupId)
    ) {
      errors.push("groupId must be a valid UUID.");
    }
  }

  // deadline: required, ISO datetime string
  if (typeof input.deadline !== "string") {
    errors.push("deadline is required and must be an ISO datetime string.");
  } else {
    const parsed = new Date(input.deadline);
    if (isNaN(parsed.getTime())) {
      errors.push("deadline must be a valid ISO datetime string.");
    }
  }

  // message: optional, string, max 200 characters
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== "string") {
      errors.push("message must be a string.");
    } else if (input.message.length > 200) {
      errors.push("message must be 200 characters or less.");
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      teamId: input.teamId as string,
      workoutId: input.workoutId as string,
      groupId: input.groupId as string | undefined,
      deadline: input.deadline as string,
      message: input.message as string | undefined,
    },
  };
}

/**
 * POST /api/mobile/v1/coach/rpe-request
 *
 * Authenticated endpoint for coach to create an RPE rating request.
 * Validates ownership of team, workout, and optional group, creates
 * an RPERequest record, and triggers push notifications to targeted athletes.
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

    if (auth.role !== "coach") {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }

    const coachId = auth.userId;

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
    const validation = validateRpeRequestInput(body);
    if (!validation.success) {
      return errorResponse(400, "VALIDATION_ERROR", validation.errors.join(" "));
    }

    const data = validation.data;

    // 4. Verify team belongs to this coach
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
    });

    if (!team || team.coachId !== coachId) {
      return errorResponse(
        400,
        "INVALID_TEAM",
        "Team not found or does not belong to you."
      );
    }

    // 5. Verify workout belongs to the team
    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
    });

    if (!workout || workout.teamId !== data.teamId) {
      return errorResponse(
        400,
        "INVALID_WORKOUT",
        "Workout not found or does not belong to this team."
      );
    }

    // 6. If groupId provided, verify it belongs to the team
    if (data.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
      });

      if (!group || group.teamId !== data.teamId) {
        return errorResponse(
          400,
          "INVALID_GROUP",
          "Group not found or does not belong to this team."
        );
      }
    }

    // 7. Verify deadline is in the future
    const deadline = new Date(data.deadline);
    if (deadline <= new Date()) {
      return errorResponse(
        400,
        "INVALID_DEADLINE",
        "Deadline must be in the future."
      );
    }

    // 8. Create RPERequest record
    const rpeRequest = await prisma.rPERequest.create({
      data: {
        teamId: data.teamId,
        workoutId: data.workoutId,
        groupId: data.groupId ?? null,
        coachId,
        message: data.message ?? null,
        deadline,
      },
    });

    // 9. Trigger push notifications (fire-and-forget via the helper)
    const notificationsSent = await sendRpeRequestNotifications({
      teamId: data.teamId,
      groupId: data.groupId ?? null,
      workoutName: workout.name,
      requestId: rpeRequest.id,
      workoutId: data.workoutId,
    });

    // 10. Return 201 with created record and notification count
    return successResponse(
      {
        request: rpeRequest,
        notificationsSent,
      },
      201
    );
  } catch (error) {
    console.error("Coach RPE request error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
