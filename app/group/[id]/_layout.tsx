import { Stack, useRouter } from 'expo-router';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/hooks/useTheme';
import { getStackHeaderOptions } from '@/utils/navigation';

export default function GroupLayout() {
  const t = useTheme();
  const router = useRouter();
  return (
    <Stack screenOptions={getStackHeaderOptions(t, { large: false })}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Group',
          // Use small title for consistency
          headerLargeTitle: false,
          headerLeft: () => (
            <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
          ),
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          title: 'Add Expense',
          presentation: 'modal',
          headerLargeTitle: false,
          headerLeft: () => (
            <HeaderIconButton name="xmark" accessibilityLabel="Close" accessibilityHint="Dismiss" onPress={() => router.back()} />
          ),
        }}
      />
      <Stack.Screen
        name="edit-expense"
        options={{
          title: 'Edit Expense',
          presentation: 'modal',
          headerLargeTitle: false,
          headerLeft: () => (
            <HeaderIconButton name="xmark" accessibilityLabel="Close" accessibilityHint="Dismiss" onPress={() => router.back()} />
          ),
        }}
      />
      <Stack.Screen
        name="settle-up"
        options={{
          title: 'Settle Up',
          headerLargeTitle: false,
          headerLeft: () => (
            <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
          ),
        }}
      />
    </Stack>
  );
}
