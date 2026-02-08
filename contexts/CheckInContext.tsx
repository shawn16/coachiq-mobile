import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { mockPendingActions } from '@/mocks/dashboard';
import type { PendingAction } from '@/mocks/dashboard';

interface CheckInContextValue {
  isWellnessComplete: boolean;
  isRPEComplete: boolean;
  isRPEAvailable: boolean;
  isAllComplete: boolean;
  nextPendingAction: PendingAction | null;
  markWellnessComplete: () => void;
  markRPEComplete: () => void;
  markRPEAvailable: () => void;
  cycleDevState: () => void;
}

const CheckInContext = createContext<CheckInContextValue | undefined>(undefined);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [isWellnessComplete, setIsWellnessComplete] = useState(false);
  const [isRPEComplete, setIsRPEComplete] = useState(false);
  const [isRPEAvailable, setIsRPEAvailable] = useState(false);
  const devPosition = useRef(0);

  const isAllComplete = isWellnessComplete && isRPEComplete;

  const nextPendingAction: PendingAction | null = !isWellnessComplete
    ? mockPendingActions[0]
    : (isRPEAvailable && !isRPEComplete)
      ? mockPendingActions[1]
      : null;

  const markWellnessComplete = useCallback(() => {
    setIsWellnessComplete(true);
  }, []);

  const markRPEComplete = useCallback(() => {
    setIsRPEComplete(true);
  }, []);

  const markRPEAvailable = useCallback(() => {
    setIsRPEAvailable(true);
  }, []);

  const cycleDevState = useCallback(() => {
    devPosition.current = (devPosition.current + 1) % 4;
    const labels = [
      'State A: Both pending',
      'State B: Wellness done, RPE waiting',
      'State C: Wellness done, RPE ready',
      'State D: All complete',
    ];
    switch (devPosition.current) {
      case 0:
        setIsWellnessComplete(false);
        setIsRPEAvailable(false);
        setIsRPEComplete(false);
        break;
      case 1:
        setIsWellnessComplete(true);
        setIsRPEAvailable(false);
        setIsRPEComplete(false);
        break;
      case 2:
        setIsWellnessComplete(true);
        setIsRPEAvailable(true);
        setIsRPEComplete(false);
        break;
      case 3:
        setIsWellnessComplete(true);
        setIsRPEAvailable(true);
        setIsRPEComplete(true);
        break;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Dev State', labels[devPosition.current]);
  }, []);

  return (
    <CheckInContext.Provider
      value={{
        isWellnessComplete,
        isRPEComplete,
        isRPEAvailable,
        isAllComplete,
        nextPendingAction,
        markWellnessComplete,
        markRPEComplete,
        markRPEAvailable,
        cycleDevState,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn(): CheckInContextValue {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
}
