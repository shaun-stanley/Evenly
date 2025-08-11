import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { getStackHeaderOptions } from '@/utils/navigation';

export default function OverviewLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={getStackHeaderOptions(t, { large: true })}>
      <Stack.Screen
        name="index"
        options={{ title: 'Evenly' }}
      />
    </Stack>
  );
}
