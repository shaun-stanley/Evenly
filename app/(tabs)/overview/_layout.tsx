import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function OverviewLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark
    ? { tint: '#0a84ff', label: '#ffffff', background: '#000000' }
    : { tint: '#007aff', label: '#1c1c1e', background: '#f2f2f7' };
  return (
    <Stack screenOptions={{
      headerLargeTitle: true,
      headerTintColor: colors.tint,
      headerTitleStyle: { color: colors.label, fontSize: 17, fontWeight: '600' },
      headerShadowVisible: false,
      headerTransparent: false,
      headerBackground: undefined,
      // Native blur on iOS for UINavigationBar
      headerBlurEffect: 'systemChromeMaterial',
      headerStyle: { backgroundColor: colors.background },
    }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Evenly' }}
      />
    </Stack>
  );
}
