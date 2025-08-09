import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as NavThemeProvider, Theme as NavTheme, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { lightTokens, darkTokens, Tokens } from './tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

const ThemeContext = createContext<{ tokens: Tokens; navTheme: NavTheme } | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? darkTokens : lightTokens;

  const navTheme: NavTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    // React Navigation theme expects string colors. Use hex fallbacks aligned with tokens.
    const light = {
      primary: '#007aff',
      background: '#f2f2f7',
      card: '#ffffff',
      text: '#1c1c1e',
      border: '#e5e5ea',
      notification: '#007aff',
    } as const;
    const dark = {
      primary: '#0a84ff',
      background: '#000000',
      card: '#1c1c1e',
      text: '#ffffff',
      border: '#2c2c2e',
      notification: '#0a84ff',
    } as const;
    const palette = scheme === 'dark' ? dark : light;
    return {
      ...base,
      dark: scheme === 'dark',
      colors: {
        ...base.colors,
        ...palette,
      },
    } as NavTheme;
  }, [scheme]);

  const value = useMemo(() => ({ tokens, navTheme }), [tokens, navTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeTokens(): Tokens {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeTokens must be used within AppThemeProvider');
  return ctx.tokens;
}

export function useNavTheme(): NavTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useNavTheme must be used within AppThemeProvider');
  return ctx.navTheme;
}
