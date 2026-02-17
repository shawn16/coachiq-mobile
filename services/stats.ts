/**
 * Stats Service — fetch athlete statistics
 */
import { apiRequest } from "./api";
import type { StatsData, ApiResponse } from "@/types/api";

export async function getStatsData(): Promise<
  ApiResponse<{ stats: StatsData }>
> {
  return apiRequest("/athlete/stats");
}
