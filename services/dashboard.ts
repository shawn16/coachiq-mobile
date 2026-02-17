/**
 * Dashboard Service — aggregates data from multiple endpoints
 */
import { apiRequest } from "./api";
import type {
  PendingRequestsResponse,
  Workout,
  StatsData,
  ApiResponse,
} from "@/types/api";

export interface DashboardData {
  pending: PendingRequestsResponse | null;
  workouts: Workout[];
  stats: StatsData | null;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [pendingRes, workoutsRes, statsRes] = await Promise.all([
    apiRequest<PendingRequestsResponse>("/athlete/pending"),
    apiRequest<{ workouts: Workout[] }>("/athlete/workouts"),
    apiRequest<{ stats: StatsData }>("/athlete/stats"),
  ]);

  return {
    pending: pendingRes.success ? (pendingRes.data ?? null) : null,
    workouts: workoutsRes.success ? (workoutsRes.data?.workouts ?? []) : [],
    stats: statsRes.success ? (statsRes.data?.stats ?? null) : null,
  };
}
