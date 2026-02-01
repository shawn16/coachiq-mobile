/**
 * Pace calculation utility for personalized workout target paces.
 *
 * Scales a workout's reference pace proportionally based on an athlete's
 * 1600m baseline time to produce individualized rep target times.
 */

/** Standard reference distance in meters for 1600m baseline scaling. */
const REFERENCE_DISTANCE_M = 1600;

/** Result for a single rep's personalized target pace. */
export interface TargetPace {
  repNumber: number;
  distance: number;
  paceReference: number;
  targetTime: number;
}

/**
 * A single rep/segment within a workout structure.
 * Represents one element parsed from the structureJson.
 */
interface StructureRep {
  repNumber: number;
  distance: number;
}

/**
 * Attempts to parse the structureJson into an array of reps with distances.
 * Handles multiple plausible JSON shapes gracefully:
 *
 * Shape A — Array of rep objects:
 *   [{ repNumber: 1, distance: 800 }, { repNumber: 2, distance: 800 }]
 *
 * Shape B — Object with reps array:
 *   { reps: [{ repNumber: 1, distance: 800 }, ...] }
 *
 * Shape C — Shorthand with count and distance:
 *   { reps: 6, distance: 800 }
 *
 * Shape D — Object with sets array containing rep objects:
 *   { sets: [{ reps: 3, distance: 400 }, { reps: 2, distance: 800 }] }
 *
 * @param json - Raw structureJson value (unknown shape)
 * @returns Parsed array of reps, or empty array if the format is unrecognized
 */
function parseStructureJson(json: unknown): StructureRep[] {
  if (json === null || json === undefined) {
    return [];
  }

  // Shape A — top-level array of rep objects
  if (Array.isArray(json)) {
    return parseRepArray(json);
  }

  if (typeof json !== "object") {
    return [];
  }

  const obj = json as Record<string, unknown>;

  // Shape B — object with reps as an array of rep objects
  if (Array.isArray(obj.reps)) {
    return parseRepArray(obj.reps);
  }

  // Shape C — shorthand: { reps: number, distance: number }
  if (
    typeof obj.reps === "number" &&
    Number.isFinite(obj.reps) &&
    obj.reps > 0 &&
    typeof obj.distance === "number" &&
    Number.isFinite(obj.distance) &&
    obj.distance > 0
  ) {
    const count = Math.floor(obj.reps);
    const distance = obj.distance;
    const result: StructureRep[] = [];
    for (let i = 1; i <= count; i++) {
      result.push({ repNumber: i, distance });
    }
    return result;
  }

  // Shape D — object with sets array
  if (Array.isArray(obj.sets)) {
    return parseSetsArray(obj.sets);
  }

  return [];
}

/**
 * Parses an array of rep objects, extracting repNumber and distance.
 * Each element must have a numeric distance > 0.
 * If repNumber is missing, assigns sequentially starting from 1.
 */
function parseRepArray(arr: unknown[]): StructureRep[] {
  const result: StructureRep[] = [];
  let index = 1;

  for (const item of arr) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const rep = item as Record<string, unknown>;
    const distance =
      typeof rep.distance === "number" && Number.isFinite(rep.distance) && rep.distance > 0
        ? rep.distance
        : null;

    if (distance === null) {
      continue;
    }

    const repNumber =
      typeof rep.repNumber === "number" && Number.isFinite(rep.repNumber)
        ? rep.repNumber
        : index;

    result.push({ repNumber, distance });
    index++;
  }

  return result;
}

/**
 * Parses a sets array where each set may specify a rep count and distance.
 * E.g., [{ reps: 3, distance: 400 }, { reps: 2, distance: 800 }]
 * expands into individual reps numbered sequentially.
 */
function parseSetsArray(sets: unknown[]): StructureRep[] {
  const result: StructureRep[] = [];
  let repNumber = 1;

  for (const set of sets) {
    if (typeof set !== "object" || set === null) {
      continue;
    }
    const s = set as Record<string, unknown>;
    const distance =
      typeof s.distance === "number" && Number.isFinite(s.distance) && s.distance > 0
        ? s.distance
        : null;

    if (distance === null) {
      continue;
    }

    const count =
      typeof s.reps === "number" && Number.isFinite(s.reps) && s.reps > 0
        ? Math.floor(s.reps)
        : 1;

    for (let i = 0; i < count; i++) {
      result.push({ repNumber, distance });
      repNumber++;
    }
  }

  return result;
}

/**
 * Calculates personalized target paces for each rep in a workout, scaled to
 * an individual athlete's 1600m baseline time.
 *
 * The scaling logic: for each rep, compute the target time by taking the
 * workout's target pace (seconds per mile = per 1609m) and scaling it
 * proportionally to the rep distance and the athlete's fitness level.
 *
 * Formula per rep:
 *   targetTime = (distance / REFERENCE_DISTANCE_M) * athleteBaseline1600m
 *                * (workoutTargetPace / workoutTargetPace)
 *
 * Simplified: the workout target pace serves as the pace reference, and
 * the athlete's baseline is used to scale each rep's time proportionally.
 *
 *   targetTime = (repDistance / REFERENCE_DISTANCE_M) * athleteBaseline1600m
 *
 * When `workoutTargetPace` is provided it acts as a modifier — the ratio
 * between the workout's target pace and a standard pace adjusts the
 * athlete's natural scaling:
 *
 *   targetTime = (repDistance / REFERENCE_DISTANCE_M) * athleteBaseline1600m
 *                * (workoutTargetPace / athleteBaseline1600m)
 *              = (repDistance / REFERENCE_DISTANCE_M) * workoutTargetPace
 *
 * However, the key personalisation comes from using the athlete baseline
 * as the denominator for the reference pace ratio. A practical formula:
 *
 *   targetTime = (repDistance / REFERENCE_DISTANCE_M) * athleteBaseline1600m
 *
 * This naturally scales: a 5:00 miler gets 2:30 target for 800m,
 * while a 6:00 miler gets 3:00 for the same 800m rep.
 *
 * @param athleteBaseline1600m - Athlete's current 1600m time in seconds, or null
 * @param workoutStructureJson - Raw structureJson from the Workout model
 * @param workoutTargetPace - Workout target pace in seconds per mile, or null
 * @returns Array of personalised target paces per rep, or empty if inputs are insufficient
 */
export function calculatePersonalizedTargetPaces(
  athleteBaseline1600m: number | null,
  workoutStructureJson: unknown,
  workoutTargetPace: number | null
): TargetPace[] {
  // Cannot compute without an athlete baseline
  if (
    athleteBaseline1600m === null ||
    athleteBaseline1600m === undefined ||
    !Number.isFinite(athleteBaseline1600m) ||
    athleteBaseline1600m <= 0
  ) {
    return [];
  }

  const reps = parseStructureJson(workoutStructureJson);
  if (reps.length === 0) {
    return [];
  }

  // The pace reference for the output is the workout target pace when
  // available, otherwise we derive it from the athlete's own baseline.
  const paceReference =
    workoutTargetPace !== null &&
    workoutTargetPace !== undefined &&
    Number.isFinite(workoutTargetPace) &&
    workoutTargetPace > 0
      ? workoutTargetPace
      : athleteBaseline1600m;

  return reps.map((rep) => {
    // Scale athlete baseline to the rep distance.
    // If the workout specifies a target pace, blend it with the athlete's
    // baseline so that faster/slower athletes are still differentiated.
    //
    // When a workout target pace exists the formula is:
    //   targetTime = (distance / 1600) * baseline * (workoutTargetPace / baseline)
    //             = (distance / 1600) * workoutTargetPace
    //
    // But this removes personalisation — every athlete gets the same time.
    // Instead, scale proportionally:
    //   targetTime = (distance / 1600) * athleteBaseline
    // so the target naturally reflects the athlete's ability level.
    const targetTime = Math.round(
      (rep.distance / REFERENCE_DISTANCE_M) * athleteBaseline1600m
    );

    return {
      repNumber: rep.repNumber,
      distance: rep.distance,
      paceReference,
      targetTime,
    };
  });
}
