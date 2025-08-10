import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type SeparatorProps = {
  style?: StyleProp<ViewStyle>;
  inset?: boolean; // left inset to align with content inside cards/lists
  vertical?: boolean; // render a vertical separator
  color?: string; // optional override
  testID?: string;
};

export function Separator({ style, inset = false, vertical = false, color, testID }: SeparatorProps) {
  const t = useTheme();
  const hairline = StyleSheet.hairlineWidth;
  const base: ViewStyle = vertical
    ? { width: hairline, height: '100%' }
    : { height: hairline, width: '100%' };

  const insetStyle: ViewStyle | undefined = !vertical && inset ? { marginLeft: t.spacing.l } : undefined;

  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={[
        base,
        { backgroundColor: color ?? (t.colors.separator as string) },
        insetStyle,
        style,
      ]}
    />
  );
}

export default Separator;
