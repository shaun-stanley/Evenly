import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Groups' }} />
      <Stack.Screen name="create" options={{ title: 'New Group', presentation: 'modal' }} />
    </Stack>
  );
}
