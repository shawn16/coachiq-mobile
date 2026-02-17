/**
 * Auth Service — calls the 4 auth endpoints
 */
import { apiRequest } from "./api";
import type {
  TeamValidationResponse,
  FindAthleteResponse,
  SetPinResponse,
  PinLoginResponse,
  ApiResponse,
} from "@/types/api";

export async function validateTeamCode(
  accessCode: string
): Promise<ApiResponse<TeamValidationResponse>> {
  return apiRequest<TeamValidationResponse>("/auth/validate-team-code", {
    method: "POST",
    body: { accessCode },
    skipAuth: true,
  });
}

export async function findAthlete(
  teamId: string,
  firstName: string,
  lastName: string
): Promise<ApiResponse<FindAthleteResponse>> {
  return apiRequest<FindAthleteResponse>("/auth/find-athlete", {
    method: "POST",
    body: { teamId, firstName, lastName },
    skipAuth: true,
  });
}

export async function setPin(
  athleteId: string,
  pin: string
): Promise<ApiResponse<SetPinResponse>> {
  return apiRequest<SetPinResponse>("/auth/set-pin", {
    method: "POST",
    body: { athleteId, pin },
    skipAuth: true,
  });
}

export async function pinLogin(
  teamAccessCode: string,
  pin: string
): Promise<ApiResponse<PinLoginResponse>> {
  return apiRequest<PinLoginResponse>("/auth/pin-login", {
    method: "POST",
    body: { teamAccessCode, pin },
    skipAuth: true,
  });
}
