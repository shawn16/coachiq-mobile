/**
 * Coach Service — calls coach-specific endpoints
 */
import { apiRequest } from './api';
import type { ApiResponse } from '@/types/api';
import type {
  CoachLoginResponse,
  TeamSummary,
  TeamRosterAthlete,
} from '@/types/coach';

export async function coachLogin(
  email: string,
  password: string
): Promise<ApiResponse<CoachLoginResponse>> {
  return apiRequest<CoachLoginResponse>('/auth/coach-login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export async function getCoachTeams(): Promise<ApiResponse<TeamSummary[]>> {
  return apiRequest<TeamSummary[]>('/coach/teams');
}

export async function getTeamRoster(
  teamId: string
): Promise<ApiResponse<TeamRosterAthlete[]>> {
  return apiRequest<TeamRosterAthlete[]>(`/coach/teams/${teamId}/athletes`);
}

export async function removeAthlete(
  teamId: string,
  athleteId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiRequest<{ success: boolean }>(
    `/coach/teams/${teamId}/athletes/${athleteId}/remove`,
    { method: 'POST' }
  );
}

export async function resetAthletePin(
  teamId: string,
  athleteId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiRequest<{ success: boolean }>(
    `/coach/teams/${teamId}/athletes/${athleteId}/reset-pin`,
    { method: 'POST' }
  );
}
