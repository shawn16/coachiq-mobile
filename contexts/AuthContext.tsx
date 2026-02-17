/**
 * AuthContext — manages auth state (JWT + athlete profile) via AsyncStorage.
 *
 * Provides login(), logout(), isAuthenticated, athlete, and isLoading to the app.
 * On mount, checks AsyncStorage for an existing token.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { setStoredToken, clearStoredToken, getStoredToken } from "@/services/api";
import type { AthleteProfile } from "@/types/api";

const PROFILE_KEY = "coachiq_athlete_profile";

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  athlete: AthleteProfile | null;
  login: (token: string, athlete: AthleteProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);

  const isAuthenticated = !!athlete;

  // On mount, check for stored credentials
  useEffect(() => {
    (async () => {
      try {
        const [token, profileJson] = await Promise.all([
          getStoredToken(),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);

        if (token && profileJson) {
          const profile: AthleteProfile = JSON.parse(profileJson);
          setAthlete(profile);
        }
      } catch {
        // Corrupted storage — clear and start fresh
        await clearStoredToken();
        await AsyncStorage.removeItem(PROFILE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (token: string, profile: AthleteProfile) => {
    await setStoredToken(token);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setAthlete(profile);
  }, []);

  const logout = useCallback(async () => {
    await clearStoredToken();
    await AsyncStorage.removeItem(PROFILE_KEY);
    setAthlete(null);
    router.replace("/(auth)");
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, athlete, login, logout }}>
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
