/**
 * API Configuration
 *
 * Reads API_BASE_URL from Expo constants (app.config.ts extra field),
 * falling back to a hardcoded dev URL.
 */
import Constants from "expo-constants";

const extraApiUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

// For dev: use your local machine IP. In production, this will come from app.config.ts.
const DEV_API_URL = "http://localhost:3000/api/mobile/v1";

export const API_BASE_URL: string = extraApiUrl ?? DEV_API_URL;
