import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle, type AccessibilityRole } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from './IconSymbol';
import * as Haptics from 'expo-haptics';

export type ListItemProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  showChevron?: boolean;
  disabled?: boolean;
  testID?: string;
  enableHaptics?: boolean;
  inset?: boolean; // controls outer margins when pressable
  variant?: 'card' | 'row'; // visual style
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
};

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  style,
  showChevron = false,
  disabled = false,
  testID,
  enableHaptics = true,
  inset = true,
  variant = 'card',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: ListItemProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  const Content = (
    <View
      style={[
        styles.containerBase,
        variant === 'card' ? styles.containerCard : styles.containerRow,
        style,
      ]}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.center}>
        {typeof title === 'string' ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle ? (
          typeof subtitle === 'string' ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          )
        ) : null}
      </View>
      <View style={styles.right}>
        {right}
        {showChevron ? (
          <IconSymbol name="chevron.right" color={t.colors.secondaryLabel} size={18} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        hitSlop={8}
        onPress={() => {
          if (enableHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          onPress();
        }}
        style={({ pressed }) => [
          variant === 'card' && styles.pressable,
          variant === 'card' && !inset && { marginHorizontal: 0, marginTop: 0 },
          pressed && { opacity: 0.6 },
        ]}
      >
        {Content}
      </Pressable>
    );
  }

  return Content;
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    pressable: {
      marginHorizontal: t.spacing.l,
      marginTop: t.spacing.m,
    },
    containerBase: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.l,
      paddingVertical: t.spacing.m,
      minHeight: 44,
    },
    containerCard: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    containerRow: {
      backgroundColor: 'transparent',
    },
    left: { marginRight: t.spacing.m },
    center: { flex: 1 },
    right: { marginLeft: t.spacing.s, flexDirection: 'row', alignItems: 'center' },
    title: { ...t.text.headline, color: t.colors.label },
    subtitle: { ...t.text.subheadline, marginTop: t.spacing.xs, color: t.colors.secondaryLabel },
  });
}
