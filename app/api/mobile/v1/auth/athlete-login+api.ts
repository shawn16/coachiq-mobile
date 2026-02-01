import { prisma } from "@/lib/db";
import { signAthleteToken } from "@/lib/utils/jwt";
import { errorResponse, successResponse } from "@/lib/utils/errors";
import { checkRateLimit, resetRateLimit } from "@/lib/utils/rate-limit";

/** Request body shape for athlete PIN login. */
interface AthleteLoginRequest {
  pin?: string;
}

/** Validates that a PIN is exactly 6 alphanumeric characters. */
function isValidPin(pin: string): boolean {
  return /^[A-Za-z0-9]{6}$/.test(pin);
}

/** Extracts a rate-limit key from the request (IP address or fallback). */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown-ip";
}

/**
 * POST /api/mobile/v1/auth/athlete-login
 *
 * Public endpoint for athlete PIN-based activation.
 * Validates a 6-character PIN, activates the athlete account,
 * and returns a JWT token with athlete profile data.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse request body
    let body: AthleteLoginRequest;
    try {
      body = (await request.json()) as AthleteLoginRequest;
    } catch {
      return errorResponse(400, "INVALID_INPUT", "Request body must be valid JSON.");
    }

    const { pin } = body;

    // 2. Validate PIN format
    if (!pin || !isValidPin(pin)) {
      return errorResponse(
        400,
        "INVALID_INPUT",
        "PIN must be exactly 6 alphanumeric characters."
      );
    }

    const normalizedPin = pin.toUpperCase();

    // 3. Check rate limit
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      return errorResponse(
        429,
        "RATE_LIMITED",
        "Too many attempts. Please wait 15 minutes."
      );
    }

    // 4. Look up athlete by invite code
    const athlete = await prisma.athlete.findFirst({
      where: { inviteCode: normalizedPin },
    });

    // 5. No athlete found
    if (!athlete) {
      return errorResponse(
        401,
        "INVALID_PIN",
        "Invalid PIN. Please check with your coach."
      );
    }

    // 6. Check if PIN is expired
    if (athlete.inviteCodeExpiry && athlete.inviteCodeExpiry < new Date()) {
      return errorResponse(
        401,
        "PIN_EXPIRED",
        "This PIN has expired. Please ask your coach for a new one."
      );
    }

    // 7. Check if athlete is already active
    if (athlete.status === "active") {
      return errorResponse(
        409,
        "ALREADY_ACTIVE",
        "This account is already activated."
      );
    }

    // 8. Activate athlete: set status, clear invite code and expiry
    const updatedAthlete = await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        status: "active",
        inviteCode: null,
        inviteCodeExpiry: null,
      },
    });

    // 9. Reset rate limit on success
    resetRateLimit(clientIp);

    // 10. Sign JWT
    const token = signAthleteToken(updatedAthlete.id, updatedAthlete.teamId);

    // 11. Return success response
    return successResponse({
      token,
      athlete: {
        id: updatedAthlete.id,
        firstName: updatedAthlete.firstName,
        lastName: updatedAthlete.lastName,
        teamId: updatedAthlete.teamId,
        groupId: updatedAthlete.groupId,
      },
    });
  } catch (error) {
    console.error("Athlete login error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
