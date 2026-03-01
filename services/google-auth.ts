/**
 * Google Auth Service — handles Google Sign-In flow for mobile
 */
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { apiRequest } from "./api";
import type { ApiResponse } from "@/types/api";
import type { CoachLoginResponse } from "@/types/coach";

const googleAuth = Constants.expoConfig?.extra?.googleAuth as
  | { iosClientId?: string; webClientId?: string }
  | undefined;

/**
 * Hook that wraps Google.useAuthRequest with the configured client IDs.
 * Reads from Constants.expoConfig.extra.googleAuth (baked at build time).
 */
export function useGoogleAuth() {
  // Must be called before using auth session, but inside a component scope
  // (not at module level) to avoid crashes in TestFlight/production builds.
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleAuth?.iosClientId,
    webClientId: googleAuth?.webClientId,
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
