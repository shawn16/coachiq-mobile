// ─── Dashboard Mock Data ────────────────────────────────────────────────────

export interface Athlete {
  firstName: string;
  lastName: string;
  initials: string;
  group: string;
}

export interface PendingAction {
  type: 'wellness' | 'rpe' | 'workout' | 'survey';
  title: string;
  subtitle: string;
}

export interface TodaysWorkout {
  name: string;
  structure: string;
  recovery: string;
  targetPace: string;
}

export interface WeekStats {
  weci: { value: number; trend: string };
  workouts: { completed: number; total: number };
  avgSleep: number;
}

export interface RecentPR {
  event: string;
  time: string;
  date: string;
}

// ─── Mock Values ────────────────────────────────────────────────────────────

export const mockAthlete: Athlete = {
  firstName: 'Shawn',
  lastName: 'Siemers',
  initials: 'SS',
  group: 'Distance',
};

export const mockPendingActions: PendingAction[] = [
  {
    type: 'wellness',
    title: 'Pre-Practice Check-in',
    subtitle: 'Due before practice',
  },
  {
    type: 'rpe',
    title: 'Post-Workout RPE',
    subtitle: "Rate today's workout",
  },
];

export const mockTodaysWorkout: TodaysWorkout = {
  name: 'Tuesday Tempo Intervals',
  structure: '6×400m @ 3200m pace',
  recovery: 'w/ 200m jog recovery',
  targetPace: '1:24 per rep',
};

export const mockWeekStats: WeekStats = {
  weci: { value: 87, trend: '+4' },
  workouts: { completed: 3, total: 4 },
  avgSleep: 7.2,
};

export const mockRecentPR: RecentPR = {
  event: '1600m',
  time: '4:52',
  date: 'Jan 11',
};
