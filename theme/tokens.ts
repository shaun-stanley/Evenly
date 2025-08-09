// iOS 18-inspired design tokens
// Light/Dark approximations using Apple semantic colors.

export type ColorTokens = {
  background: string;
  card: string;
  label: string;
  secondaryLabel: string;
  separator: string;
  tint: string; // systemBlue
  success: string; // systemGreen
  danger: string; // systemRed
  warning: string; // systemOrange
};

export type SpacingTokens = {
  xs: number; s: number; m: number; l: number; xl: number; xxl: number;
};

export type RadiusTokens = {
  sm: number; md: number; lg: number;
};

export type ShadowTokens = {
  card: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
  };
};

export type TypographyTokens = {
  title: { fontSize: number; fontWeight: '600' | '700' };
  body: { fontSize: number; fontWeight: '400' | '500' };
  footnote: { fontSize: number; fontWeight: '400' };
};

export type Tokens = {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  typography: TypographyTokens;
};

export const lightTokens: Tokens = {
  colors: {
    background: '#f2f2f7', // systemGroupedBackground
    card: '#ffffff',
    label: '#1c1c1e', // label
    secondaryLabel: '#8e8e93',
    separator: '#e5e5ea',
    tint: '#007aff', // systemBlue
    success: '#34c759', // systemGreen
    danger: '#ff3b30', // systemRed
    warning: '#ff9f0a', // systemOrange
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  radius: { sm: 8, md: 12, lg: 16 },
  shadows: {
    card: { color: '#000000', offset: { width: 0, height: 1 }, opacity: 0.08, radius: 4 },
  },
  typography: {
    title: { fontSize: 18, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    footnote: { fontSize: 13, fontWeight: '400' },
  },
};

export const darkTokens: Tokens = {
  colors: {
    background: '#000000', // systemBackground dark
    card: '#1c1c1e', // secondarySystemBackground dark
    label: '#ffffff',
    secondaryLabel: '#8e8e93',
    separator: '#2c2c2e',
    tint: '#0a84ff', // systemBlue dark
    success: '#30d158',
    danger: '#ff453a',
    warning: '#ff9f0a',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  radius: { sm: 8, md: 12, lg: 16 },
  shadows: {
    // Dark mode shadows are subtle; keep same but UI often uses elevations via backgrounds
    card: { color: '#000000', offset: { width: 0, height: 1 }, opacity: 0.3, radius: 6 },
  },
  typography: {
    title: { fontSize: 18, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    footnote: { fontSize: 13, fontWeight: '400' },
  },
};
