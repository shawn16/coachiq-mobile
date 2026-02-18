/**
 * API Configuration
 *
 * Reads API_BASE_URL from Expo constants (app.config.ts extra field),
 * falling back to a hardcoded dev URL.
 */
import Constants from "expo-constants";

const extraApiUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

// Change this URL when moving to production domain.
const DEFAULT_API_URL = "https://v0-coach-iq-app-build.vercel.app/api/mobile/v1";

export const API_BASE_URL: string = extraApiUrl ?? DEFAULT_API_URL;
