import { DS_COLORS } from '@/constants/design-system';

export interface RPESubmission {
  athleteId: string;
  submittedAt: string;
  workoutName: string;
  rpeOverall: number;
  rpeLegs: number;
  rpeBreathing: number;
  notes: string;
}

export interface RPEFormData {
  rpeOverall: number | null;
  rpeLegs: number | null;
  rpeBreathing: number | null;
  notes: string;
}

export const INITIAL_RPE_FORM_DATA: RPEFormData = {
  rpeOverall: null,
  rpeLegs: null,
  rpeBreathing: null,
  notes: '',
};

export const RPE_LABELS: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Light-Moderate',
  4: 'Moderate',
  5: 'Moderate-Hard',
  6: 'Hard',
  7: 'Very Hard',
  8: 'Very, Very Hard',
  9: 'Near Max',
  10: 'Max Effort',
};

export function getRPEColor(
  value: number,
  colors: typeof DS_COLORS.rpeScale,
): string {
  if (value <= 3) return colors.green;
  if (value <= 5) return colors.yellow;
  if (value <= 7) return colors.orange;
  return colors.red;
}
