/**
 * Wellness check-in input validation.
 * Validates and types all fields for the POST /api/mobile/v1/athlete/wellness endpoint.
 */

/** Allowed values for the foodTiming field. */
export const FOOD_TIMING_VALUES = [
  "havent_eaten",
  "just_ate",
  "1_2_hours",
  "3_plus_hours",
] as const;

/** Allowed body areas for the sorenessAreas field. */
export const SORENESS_AREAS = [
  "quads",
  "hamstrings",
  "calves",
  "shins",
  "knees",
  "ankles",
  "feet",
  "hips",
  "lower_back",
  "upper_back",
  "shoulders",
  "neck",
] as const;

/** Allowed values for the illnessSymptoms field. */
export const ILLNESS_SYMPTOMS = [
  "headache",
  "sore_throat",
  "congestion",
  "cough",
  "nausea",
  "fever",
  "fatigue",
  "body_aches",
  "dizziness",
] as const;

export type FoodTiming = (typeof FOOD_TIMING_VALUES)[number];
export type SorenessArea = (typeof SORENESS_AREAS)[number];
export type IllnessSymptom = (typeof ILLNESS_SYMPTOMS)[number];

/** Shape of validated wellness input data. */
export interface ValidatedWellnessInput {
  sleepHours: number;
  sleepQuality: number;
  hydration: number;
  energy: number;
  motivation: number;
  focus: number;
  foodTiming: FoodTiming;
  sorenessAreas: SorenessArea[];
  illnessSymptoms: IllnessSymptom[];
  notes?: string;
  sorenessNotes?: string;
  illnessNotes?: string;
  wellnessRequestId?: string;
}

/** Result of wellness input validation. */
export type WellnessValidationResult =
  | { success: true; data: ValidatedWellnessInput }
  | { success: false; errors: string[] };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isIntInRange(value: unknown, min: number, max: number): boolean {
  return isInt(value) && value >= min && value <= max;
}

/**
 * Validates wellness check-in input from the request body.
 * Returns either a typed validated data object or an array of field-specific error strings.
 *
 * @param body - Raw request body (unknown shape)
 * @returns Validation result with typed data or error messages
 */
export function validateWellnessInput(
  body: unknown
): WellnessValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { success: false, errors: ["Request body must be a JSON object."] };
  }

  const input = body as Record<string, unknown>;

  // sleepHours: required, Float, 4.0–12.0, 0.5 increments
  if (
    typeof input.sleepHours !== "number" ||
    !Number.isFinite(input.sleepHours) ||
    input.sleepHours < 4.0 ||
    input.sleepHours > 12.0 ||
    (input.sleepHours * 2) % 1 !== 0
  ) {
    errors.push(
      "sleepHours must be a number between 4.0 and 12.0 in 0.5 increments."
    );
  }

  // sleepQuality: required, Int, 1–10
  if (!isIntInRange(input.sleepQuality, 1, 10)) {
    errors.push("sleepQuality must be an integer between 1 and 10.");
  }

  // hydration: required, Int, 1–10
  if (!isIntInRange(input.hydration, 1, 10)) {
    errors.push("hydration must be an integer between 1 and 10.");
  }

  // energy: required, Int, 1–10
  if (!isIntInRange(input.energy, 1, 10)) {
    errors.push("energy must be an integer between 1 and 10.");
  }

  // motivation: required, Int, 1–10
  if (!isIntInRange(input.motivation, 1, 10)) {
    errors.push("motivation must be an integer between 1 and 10.");
  }

  // focus: required, Int, 1–10
  if (!isIntInRange(input.focus, 1, 10)) {
    errors.push("focus must be an integer between 1 and 10.");
  }

  // foodTiming: required, one of allowed values
  if (
    typeof input.foodTiming !== "string" ||
    !(FOOD_TIMING_VALUES as readonly string[]).includes(input.foodTiming)
  ) {
    errors.push(
      `foodTiming must be one of: ${FOOD_TIMING_VALUES.join(", ")}.`
    );
  }

  // sorenessAreas: required, String[], each from allowed set
  if (!Array.isArray(input.sorenessAreas)) {
    errors.push("sorenessAreas must be an array.");
  } else {
    const invalidAreas = input.sorenessAreas.filter(
      (area: unknown) =>
        typeof area !== "string" ||
        !(SORENESS_AREAS as readonly string[]).includes(area)
    );
    if (invalidAreas.length > 0) {
      errors.push(
        `sorenessAreas contains invalid values: ${invalidAreas.join(", ")}. Allowed: ${SORENESS_AREAS.join(", ")}.`
      );
    }
  }

  // illnessSymptoms: required, String[], each from allowed set
  if (!Array.isArray(input.illnessSymptoms)) {
    errors.push("illnessSymptoms must be an array.");
  } else {
    const invalidSymptoms = input.illnessSymptoms.filter(
      (symptom: unknown) =>
        typeof symptom !== "string" ||
        !(ILLNESS_SYMPTOMS as readonly string[]).includes(symptom)
    );
    if (invalidSymptoms.length > 0) {
      errors.push(
        `illnessSymptoms contains invalid values: ${invalidSymptoms.join(", ")}. Allowed: ${ILLNESS_SYMPTOMS.join(", ")}.`
      );
    }
  }

  // notes: optional, String, max 1000 chars
  if (input.notes !== undefined && input.notes !== null) {
    if (typeof input.notes !== "string") {
      errors.push("notes must be a string.");
    } else if (input.notes.length > 1000) {
      errors.push("notes must be at most 1000 characters.");
    }
  }

  // sorenessNotes: optional, String, max 500 chars
  if (input.sorenessNotes !== undefined && input.sorenessNotes !== null) {
    if (typeof input.sorenessNotes !== "string") {
      errors.push("sorenessNotes must be a string.");
    } else if (input.sorenessNotes.length > 500) {
      errors.push("sorenessNotes must be at most 500 characters.");
    }
  }

  // illnessNotes: optional, String, max 500 chars
  if (input.illnessNotes !== undefined && input.illnessNotes !== null) {
    if (typeof input.illnessNotes !== "string") {
      errors.push("illnessNotes must be a string.");
    } else if (input.illnessNotes.length > 500) {
      errors.push("illnessNotes must be at most 500 characters.");
    }
  }

  // wellnessRequestId: optional, String, UUID format
  if (
    input.wellnessRequestId !== undefined &&
    input.wellnessRequestId !== null
  ) {
    if (
      typeof input.wellnessRequestId !== "string" ||
      !UUID_REGEX.test(input.wellnessRequestId)
    ) {
      errors.push("wellnessRequestId must be a valid UUID.");
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      sleepHours: input.sleepHours as number,
      sleepQuality: input.sleepQuality as number,
      hydration: input.hydration as number,
      energy: input.energy as number,
      motivation: input.motivation as number,
      focus: input.focus as number,
      foodTiming: input.foodTiming as FoodTiming,
      sorenessAreas: input.sorenessAreas as SorenessArea[],
      illnessSymptoms: input.illnessSymptoms as IllnessSymptom[],
      ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
      ...(typeof input.sorenessNotes === "string"
        ? { sorenessNotes: input.sorenessNotes }
        : {}),
      ...(typeof input.illnessNotes === "string"
        ? { illnessNotes: input.illnessNotes }
        : {}),
      ...(typeof input.wellnessRequestId === "string"
        ? { wellnessRequestId: input.wellnessRequestId }
        : {}),
    },
  };
}
