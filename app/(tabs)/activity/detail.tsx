import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { useStore, selectEffectiveLocale } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { colorForActivity } from '@/utils/iconColors';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Separator } from '@/components/ui/Separator';

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
  const effectiveLocale = selectEffectiveLocale(state);

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
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: t.spacing.l }}>
      <View style={{ alignItems: 'center', marginTop: t.spacing.s }}>
        <AvatarIcon name={iconForType(item.type)} bgColor={colorForActivity(item.type)} size={28} containerSize={64} />
      </View>

      <Text style={{ ...t.text.title3, color: t.colors.label, textAlign: 'center', marginTop: t.spacing.m }}>
        {item.message}
      </Text>

      <View
        style={{
          marginTop: t.spacing.l,
          backgroundColor: t.colors.card,
          borderRadius: t.radius.md,
          padding: t.spacing.m,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.colors.separator,
        }}
        accessibilityRole="summary"
      >
        <Row label="Type">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.s }}>
            <IconSymbol name={iconForType(item.type)} size={16} color={t.colors.secondaryLabel} />
            <Text style={{ ...t.text.callout, color: t.colors.label }}>{item.type.replace(/_/g, ' ')}</Text>
          </View>
        </Row>
        <Separator inset />
        <Row label="Date">
          <Text style={{ ...t.text.callout, color: t.colors.label }}>{created.toLocaleString(effectiveLocale)}</Text>
        </Row>
        {typeof item.attachmentsCount === 'number' && item.attachmentsCount > 0 ? <Separator inset /> : null}
        {typeof item.attachmentsCount === 'number' && item.attachmentsCount > 0 ? (
          <Row label="Attachments">
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="paperclip" size={16} color={t.colors.secondaryLabel} />
              <Text style={{ marginLeft: t.spacing.xs, ...t.text.callout, color: t.colors.label }}>{item.attachmentsCount}</Text>
            </View>
          </Row>
        ) : null}
      </View>

      <View style={{ height: t.spacing.xxl }} />
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: t.spacing.m }}>
      <Text style={{ width: 110, ...t.text.subheadline, marginRight: t.spacing.s, color: t.colors.secondaryLabel }}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
