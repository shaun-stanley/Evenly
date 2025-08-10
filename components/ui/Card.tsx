import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  testID?: string;
};

export function Card({ children, style, padded = true, testID }: CardProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  return (
    <View testID={testID} style={[styles.base, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    base: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    padded: { paddingHorizontal: t.spacing.l, paddingVertical: t.spacing.l },
  });
}
