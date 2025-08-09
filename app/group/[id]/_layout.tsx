import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: 'Group' }} />
      <Stack.Screen name="add-expense" options={{ title: 'Add Expense', presentation: 'modal', headerLargeTitle: false }} />
      <Stack.Screen name="edit-expense" options={{ title: 'Edit Expense', presentation: 'modal', headerLargeTitle: false }} />
    </Stack>
  );
}
