/**
 * RPE Service — submit RPE ratings and get pending RPE requests
 */
import { apiRequest } from "./api";
import type {
  RpeSubmissionRequest,
  RpeSubmission,
  PendingRequestsResponse,
  ApiResponse,
} from "@/types/api";

export async function submitRpe(
  data: RpeSubmissionRequest
): Promise<ApiResponse<{ rpeSubmission: RpeSubmission }>> {
  return apiRequest("/athlete/rpe", {
    method: "POST",
    body: data,
  });
}

export async function getPendingRpe(): Promise<
  ApiResponse<PendingRequestsResponse>
> {
  return apiRequest("/athlete/pending");
}
