import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { mockPendingActions } from '@/mocks/dashboard';
import type { PendingAction } from '@/mocks/dashboard';

interface CheckInContextValue {
  isWellnessComplete: boolean;
  isRPEComplete: boolean;
  isAllComplete: boolean;
  nextPendingAction: PendingAction | null;
  markWellnessComplete: () => void;
  markRPEComplete: () => void;
  cycleDevState: () => void;
}

const CheckInContext = createContext<CheckInContextValue | undefined>(undefined);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [isWellnessComplete, setIsWellnessComplete] = useState(false);
  const [isRPEComplete, setIsRPEComplete] = useState(false);
  const devPosition = useRef(0);

  const isAllComplete = isWellnessComplete && isRPEComplete;

  const nextPendingAction: PendingAction | null = !isWellnessComplete
    ? mockPendingActions[0]
    : !isRPEComplete
      ? mockPendingActions[1]
      : null;

  const markWellnessComplete = useCallback(() => {
    setIsWellnessComplete(true);
  }, []);

  const markRPEComplete = useCallback(() => {
    setIsRPEComplete(true);
  }, []);

  const cycleDevState = useCallback(() => {
    devPosition.current = (devPosition.current + 1) % 3;
    switch (devPosition.current) {
      case 0:
        setIsWellnessComplete(false);
        setIsRPEComplete(false);
        break;
      case 1:
        setIsWellnessComplete(true);
        setIsRPEComplete(false);
        break;
      case 2:
        setIsWellnessComplete(true);
        setIsRPEComplete(true);
        break;
    }
  }, []);

  return (
    <CheckInContext.Provider
      value={{
        isWellnessComplete,
        isRPEComplete,
        isAllComplete,
        nextPendingAction,
        markWellnessComplete,
        markRPEComplete,
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
