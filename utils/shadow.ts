import { Platform, type ViewStyle } from 'react-native';

export type ShadowInput = {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation?: number;
};

export function toShadowStyle(s?: ShadowInput): ViewStyle {
  if (!s) return {} as ViewStyle;
  if (Platform.OS === 'ios') {
    return {
      shadowColor: s.color,
      shadowOffset: s.offset,
      shadowOpacity: s.opacity,
      shadowRadius: s.radius,
    } as ViewStyle;
  }
  return { elevation: s.elevation ?? Math.max(1, Math.ceil(s.radius / 2)) } as ViewStyle;
}
