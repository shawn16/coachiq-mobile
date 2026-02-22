/**
 * Google Auth Service — handles Google Sign-In flow for mobile
 */
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { apiRequest } from "./api";
import type { ApiResponse } from "@/types/api";
import type { CoachLoginResponse } from "@/types/coach";

// Required for auth session redirect handling
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook that wraps Google.useAuthRequest with the configured client IDs.
 * Reads from EXPO_PUBLIC_ env vars set in .env.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  return { request, response, promptAsync };
}

/**
 * Send a Google ID token to the backend for verification and JWT exchange.
 */
export async function googleLogin(
  idToken: string
): Promise<ApiResponse<CoachLoginResponse>> {
  return apiRequest<CoachLoginResponse>("/auth/google-login", {
    method: "POST",
    body: { idToken },
    skipAuth: true,
  });
}
