import { Stack } from 'expo-router';

export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="team/[id]" />
      <Stack.Screen
        name="add-members/[teamId]"
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}
