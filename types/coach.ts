/**
 * Coach-related type definitions
 */

export interface CoachProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  schoolName: string;
  season: string;
  year: number;
  athleteCount: number;
  pendingCount: number;
  accessCode: string;
}

export interface TeamRosterAthlete {
  id: string;
  firstName: string;
  lastName: string;
  grade: number | null;
  status: 'active' | 'pending';
  hasPinSet: boolean;
}

export interface CoachLoginResponse {
  token: string;
  coach: CoachProfile;
}
