import { Stack } from 'expo-router';

export default function OverviewLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Overview' }} />
    </Stack>
  );
}
