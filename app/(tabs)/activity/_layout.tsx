import { Stack, useRouter } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';
import HeaderBackground from '@/components/ui/HeaderBackground';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

export default function ActivityLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark
    ? { tint: '#0a84ff', label: '#ffffff', background: '#000000' }
    : { tint: '#007aff', label: '#1c1c1e', background: '#f2f2f7' };
  const router = useRouter();
  return (
    <Stack screenOptions={{
      headerLargeTitle: false,
      headerTintColor: colors.tint,
      headerTitleStyle: { color: colors.label, fontSize: 17, fontWeight: '600' },
      headerShadowVisible: false,
      headerTransparent: Platform.OS === 'ios',
      headerStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background },
      headerBackground: Platform.OS === 'ios' ? (() => <HeaderBackground />) : undefined,
    }}>
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
      <Stack.Screen name="recurring-list" options={{ title: 'Recurring', headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
      <Stack.Screen name="recurring" options={{ title: 'New Recurring', headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
      <Stack.Screen name="recurring-edit/[id]" options={{ title: 'Edit Recurring', headerLeft: () => (
        <HeaderIconButton name="chevron.left" accessibilityLabel="Back" accessibilityHint="Go back" onPress={() => router.back()} />
      ) }} />
    </Stack>
  );
}
