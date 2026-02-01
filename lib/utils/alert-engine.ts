/**
 * Wellness alert engine — pure function that evaluates wellness submission data
 * and returns any triggered alerts based on predefined threshold rules.
 *
 * Called synchronously after a successful wellness check-in to generate
 * WellnessAlert records for coach visibility.
 */

import type { SorenessArea, IllnessSymptom } from "./wellness-validation";

/** Wellness data shape accepted by the alert engine. */
export interface WellnessData {
  sleepHours: number;
  sleepQuality: number;
  hydration: number;
  energy: number;
  motivation: number;
  focus: number;
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

/**
 * Evaluates wellness submission data against all alert rules and returns
 * any triggered alerts. This is a pure function with no side effects.
 *
 * @param data - Validated wellness submission data
 * @returns Array of triggered alerts (empty if no rules fire)
 */
export function evaluateWellnessAlerts(data: WellnessData): AlertResult[] {
  const alerts: AlertResult[] = [];

  // Hydration — critical: <= 2
  if (data.hydration <= 2) {
    alerts.push({
      ruleId: "hydration_critical",
      severity: "critical",
      message: "Critically low hydration reported",
      details: { hydration: data.hydration, threshold: 2 },
    });
  }
  // Hydration — high: > 2 AND <= 4
  else if (data.hydration <= 4) {
    alerts.push({
      ruleId: "hydration_low",
      severity: "high",
      message: "Low hydration reported",
      details: { hydration: data.hydration, threshold: 4 },
    });
  }

  // Energy — critical: <= 2
  if (data.energy <= 2) {
    alerts.push({
      ruleId: "energy_critical",
      severity: "critical",
      message: "Critically low energy reported",
      details: { energy: data.energy, threshold: 2 },
    });
  }
  // Energy — high: > 2 AND <= 4
  else if (data.energy <= 4) {
    alerts.push({
      ruleId: "energy_low",
      severity: "high",
      message: "Low energy reported",
      details: { energy: data.energy, threshold: 4 },
    });
  }

  // Sleep hours — critical: <= 5.0
  if (data.sleepHours <= 5.0) {
    alerts.push({
      ruleId: "sleep_hours_critical",
      severity: "critical",
      message: "Very low sleep duration reported",
      details: { sleepHours: data.sleepHours, threshold: 5.0 },
    });
  }

  // Sleep quality — high: <= 3
  if (data.sleepQuality <= 3) {
    alerts.push({
      ruleId: "sleep_quality_low",
      severity: "high",
      message: "Poor sleep quality reported",
      details: { sleepQuality: data.sleepQuality, threshold: 3 },
    });
  }

  // Motivation — medium: <= 3
  if (data.motivation <= 3) {
    alerts.push({
      ruleId: "motivation_low",
      severity: "medium",
      message: "Low motivation reported",
      details: { motivation: data.motivation, threshold: 3 },
    });
  }

  // Focus — medium: <= 3
  if (data.focus <= 3) {
    alerts.push({
      ruleId: "focus_low",
      severity: "medium",
      message: "Low focus reported",
      details: { focus: data.focus, threshold: 3 },
    });
  }

  // Soreness — high: >= 4 areas
  if (data.sorenessAreas.length >= 4) {
    alerts.push({
      ruleId: "soreness_multiple",
      severity: "high",
      message: "Multiple soreness areas reported",
      details: {
        sorenessAreaCount: data.sorenessAreas.length,
        sorenessAreas: data.sorenessAreas,
        threshold: 4,
      },
    });
  }

  // Illness — critical: >= 4 symptoms
  if (data.illnessSymptoms.length >= 4) {
    alerts.push({
      ruleId: "illness_critical",
      severity: "critical",
      message: "Significant illness symptoms reported",
      details: {
        illnessSymptomCount: data.illnessSymptoms.length,
        illnessSymptoms: data.illnessSymptoms,
        threshold: 4,
      },
    });
  }
  // Illness — high: >= 2 AND < 4 symptoms
  else if (data.illnessSymptoms.length >= 2) {
    alerts.push({
      ruleId: "illness_symptoms",
      severity: "high",
      message: "Multiple illness symptoms reported",
      details: {
        illnessSymptomCount: data.illnessSymptoms.length,
        illnessSymptoms: data.illnessSymptoms,
        threshold: 2,
      },
    });
  }

  return alerts;
}
