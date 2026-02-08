// ─── Wellness Check-in Types ─────────────────────────────────────────────────

export interface WellnessSubmission {
  athleteId: string;
  submittedAt: string; // ISO timestamp
  sleepHours: number; // 4.0-12.0
  hydration: number; // 2, 4, 6, 8, or 10
  energyLevel: number; // 2, 4, 6, 8, or 10
  motivation: number; // 2, 4, 6, 8, or 10
  foodTiming: string; // 'havent_eaten' | 'just_ate' | '1_2hrs' | '3_4hrs'
  focus: number; // 2, 4, 6, 8, or 10
  sorenessAreas: string[]; // ['calves', 'knees'] or []
  illnessSymptoms: string[]; // ['throat', 'headache'] or []
  notes: string; // Free text or empty string
}

export interface WellnessFormData {
  sleepHours: number;
  hydration: number | null;
  energy: number | null;
  motivation: number | null;
  foodTiming: string | null;
  focus: number | null;
  sorenessAreas: string[];
  illnessSymptoms: string[];
  notes: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const FOOD_TIMING_OPTIONS = [
  { id: 'havent_eaten', label: "Haven't eaten", subtitle: 'No food today' },
  { id: '1_2hrs', label: '1-2 hours ago', subtitle: 'Recent meal' },
  { id: '3_4hrs', label: '3-4 hours ago', subtitle: 'Earlier meal' },
  { id: 'just_ate', label: 'Just ate', subtitle: 'Within last hr' },
] as const;

export const SORENESS_AREAS = [
  'Calves',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Lower Back',
  'Knees',
  'Ankles',
  'Other',
] as const;

export const ILLNESS_SYMPTOMS = [
  'Throat',
  'Stuffy nose',
  'Headache',
  'Stomach',
  'Cough',
  'Just tired',
  'Feels fine',
  'Other',
] as const;

export const INITIAL_FORM_DATA: WellnessFormData = {
  sleepHours: 8.0,
  hydration: null,
  energy: null,
  motivation: null,
  foodTiming: null,
  focus: null,
  sorenessAreas: [],
  illnessSymptoms: [],
  notes: '',
};
