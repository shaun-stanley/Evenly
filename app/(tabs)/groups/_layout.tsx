import { Stack, useRouter } from 'expo-router';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/hooks/useTheme';
import { getStackHeaderOptions } from '@/utils/navigation';

export default function GroupsLayout() {
  const t = useTheme();
  const router = useRouter();
  return (
    <Stack screenOptions={getStackHeaderOptions(t, { large: true })}>
      <Stack.Screen name="index" options={{ title: 'Groups' }} />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Group',
          presentation: 'modal',
          headerLargeTitle: false,
          headerLeft: () => (
            <HeaderIconButton name="xmark" accessibilityLabel="Close" accessibilityHint="Dismiss" onPress={() => router.back()} />
          ),
        }}
      />
    </Stack>
  );
}
