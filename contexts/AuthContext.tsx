/**
 * AuthContext — manages dual-role auth state (coach + athlete) via AsyncStorage.
 *
 * Provides role-based login/logout, isAuthenticated, athlete/coach profiles,
 * and isLoading to the app. On mount, checks AsyncStorage for an existing session.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { setStoredToken, clearStoredToken, getStoredToken } from "@/services/api";
import type { AthleteProfile } from "@/types/api";
import type { CoachProfile } from "@/types/coach";

const PROFILE_KEY = "coachiq_athlete_profile";
const COACH_PROFILE_KEY = "coachiq_coach_profile";
const ROLE_KEY = "coachiq_user_role";

type UserRole = "coach" | "athlete";

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  athlete: AthleteProfile | null;
  coach: CoachProfile | null;
  loginAsAthlete: (token: string, athlete: AthleteProfile) => Promise<void>;
  loginAsCoach: (token: string, coach: CoachProfile) => Promise<void>;
  logout: () => Promise<void>;
  /** @deprecated Use loginAsAthlete instead — kept for backward compat */
  login: (token: string, athlete: AthleteProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [coach, setCoach] = useState<CoachProfile | null>(null);

  const isAuthenticated = !!(athlete || coach);

  // On mount, check for stored credentials
  useEffect(() => {
    (async () => {
      try {
        const [token, storedRole, athleteJson, coachJson] = await Promise.all([
          getStoredToken(),
          AsyncStorage.getItem(ROLE_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(COACH_PROFILE_KEY),
        ]);

        if (!token) return;

        if (storedRole === "coach" && coachJson) {
          setCoach(JSON.parse(coachJson));
          setRole("coach");
        } else if (storedRole === "athlete" && athleteJson) {
          setAthlete(JSON.parse(athleteJson));
          setRole("athlete");
        } else if (!storedRole && athleteJson) {
          // Legacy migration: athlete profile exists without role key
          setAthlete(JSON.parse(athleteJson));
          setRole("athlete");
          await AsyncStorage.setItem(ROLE_KEY, "athlete");
        }
      } catch {
        // Corrupted storage — clear and start fresh
        await clearStoredToken();
        await AsyncStorage.multiRemove([PROFILE_KEY, COACH_PROFILE_KEY, ROLE_KEY]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginAsAthlete = useCallback(async (token: string, profile: AthleteProfile) => {
    await setStoredToken(token);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    await AsyncStorage.setItem(ROLE_KEY, "athlete");
    setAthlete(profile);
    setRole("athlete");
  }, []);

  const loginAsCoach = useCallback(async (token: string, profile: CoachProfile) => {
    await setStoredToken(token);
    await AsyncStorage.setItem(COACH_PROFILE_KEY, JSON.stringify(profile));
    await AsyncStorage.setItem(ROLE_KEY, "coach");
    setCoach(profile);
    setRole("coach");
  }, []);

  const logout = useCallback(async () => {
    await clearStoredToken();
    await AsyncStorage.multiRemove([PROFILE_KEY, COACH_PROFILE_KEY, ROLE_KEY]);
    setAthlete(null);
    setCoach(null);
    setRole(null);
    router.replace("/");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        role,
        athlete,
        coach,
        loginAsAthlete,
        loginAsCoach,
        logout,
        login: loginAsAthlete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
