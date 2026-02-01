import { prisma } from "@/lib/db";
import { authenticateRequest, AuthError } from "@/lib/middleware/auth";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/** Request body shape for device token registration. */
interface RegisterDeviceRequest {
  token?: string;
  platform?: string;
}

/** Validates that a token matches the Expo push token format. */
function isValidExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[.+\]$/.test(token);
}

/**
 * POST /api/mobile/v1/auth/register-device
 *
 * Protected endpoint for registering a device's Expo push token.
 * Requires a valid JWT (athlete or coach). Creates or updates a
 * DeviceToken record so the server can deliver push notifications.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Authenticate request — extract userId, role, teamId from JWT
    let auth;
    try {
      auth = authenticateRequest(request);
    } catch (error) {
      if (error instanceof AuthError) {
        return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
      }
      throw error;
    }

    const { userId, role } = auth;

    // 2. Parse request body
    let body: RegisterDeviceRequest;
    try {
      body = (await request.json()) as RegisterDeviceRequest;
    } catch {
      return errorResponse(400, "INVALID_INPUT", "Request body must be valid JSON.");
    }

    const { token } = body;

    // 3. Validate token format
    if (!token || !isValidExpoPushToken(token)) {
      return errorResponse(
        400,
        "INVALID_TOKEN_FORMAT",
        "Invalid push token format."
      );
    }

    // 4. Upsert the DeviceToken record
    const deviceToken = await prisma.deviceToken.upsert({
      where: { userId_token: { userId, token } },
      create: {
        userId,
        userRole: role,
        token,
        isActive: true,
      },
      update: {
        isActive: true,
        userRole: role,
      },
    });

    // 5. Return success response
    return successResponse({
      success: true,
      deviceId: deviceToken.id,
    });
  } catch (error) {
    console.error("Device registration error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
