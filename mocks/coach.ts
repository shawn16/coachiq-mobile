import type { CoachProfile, TeamSummary, TeamRosterAthlete } from '@/types/coach';

// ─── Mock Coach ─────────────────────────────────────────────────────────────

export const mockCoach: CoachProfile = {
  id: 'coach-001',
  firstName: 'Mike',
  lastName: 'Johnson',
  email: 'mike.johnson@westview.edu',
};

// ─── Mock Teams ─────────────────────────────────────────────────────────────

export const mockTeams: TeamSummary[] = [
  {
    id: 'team-001',
    name: 'Varsity Track & Field',
    schoolName: 'Westview High School',
    season: 'Spring',
    year: 2026,
    athleteCount: 24,
    pendingCount: 3,
    accessCode: 'WV2026',
  },
  {
    id: 'team-002',
    name: 'JV Cross Country',
    schoolName: 'Westview High School',
    season: 'Fall',
    year: 2025,
    athleteCount: 18,
    pendingCount: 0,
    accessCode: 'WVJV25',
  },
];

// ─── Mock Team Roster ───────────────────────────────────────────────────────

export const mockTeamRoster: TeamRosterAthlete[] = [
  {
    id: 'ath-001',
    firstName: 'Shawn',
    lastName: 'Siemers',
    grade: 11,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-002',
    firstName: 'Emma',
    lastName: 'Anderson',
    grade: 10,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-003',
    firstName: 'Liam',
    lastName: 'Chen',
    grade: 12,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-004',
    firstName: 'Sophia',
    lastName: 'Davis',
    grade: 11,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-005',
    firstName: 'Noah',
    lastName: 'Garcia',
    grade: 10,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-006',
    firstName: 'Olivia',
    lastName: 'Kim',
    grade: 9,
    status: 'active',
    hasPinSet: true,
  },
  {
    id: 'ath-007',
    firstName: 'Ethan',
    lastName: 'Martinez',
    grade: 11,
    status: 'pending',
    hasPinSet: false,
  },
  {
    id: 'ath-008',
    firstName: 'Ava',
    lastName: 'Patel',
    grade: 10,
    status: 'pending',
    hasPinSet: false,
  },
  {
    id: 'ath-009',
    firstName: 'Jackson',
    lastName: 'Thompson',
    grade: 12,
    status: 'pending',
    hasPinSet: false,
  },
  {
    id: 'ath-010',
    firstName: 'Mia',
    lastName: 'Wilson',
    grade: 9,
    status: 'active',
    hasPinSet: true,
  },
];
