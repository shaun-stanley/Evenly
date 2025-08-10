// iOS 18-inspired design tokens
// Use iOS semantic colors when available for robust dark mode.
import { OpaqueColorValue, Platform, PlatformColor } from 'react-native';

export type ColorTokens = {
  background: string | OpaqueColorValue;
  card: string | OpaqueColorValue;
  label: string | OpaqueColorValue;
  secondaryLabel: string | OpaqueColorValue;
  separator: string | OpaqueColorValue;
  fill: string | OpaqueColorValue; // tertiarySystemFill
  tint: string | OpaqueColorValue; // systemBlue
  success: string | OpaqueColorValue; // systemGreen
  danger: string | OpaqueColorValue; // systemRed
  warning: string | OpaqueColorValue; // systemOrange
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

export type TextTokens = {
  largeTitle: { fontSize: number; fontWeight: '700' };
  title1: { fontSize: number; fontWeight: '700' };
  title2: { fontSize: number; fontWeight: '700' };
  title3: { fontSize: number; fontWeight: '600' };
  headline: { fontSize: number; fontWeight: '600' };
  subheadline: { fontSize: number; fontWeight: '400' | '500' };
  body: { fontSize: number; fontWeight: '400' };
  callout: { fontSize: number; fontWeight: '400' };
  footnote: { fontSize: number; fontWeight: '400' };
  caption1: { fontSize: number; fontWeight: '400' };
  caption2: { fontSize: number; fontWeight: '400' };
};

export type Tokens = {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  typography: TypographyTokens;
  text: TextTokens;
};

const isiOS = Platform.OS === 'ios';

export const lightTokens: Tokens = {
  colors: {
    background: isiOS ? PlatformColor('systemGroupedBackground') : '#f2f2f7',
    card: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#ffffff',
    label: isiOS ? PlatformColor('label') : '#1c1c1e',
    secondaryLabel: isiOS ? PlatformColor('secondaryLabel') : '#8e8e93',
    separator: isiOS ? PlatformColor('separator') : '#e5e5ea',
    fill: isiOS ? PlatformColor('tertiarySystemFill') : '#f2f2f7',
    tint: isiOS ? PlatformColor('systemBlue') : '#007aff',
    success: isiOS ? PlatformColor('systemGreen') : '#34c759',
    danger: isiOS ? PlatformColor('systemRed') : '#ff3b30',
    warning: isiOS ? PlatformColor('systemOrange') : '#ff9f0a',
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
  text: {
    largeTitle: { fontSize: 34, fontWeight: '700' },
    title1: { fontSize: 28, fontWeight: '700' },
    title2: { fontSize: 22, fontWeight: '700' },
    title3: { fontSize: 20, fontWeight: '600' },
    headline: { fontSize: 17, fontWeight: '600' },
    subheadline: { fontSize: 15, fontWeight: '400' },
    body: { fontSize: 17, fontWeight: '400' },
    callout: { fontSize: 16, fontWeight: '400' },
    footnote: { fontSize: 13, fontWeight: '400' },
    caption1: { fontSize: 12, fontWeight: '400' },
    caption2: { fontSize: 11, fontWeight: '400' },
  },
};

export const darkTokens: Tokens = {
  colors: {
    background: isiOS ? PlatformColor('systemGroupedBackground') : '#000000',
    card: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#1c1c1e',
    label: isiOS ? PlatformColor('label') : '#ffffff',
    secondaryLabel: isiOS ? PlatformColor('secondaryLabel') : '#8e8e93',
    separator: isiOS ? PlatformColor('separator') : '#2c2c2e',
    fill: isiOS ? PlatformColor('tertiarySystemFill') : '#2c2c2e',
    tint: isiOS ? PlatformColor('systemBlue') : '#0a84ff',
    success: isiOS ? PlatformColor('systemGreen') : '#30d158',
    danger: isiOS ? PlatformColor('systemRed') : '#ff453a',
    warning: isiOS ? PlatformColor('systemOrange') : '#ff9f0a',
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
  text: {
    largeTitle: { fontSize: 34, fontWeight: '700' },
    title1: { fontSize: 28, fontWeight: '700' },
    title2: { fontSize: 22, fontWeight: '700' },
    title3: { fontSize: 20, fontWeight: '600' },
    headline: { fontSize: 17, fontWeight: '600' },
    subheadline: { fontSize: 15, fontWeight: '400' },
    body: { fontSize: 17, fontWeight: '400' },
    callout: { fontSize: 16, fontWeight: '400' },
    footnote: { fontSize: 13, fontWeight: '400' },
    caption1: { fontSize: 12, fontWeight: '400' },
    caption2: { fontSize: 11, fontWeight: '400' },
  },
};
