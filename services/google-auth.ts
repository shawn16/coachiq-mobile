/**
 * Google Auth Service — handles Google Sign-In flow for mobile
 */
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { apiRequest } from "./api";
import type { ApiResponse } from "@/types/api";
import type { CoachLoginResponse } from "@/types/coach";

/**
 * Hook that wraps Google.useAuthRequest with the configured client IDs.
 * Reads from EXPO_PUBLIC_ env vars set in .env.
 */
export function useGoogleAuth() {
  // Must be called before using auth session, but inside a component scope
  // (not at module level) to avoid crashes in TestFlight/production builds.
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  if (__DEV__ && request) {
    console.log("[GoogleAuth] redirectUri:", request.redirectUri);
  }

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
