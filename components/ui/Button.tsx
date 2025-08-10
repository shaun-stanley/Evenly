import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

export type ButtonVariant = 'filled' | 'gray' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'rounded' | 'pill';

export function Button({
  title,
  onPress,
  icon,
  variant = 'filled',
  size = 'medium',
  shape = 'rounded',
  block = false,
  style,
  disabled,
  accessibilityLabel,
  accessibilityHint,
}: {
  title: string;
  onPress: () => void;
  icon?: IconSymbolName;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const haptics = useHaptics();

  const bg = variant === 'filled' ? t.colors.tint : variant === 'destructive' ? t.colors.danger : t.colors.fill;
  const fg: StyleProp<TextStyle> = variant === 'filled' || variant === 'destructive' ? { color: '#fff' } : { color: t.colors.label };
  const iconColor = (variant === 'filled' || variant === 'destructive') ? '#fff' : t.colors.label;

  const sizeStyle = size === 'small' ? styles.sizeSmall : size === 'large' ? styles.sizeLarge : styles.sizeMedium;
  const shapeStyle = shape === 'pill' ? styles.shapePill : styles.shapeRounded;
  const textStyle = size === 'small' ? styles.titleSmall : size === 'large' ? styles.titleLarge : styles.title;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={10}
      onPress={() => {
        if (disabled) return;
        haptics.impact('medium');
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        sizeStyle,
        shapeStyle,
        { backgroundColor: bg },
        block && { alignSelf: 'stretch', justifyContent: 'center' },
        disabled && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon ? <IconSymbol name={icon} color={iconColor as any} size={iconSize} /> : null}
      <Text allowFontScaling style={[textStyle, fg]}>{title}</Text>
    </Pressable>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.s,
      minHeight: 44,
    },
    sizeSmall: { paddingHorizontal: t.spacing.m, paddingVertical: t.spacing.s },
    sizeMedium: { paddingHorizontal: t.spacing.l, paddingVertical: t.spacing.m },
    sizeLarge: { paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.l },
    shapeRounded: { borderRadius: t.radius.md },
    shapePill: { borderRadius: 999 },
    title: { ...t.text.callout, fontWeight: '600' },
    titleSmall: { ...t.text.footnote, fontWeight: '600' },
    titleLarge: { ...t.text.body, fontWeight: '600' },
  });
}
