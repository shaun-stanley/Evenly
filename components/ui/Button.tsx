import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

export type ButtonVariant = 'filled' | 'gray' | 'destructive';

export function Button({
  title,
  onPress,
  icon,
  variant = 'filled',
  style,
  disabled,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  icon?: IconSymbolName;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  const bg = variant === 'filled' ? t.colors.tint : variant === 'destructive' ? t.colors.danger : t.colors.fill;
  const fg: StyleProp<TextStyle> = variant === 'filled' || variant === 'destructive' ? { color: '#fff' } : { color: t.colors.label };
  const iconColor = (variant === 'filled' || variant === 'destructive') ? '#fff' : t.colors.label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        disabled && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon ? <IconSymbol name={icon} color={iconColor as any} size={16} /> : null}
      <Text style={[styles.title, fg]}>{title}</Text>
    </Pressable>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.s,
      paddingHorizontal: t.spacing.l,
      paddingVertical: t.spacing.m,
      borderRadius: t.radius.md,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    title: { fontWeight: '600' },
  });
}
