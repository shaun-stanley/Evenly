import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { toShadowStyle } from '@/utils/shadow';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Apply subtle elevation using theme shadow tokens. Defaults to true. */
  elevated?: boolean;
  /** Which shadow token to use when elevated. Defaults to 'card'. */
  variant?: 'card' | 'floating' | 'modal' | 'header';
  /** Optional hairline outline (disabled by default). */
  outlined?: boolean;
  testID?: string;
};

export function Card({ children, style, padded = true, elevated = true, variant = 'card', outlined = false, testID }: CardProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const shadow = React.useMemo(() => (elevated ? toShadowStyle(t.shadows[variant]) : undefined), [elevated, t, variant]);
  return (
    <View testID={testID} style={[styles.base, outlined && styles.outlined, shadow, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    base: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
    },
    outlined: { borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator as string },
    padded: { paddingHorizontal: t.spacing.l, paddingVertical: t.spacing.l },
  });
}
