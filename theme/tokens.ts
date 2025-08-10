// iOS 18-inspired design tokens
// Use iOS semantic colors when available for robust dark mode.
import { OpaqueColorValue, Platform, PlatformColor } from 'react-native';

export type ColorTokens = {
  background: string | OpaqueColorValue;
  card: string | OpaqueColorValue; // secondarySystemGroupedBackground
  /** Alias for card to express intent in new components */
  secondaryBackground?: string | OpaqueColorValue;
  /** Tertiary fill surfaces, glass backdrops, tags */
  tertiaryBackground?: string | OpaqueColorValue; // systemFill/tertiarySystemBackground proxy
  label: string | OpaqueColorValue;
  secondaryLabel: string | OpaqueColorValue;
  separator: string | OpaqueColorValue;
  fill: string | OpaqueColorValue; // tertiarySystemFill
  tint: string | OpaqueColorValue; // systemBlue
  link?: string | OpaqueColorValue; // linkColor
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

export type ShadowStyle = {
  color: string;
  offset: { width: number; height: number };
  opacity: number; // keep <= 0.2 for subtle depth cues
  radius: number; // larger blur for soft shadow
  elevation?: number; // Android mapping
};

export type ShadowTokens = {
  /** Standard card elevation used for primary surfaces */
  card: ShadowStyle;
  /** Floating elements (FABs, floating buttons) */
  floating: ShadowStyle;
  /** Modal sheets/dialogs */
  modal: ShadowStyle;
  /** Elevated headers or sticky bars */
  header: ShadowStyle;
};

export type TypographyTokens = {
  title: { fontSize: number; fontWeight: '600' | '700' };
  body: { fontSize: number; fontWeight: '400' | '500' };
  footnote: { fontSize: number; fontWeight: '400' };
};

export type MotionTokens = {
  durations: { fast: number; medium: number; slow: number };
  easing: { standard: (value: number) => number };
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
  motion: MotionTokens;
};

const isiOS = Platform.OS === 'ios';

export const lightTokens: Tokens = {
  colors: {
    background: isiOS ? PlatformColor('systemGroupedBackground') : '#f2f2f7',
    card: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#ffffff',
    secondaryBackground: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#ffffff',
    tertiaryBackground: isiOS ? PlatformColor('tertiarySystemBackground') : '#f2f2f7',
    label: isiOS ? PlatformColor('label') : '#1c1c1e',
    secondaryLabel: isiOS ? PlatformColor('secondaryLabel') : '#8e8e93',
    separator: isiOS ? PlatformColor('separator') : '#e5e5ea',
    fill: isiOS ? PlatformColor('tertiarySystemFill') : '#f2f2f7',
    tint: isiOS ? PlatformColor('systemBlue') : '#007aff',
    link: isiOS ? PlatformColor('link') : '#007aff',
    success: isiOS ? PlatformColor('systemGreen') : '#34c759',
    danger: isiOS ? PlatformColor('systemRed') : '#ff3b30',
    warning: isiOS ? PlatformColor('systemOrange') : '#ff9f0a',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  radius: { sm: 8, md: 12, lg: 16 },
  shadows: {
    card: { color: '#000000', offset: { width: 0, height: 6 }, opacity: 0.12, radius: 14, elevation: 6 },
    floating: { color: '#000000', offset: { width: 0, height: 8 }, opacity: 0.14, radius: 20, elevation: 8 },
    modal: { color: '#000000', offset: { width: 0, height: 10 }, opacity: 0.16, radius: 24, elevation: 10 },
    header: { color: '#000000', offset: { width: 0, height: 3 }, opacity: 0.10, radius: 10, elevation: 4 },
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
  motion: {
    durations: { fast: 160, medium: 300, slow: 550 },
    easing: { standard: (x: number) => x },
  },
};

export const darkTokens: Tokens = {
  colors: {
    background: isiOS ? PlatformColor('systemGroupedBackground') : '#000000',
    card: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#1c1c1e',
    secondaryBackground: isiOS ? PlatformColor('secondarySystemGroupedBackground') : '#1c1c1e',
    tertiaryBackground: isiOS ? PlatformColor('tertiarySystemBackground') : '#2c2c2e',
    label: isiOS ? PlatformColor('label') : '#ffffff',
    secondaryLabel: isiOS ? PlatformColor('secondaryLabel') : '#8e8e93',
    separator: isiOS ? PlatformColor('separator') : '#2c2c2e',
    fill: isiOS ? PlatformColor('tertiarySystemFill') : '#2c2c2e',
    tint: isiOS ? PlatformColor('systemBlue') : '#0a84ff',
    link: isiOS ? PlatformColor('link') : '#0a84ff',
    success: isiOS ? PlatformColor('systemGreen') : '#30d158',
    danger: isiOS ? PlatformColor('systemRed') : '#ff453a',
    warning: isiOS ? PlatformColor('systemOrange') : '#ff9f0a',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 },
  radius: { sm: 8, md: 12, lg: 16 },
  shadows: {
    // Dark mode shadows are more subtle; keep opacity <= 0.2
    card: { color: '#000000', offset: { width: 0, height: 6 }, opacity: 0.18, radius: 14, elevation: 6 },
    floating: { color: '#000000', offset: { width: 0, height: 8 }, opacity: 0.18, radius: 20, elevation: 8 },
    modal: { color: '#000000', offset: { width: 0, height: 10 }, opacity: 0.18, radius: 24, elevation: 10 },
    header: { color: '#000000', offset: { width: 0, height: 3 }, opacity: 0.12, radius: 10, elevation: 4 },
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
  motion: {
    durations: { fast: 160, medium: 300, slow: 550 },
    easing: { standard: (x: number) => x },
  },
};
