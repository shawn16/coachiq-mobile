// ─── Stats Mock Data ────────────────────────────────────────────────────────

import { DS_COLORS } from '@/constants/design-system';

export interface PacingTrendData {
  points: { label: string; value: number }[];
  currentScore: number;
  startScore: number;
  trendDelta: number;
  message: string;
}

export interface PersonalRecord {
  event: string;
  time: string;
  date: string;
  isRecent: boolean;
}

export interface RecentWorkout {
  date: string;
  name: string;
  pacingScore: number;
  effortRating: number;
}

export interface WellnessTrendMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

export interface WellnessTrendComparison {
  text: string;
  isPositive: boolean;
}

// ─── Mock Values ────────────────────────────────────────────────────────────

export const mockPacingTrend: PacingTrendData = {
  points: [
    { label: 'Wk 1', value: 84 },
    { label: 'Wk 2', value: 85 },
    { label: 'Wk 3', value: 88 },
    { label: 'Wk 4', value: 86 },
    { label: 'Now', value: 89 },
  ],
  currentScore: 89,
  startScore: 84,
  trendDelta: 5,
  message: 'Your pacing is getting more consistent!',
};

export const mockPersonalRecords: PersonalRecord[] = [
  { event: '1600m', time: '4:52', date: 'Jan 11', isRecent: true },
  { event: '3200m', time: '10:28', date: 'Dec 14', isRecent: false },
  { event: '5K', time: '17:42', date: 'Nov 2', isRecent: false },
  { event: '800m', time: '2:18', date: 'Oct 19', isRecent: false },
];

export const mockRecentWorkouts: RecentWorkout[] = [
  { date: 'Wed, Feb 5', name: '6×400m', pacingScore: 89, effortRating: 7 },
  { date: 'Tue, Feb 4', name: '5mi tempo', pacingScore: 91, effortRating: 6 },
  { date: 'Sat, Feb 1', name: '10mi long', pacingScore: 85, effortRating: 7 },
];

export const mockWellnessMetrics: WellnessTrendMetric[] = [
  { label: 'Sleep', value: 7.2, max: 12, unit: 'h', color: '#14B8A6' },
  { label: 'Energy', value: 7.1, max: 10, unit: '/10', color: DS_COLORS.accent.green },
  { label: 'Soreness', value: 4.2, max: 10, unit: '/10', color: DS_COLORS.status.warning },
];

export const mockWellnessComparison: WellnessTrendComparison = {
  text: 'vs. last week: Sleep ↑0.3h • Energy ↑0.4',
  isPositive: true,
};
