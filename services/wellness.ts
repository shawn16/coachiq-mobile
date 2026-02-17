/**
 * Wellness Service — submit wellness checks and get status
 */
import { apiRequest } from "./api";
import type {
  WellnessSubmissionRequest,
  WellnessCheck,
  PendingRequestsResponse,
  ApiResponse,
} from "@/types/api";

export async function submitWellnessCheck(
  data: WellnessSubmissionRequest
): Promise<ApiResponse<{ wellnessCheck: WellnessCheck }>> {
  return apiRequest("/athlete/wellness", {
    method: "POST",
    body: data,
  });
}

export async function getWellnessStatus(): Promise<
  ApiResponse<PendingRequestsResponse>
> {
  return apiRequest("/athlete/pending");
}
