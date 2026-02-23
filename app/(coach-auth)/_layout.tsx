import { Stack } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function CoachAuthLayout() {
  return (
    <ErrorBoundary fallbackMessage="The login screen encountered an error. The details below will help with debugging.">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    </ErrorBoundary>
  );
}
