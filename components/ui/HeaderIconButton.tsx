import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  name: Parameters<typeof IconSymbol>[0]['name'];
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
};

export function HeaderIconButton({ name, onPress, accessibilityLabel, accessibilityHint, disabled }: Props) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        disabled ? { opacity: 0.4 } : pressed ? { opacity: 0.6 } : null,
      ]}
    >
      <View style={styles.touchTarget}>
        <IconSymbol name={name} color={disabled ? t.colors.secondaryLabel : t.colors.tint} size={22} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 4, paddingVertical: 4 },
  touchTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
