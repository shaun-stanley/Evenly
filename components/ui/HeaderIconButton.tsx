import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  name: Parameters<typeof IconSymbol>[0]['name'];
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function HeaderIconButton({ name, onPress, accessibilityLabel, accessibilityHint }: Props) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.touchTarget}>
        <IconSymbol name={name} color={t.colors.tint} size={22} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 4, paddingVertical: 4 },
  touchTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
