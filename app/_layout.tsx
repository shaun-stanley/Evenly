// Navigation theme is provided via our AppThemeProvider
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppThemeProvider, useThemeTokens } from '@/theme/AppThemeProvider';
import { StoreProvider } from '@/store/store';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <AppThemeProvider>
          <RootNavigator />
        </AppThemeProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  // Access tokens if we need to set global screenOptions later
  const t = useThemeTokens();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
