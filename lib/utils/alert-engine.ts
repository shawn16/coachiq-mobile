/**
 * Wellness alert engine — pure function that evaluates wellness submission data
 * and returns any triggered alerts based on predefined threshold rules.
 *
 * Called synchronously after a successful wellness check-in to generate
 * WellnessAlert records for coach visibility.
 *
 * Rules are kept in a declarative data structure so new rules can be added easily.
 */

import type {
  FoodTiming,
  SorenessArea,
  IllnessSymptom,
} from "./wellness-validation";

/** Wellness data shape accepted by the alert engine. */
export interface WellnessData {
  sleepHours: number;
  sleepQuality: number;
  hydration: number;
  energy: number;
  motivation: number;
  focus: number;
  foodTiming: FoodTiming;
  sorenessAreas: SorenessArea[];
  illnessSymptoms: IllnessSymptom[];
}

/** Severity levels for wellness alerts, from most to least urgent. */
export type AlertSeverity = "critical" | "high" | "medium" | "low";

/** Result of a single alert rule evaluation. */
export interface AlertResult {
  ruleId: string;
  severity: AlertSeverity;
  message: string;
  details: Record<string, unknown>;
}

/** Internal rule definition used by the declarative rule engine. */
interface AlertRule {
  id: string;
  severity: AlertSeverity;
  evaluate: (data: WellnessData, priorSubmissionCount: number) => boolean;
  message: (data: WellnessData, athleteName: string) => string;
  details: (data: WellnessData) => Record<string, unknown>;
}

/**
 * Declarative alert rules. Each rule is evaluated independently — no short-circuiting
 * or else-if chains between rules at different severity levels for the same metric.
 * A single submission can trigger multiple alerts at different severity levels.
 */
const ALERT_RULES: AlertRule[] = [
  // ── CRITICAL rules (6) ──────────────────────────────────────────────

  {
    id: "food_critical",
    severity: "critical",
    evaluate: (data) => data.foodTiming === "havent_eaten",
    message: (_data, name) => `${name} hasn't eaten before practice`,
    details: (data) => ({ foodTiming: data.foodTiming }),
  },
  {
    id: "hydration_critical",
    severity: "critical",
    evaluate: (data) => data.hydration <= 3,
    message: (data, name) =>
      `${name} reports very low hydration (${data.hydration}/10)`,
    details: (data) => ({ hydration: data.hydration, threshold: 3 }),
  },
  {
    id: "energy_critical",
    severity: "critical",
    evaluate: (data) => data.energy <= 3,
    message: (data, name) =>
      `${name} reports very low energy (${data.energy}/10)`,
    details: (data) => ({ energy: data.energy, threshold: 3 }),
  },
  {
    id: "sleep_hours_critical",
    severity: "critical",
    evaluate: (data) => data.sleepHours <= 4.0,
    message: (data, name) =>
      `${name} got only ${data.sleepHours} hours of sleep`,
    details: (data) => ({ sleepHours: data.sleepHours, threshold: 4.0 }),
  },
  {
    id: "illness_critical",
    severity: "critical",
    evaluate: (data) => data.illnessSymptoms.length >= 3,
    message: (data, name) =>
      `${name} reports ${data.illnessSymptoms.length} illness symptoms: ${data.illnessSymptoms.join(", ")}`,
    details: (data) => ({
      illnessSymptomCount: data.illnessSymptoms.length,
      illnessSymptoms: data.illnessSymptoms,
      threshold: 3,
    }),
  },
  {
    id: "compound_critical",
    severity: "critical",
    evaluate: (data) => data.energy <= 4 && data.sleepHours <= 5.0,
    message: (_data, name) =>
      `${name} has low energy AND poor sleep — possible overtraining`,
    details: (data) => ({
      energy: data.energy,
      energyThreshold: 4,
      sleepHours: data.sleepHours,
      sleepHoursThreshold: 5.0,
    }),
  },

  // ── HIGH rules (5) ──────────────────────────────────────────────────

  {
    id: "soreness_high",
    severity: "high",
    evaluate: (data) => data.sorenessAreas.length >= 3,
    message: (data, name) =>
      `${name} reports soreness in ${data.sorenessAreas.length} areas: ${data.sorenessAreas.join(", ")}`,
    details: (data) => ({
      sorenessAreaCount: data.sorenessAreas.length,
      sorenessAreas: data.sorenessAreas,
      threshold: 3,
    }),
  },
  {
    id: "hydration_high",
    severity: "high",
    evaluate: (data) => data.hydration >= 4 && data.hydration <= 5,
    message: (data, name) =>
      `${name} reports below-average hydration (${data.hydration}/10)`,
    details: (data) => ({ hydration: data.hydration, threshold: "4-5" }),
  },
  {
    id: "sleep_quality_high",
    severity: "high",
    evaluate: (data) => data.sleepQuality <= 4,
    message: (data, name) =>
      `${name} reports poor sleep quality (${data.sleepQuality}/10)`,
    details: (data) => ({ sleepQuality: data.sleepQuality, threshold: 4 }),
  },
  {
    id: "illness_high",
    severity: "high",
    evaluate: (data) =>
      data.illnessSymptoms.length >= 1 && data.illnessSymptoms.length <= 2,
    message: (data, name) =>
      `${name} reports illness symptoms: ${data.illnessSymptoms.join(", ")}`,
    details: (data) => ({
      illnessSymptomCount: data.illnessSymptoms.length,
      illnessSymptoms: data.illnessSymptoms,
      threshold: "1-2",
    }),
  },
  {
    id: "sleep_hours_high",
    severity: "high",
    evaluate: (data) => data.sleepHours > 4.0 && data.sleepHours <= 5.0,
    message: (data, name) =>
      `${name} got only ${data.sleepHours} hours of sleep`,
    details: (data) => ({ sleepHours: data.sleepHours, threshold: "4.1-5.0" }),
  },

  // ── MEDIUM rules (4) ────────────────────────────────────────────────

  {
    id: "motivation_medium",
    severity: "medium",
    evaluate: (data) => data.motivation <= 4,
    message: (data, name) =>
      `${name} reports low motivation (${data.motivation}/10)`,
    details: (data) => ({ motivation: data.motivation, threshold: 4 }),
  },
  {
    id: "focus_medium",
    severity: "medium",
    evaluate: (data) => data.focus <= 4,
    message: (data, name) =>
      `${name} reports low focus (${data.focus}/10)`,
    details: (data) => ({ focus: data.focus, threshold: 4 }),
  },
  {
    id: "food_timing_medium",
    severity: "medium",
    evaluate: (data) => data.foodTiming === "just_ate",
    message: (_data, name) => `${name} just ate before practice`,
    details: (data) => ({ foodTiming: data.foodTiming }),
  },
  {
    id: "sleep_quality_medium",
    severity: "medium",
    evaluate: (data) => data.sleepQuality >= 5 && data.sleepQuality <= 6,
    message: (data, name) =>
      `${name} reports average sleep quality (${data.sleepQuality}/10)`,
    details: (data) => ({
      sleepQuality: data.sleepQuality,
      threshold: "5-6",
    }),
  },

  // ── LOW rules (3) ───────────────────────────────────────────────────

  {
    id: "soreness_low",
    severity: "low",
    evaluate: (data) =>
      data.sorenessAreas.length >= 1 && data.sorenessAreas.length <= 2,
    message: (data, name) =>
      `${name} reports minor soreness: ${data.sorenessAreas.join(", ")}`,
    details: (data) => ({
      sorenessAreaCount: data.sorenessAreas.length,
      sorenessAreas: data.sorenessAreas,
      threshold: "1-2",
    }),
  },
  {
    id: "energy_low",
    severity: "low",
    evaluate: (data) => data.energy >= 4 && data.energy <= 5,
    message: (data, name) =>
      `${name} reports below-average energy (${data.energy}/10)`,
    details: (data) => ({ energy: data.energy, threshold: "4-5" }),
  },
  {
    id: "first_submission",
    severity: "low",
    evaluate: (_data, priorSubmissionCount) => priorSubmissionCount === 0,
    message: (_data, name) => `First wellness check-in from ${name}`,
    details: () => ({ priorSubmissionCount: 0 }),
  },
];

/**
 * Evaluates wellness submission data against all alert rules and returns
 * any triggered alerts. This is a pure function with no side effects.
 *
 * All rules are evaluated independently — no short-circuiting. A single
 * submission can trigger multiple alerts at different severity levels.
 *
 * @param data - Validated wellness submission data (including foodTiming)
 * @param athleteName - Full name of the athlete for message rendering
 * @param priorSubmissionCount - Number of prior wellness submissions (0 = first ever)
 * @returns Array of triggered alerts (empty if no rules fire)
 */
export function evaluateWellnessAlerts(
  data: WellnessData,
  athleteName: string,
  priorSubmissionCount: number
): AlertResult[] {
  const alerts: AlertResult[] = [];

  for (const rule of ALERT_RULES) {
    if (rule.evaluate(data, priorSubmissionCount)) {
      alerts.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message(data, athleteName),
        details: rule.details(data),
      });
    }
  }

  return alerts;
}
