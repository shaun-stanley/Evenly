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
    return {
      ...base,
      dark: scheme === 'dark',
      colors: {
        ...base.colors,
        primary: tokens.colors.tint,
        background: tokens.colors.background,
        card: tokens.colors.card,
        text: tokens.colors.label,
        border: tokens.colors.separator,
        notification: tokens.colors.tint,
      },
    } as NavTheme;
  }, [scheme, tokens]);

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
