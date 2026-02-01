/**
 * Standardized API response helpers for mobile endpoints.
 * All error responses follow the format: { error: { code, message } }
 */

/**
 * Creates a JSON error response with the standard error shape.
 *
 * @param status - HTTP status code (e.g., 400, 401, 409, 429)
 * @param code - Machine-readable error code (e.g., "INVALID_INPUT")
 * @param message - Human-readable error message
 */
export function errorResponse(
  status: number,
  code: string,
  message: string
): Response {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Creates a JSON success response.
 *
 * @param data - Response payload to serialize as JSON
 * @param status - HTTP status code (defaults to 200)
 */
export function successResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
