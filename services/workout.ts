/**
 * Workout Service — fetch workouts for athlete
 */
import { apiRequest } from "./api";
import type { Workout, ApiResponse } from "@/types/api";

export async function getWorkouts(): Promise<
  ApiResponse<{ workouts: Workout[] }>
> {
  return apiRequest("/athlete/workouts");
}
