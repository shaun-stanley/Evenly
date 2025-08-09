import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

export default function GroupsLayout() {
  const t = useTheme();
  const router = useRouter();
  return (
    <Stack screenOptions={{
      headerLargeTitle: false,
      headerTintColor: t.colors.tint,
      headerTitleStyle: { color: t.colors.label, fontSize: 17, fontWeight: '600' },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: t.colors.background },
    }}>
      <Stack.Screen name="index" options={{ title: 'Groups' }} />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Group',
          presentation: 'modal',
          headerLeft: () => (
            <HeaderIconButton name="xmark" accessibilityLabel="Close" accessibilityHint="Dismiss" onPress={() => router.back()} />
          ),
        }}
      />
    </Stack>
  );
}
