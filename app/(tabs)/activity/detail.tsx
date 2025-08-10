import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { useStore } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { colorForActivity } from '@/utils/iconColors';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';

function iconForType(type: string) {
  switch (type) {
    case 'expense_added':
      return 'plus' as const;
    case 'expense_edited':
      return 'pencil' as const;
    case 'expense_deleted':
      return 'trash' as const;
    case 'group_created':
      return 'person.3' as const;
    case 'group_renamed':
      return 'textformat' as const;
    case 'recurring_added':
    case 'recurring_edited':
    case 'recurring_deleted':
      return 'arrow.triangle.2.circlepath' as const;
    case 'settlement_recorded':
      return 'checkmark.circle' as const;
    case 'comment_added':
      return 'text.bubble' as const;
    default:
      return 'clock' as const;
  }
}

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state } = useStore();
  const t = useTheme();
  const nav = useNavigation();

  const item = state.activity.find((a) => a.id === id);

  useLayoutEffect(() => {
    nav.setOptions({ title: 'Activity' });
  }, [nav]);

  if (!item) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <EmptyState icon="exclamationmark.triangle" title="Not found" message="We couldn't find this activity item." />
      </View>
    );
  }

  const created = new Date(item.createdAt);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <AvatarIcon name={iconForType(item.type)} bgColor={colorForActivity(item.type)} size={28} containerSize={64} />
      </View>

      <Text style={{ color: t.colors.label, fontSize: 20, fontWeight: '600', textAlign: 'center', marginTop: 12 }}>
        {item.message}
      </Text>

      <View
        style={{
          marginTop: 16,
          backgroundColor: t.colors.card,
          borderRadius: 12,
          padding: 12,
          shadowColor: t.shadows.card.color,
          shadowOffset: t.shadows.card.offset,
          shadowOpacity: t.shadows.card.opacity,
          shadowRadius: t.shadows.card.radius,
        }}
        accessibilityRole="summary"
      >
        <Row label="Type">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSymbol name={iconForType(item.type)} size={16} color={t.colors.secondaryLabel} />
            <Text style={{ color: t.colors.label, fontSize: 16 }}>{item.type.replace(/_/g, ' ')}</Text>
          </View>
        </Row>
        <Row label="Date">
          <Text style={{ color: t.colors.label, fontSize: 16 }}>{created.toLocaleString()}</Text>
        </Row>
        {typeof item.attachmentsCount === 'number' && item.attachmentsCount > 0 ? (
          <Row label="Attachments">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="paperclip" size={16} color={t.colors.secondaryLabel} />
              <Text style={{ marginLeft: 6, color: t.colors.label, fontSize: 16 }}>{item.attachmentsCount}</Text>
            </View>
          </Row>
        ) : null}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: t.colors.secondaryLabel }]}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    width: 110,
    fontSize: 14,
    marginRight: 8,
  },
});
