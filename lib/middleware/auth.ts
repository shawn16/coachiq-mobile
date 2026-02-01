import { verifyToken, type JWTPayload } from "@/lib/utils/jwt";

export interface AuthResult {
  userId: string;
  role: "athlete" | "coach";
  teamId: string;
}

export class AuthError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Extracts and validates a JWT from the Authorization header.
 * Call this at the start of any protected API route handler.
 *
 * @param request - The incoming Request object
 * @returns Decoded JWT claims: userId, role, teamId
 * @throws AuthError if the token is missing, malformed, or invalid
 */
export function authenticateRequest(request: Request): AuthResult {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new AuthError("Missing Authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AuthError("Invalid Authorization header format");
  }

  const token = parts[1];

  let payload: JWTPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AuthError("Invalid or expired token");
  }

  return {
    userId: payload.sub,
    role: payload.role,
    teamId: payload.teamId,
  };
}
