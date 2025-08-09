import { Stack, useRouter } from 'expo-router';
import { useThemeTokens } from '@/theme/AppThemeProvider';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

export default function GroupLayout() {
  const t = useThemeTokens();
  const router = useRouter();
  return (
    <Stack screenOptions={{
      headerLargeTitle: false,
      headerTintColor: t.colors.tint,
      headerTitleStyle: { color: t.colors.label, fontSize: 17, fontWeight: '600' },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: t.colors.background },
    }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Group',
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
    </Stack>
  );
}
