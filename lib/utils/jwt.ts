import jwt from "jsonwebtoken";

export interface JWTPayload {
  sub: string;
  role: "athlete" | "coach";
  teamId: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Signs a JWT for an authenticated athlete.
 * Token expires in 30 days.
 */
export function signAthleteToken(athleteId: string, teamId: string): string {
  return jwt.sign(
    { sub: athleteId, role: "athlete", teamId },
    getSecret(),
    { expiresIn: "30d" }
  );
}

/**
 * Signs a JWT for an authenticated coach.
 * Token expires in 7 days.
 */
export function signCoachToken(coachId: string, teamId: string): string {
  return jwt.sign(
    { sub: coachId, role: "coach", teamId },
    getSecret(),
    { expiresIn: "7d" }
  );
}

/**
 * Verifies and decodes a JWT token.
 * Throws if the token is invalid or expired.
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, getSecret()) as JWTPayload;
}
