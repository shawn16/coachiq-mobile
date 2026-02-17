/**
 * Core API Client
 *
 * Thin fetch wrapper that handles:
 * - Base URL prepending
 * - Auth token from AsyncStorage
 * - JSON content type
 * - 401 handling (clear token, redirect to auth)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { API_BASE_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api";

const TOKEN_KEY = "coachiq_auth_token";

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function handle401() {
  await clearStoredToken();
  await AsyncStorage.removeItem("coachiq_athlete_profile");
  router.replace("/(auth)");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Skip attaching the auth token (for public endpoints) */
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, skipAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipAuth) {
    const token = await getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — token expired or invalid
  if (response.status === 401 && !skipAuth) {
    await handle401();
    return {
      success: false,
      error: "Session expired. Please log in again.",
      code: "UNAUTHORIZED",
    };
  }

  const json: ApiResponse<T> = await response.json();
  return json;
}
