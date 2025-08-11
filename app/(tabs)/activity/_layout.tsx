import { Stack, useRouter } from 'expo-router';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/hooks/useTheme';
import { getStackHeaderOptions } from '@/utils/navigation';

export default function ActivityLayout() {
  const t = useTheme();
  const router = useRouter();
  return (
    <Stack screenOptions={getStackHeaderOptions(t, { large: true })}>
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
      <Stack.Screen name="recurring-list" options={{ title: 'Recurring', headerLargeTitle: false, headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
      <Stack.Screen name="recurring" options={{ title: 'New Recurring', headerLargeTitle: false, headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
      <Stack.Screen name="recurring-edit/[id]" options={{ title: 'Edit Recurring', headerLargeTitle: false, headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
      <Stack.Screen name="detail" options={{ title: 'Activity', headerLargeTitle: false, headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
    </Stack>
  );
}
