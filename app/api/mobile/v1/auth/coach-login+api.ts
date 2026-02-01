import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { signCoachToken } from "@/lib/utils/jwt";
import { errorResponse, successResponse } from "@/lib/utils/errors";

/** Request body shape for coach email/password login. */
interface CoachLoginRequest {
  email?: string;
  password?: string;
}

/** Validates that a string looks like an email address. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/mobile/v1/auth/coach-login
 *
 * Public endpoint for coach authentication via email/password.
 * Verifies credentials against Supabase Auth, then looks up the
 * coach record in the database and returns a JWT with coach profile.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse request body
    let body: CoachLoginRequest;
    try {
      body = (await request.json()) as CoachLoginRequest;
    } catch {
      return errorResponse(400, "INVALID_INPUT", "Request body must be valid JSON.");
    }

    const { email, password } = body;

    // 2. Validate required fields
    if (!email || !password || !isValidEmail(email) || password.length === 0) {
      return errorResponse(
        400,
        "INVALID_INPUT",
        "Email and password required."
      );
    }

    // 3. Verify credentials against Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return errorResponse(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }

    // 4. Look up Coach record in our database
    const coach = await prisma.coach.findUnique({
      where: { email },
      include: { teams: { take: 1, orderBy: { createdAt: "desc" } } },
    });

    if (!coach) {
      return errorResponse(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }

    // 5. Determine teamId from the coach's most recent team
    const teamId = coach.teams[0]?.id ?? "";

    // 6. Sign JWT
    const token = signCoachToken(coach.id, teamId);

    // 7. Return success response with coach profile
    return successResponse({
      token,
      coach: {
        id: coach.id,
        name: coach.name,
        email: coach.email,
        teamId: teamId || null,
      },
    });
  } catch (error) {
    console.error("Coach login error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again."
    );
  }
}
