import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function AccountLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{
      headerLargeTitle: false,
      headerTintColor: t.colors.tint,
      headerTitleStyle: { color: t.colors.label, fontSize: 17, fontWeight: '600' },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: t.colors.background },
    }}>
      <Stack.Screen name="index" options={{ title: 'Account' }} />
    </Stack>
  );
}
