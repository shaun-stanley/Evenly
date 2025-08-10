import React from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

export type Segment = { key: string; label: string };

export type SegmentedControlProps = {
  segments: Segment[];
  selectedKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  testID?: string;
};

export function SegmentedControl({ segments, selectedKey, onChange, style, scrollable = true, testID }: SegmentedControlProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const haptics = useHaptics();

  const content = (
    <View
      accessibilityRole="tablist"
      style={[styles.container, style]}
      testID={testID}
    >
      {segments.map((seg) => {
        const selected = seg.key === selectedKey;
        return (
          <Pressable
            key={seg.key}
            onPress={() => {
              if (seg.key !== selectedKey) haptics.impact('light');
              onChange(seg.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{seg.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.fill,
      borderRadius: t.radius.sm,
      padding: 2,
      gap: 4,
    },
    scrollContent: { paddingHorizontal: 4 },
    segment: {
      paddingHorizontal: t.spacing.m,
      paddingVertical: t.spacing.s,
      borderRadius: t.radius.sm,
      backgroundColor: 'transparent',
    },
    segmentSelected: {
      backgroundColor: t.colors.tint,
    },
    label: {
      ...t.text.subheadline,
      color: t.colors.label,
      fontWeight: '500',
    },
    labelSelected: {
      color: '#fff',
      fontWeight: '600',
    },
  });
}

export default SegmentedControl;
