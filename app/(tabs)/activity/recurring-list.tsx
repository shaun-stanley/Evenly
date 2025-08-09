import React, { useLayoutEffect } from 'react';
import { ActionSheetIOS, FlatList, Platform, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useStore } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { ListItem } from '@/components/ui/ListItem';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { formatCurrency } from '@/utils/currency';
import { colorForActivity } from '@/utils/iconColors';
import { Switch } from 'react-native';

export default function RecurringListScreen() {
  const { state, toggleRecurringActive, deleteRecurring } = useStore();
  const t = useTheme();
  const nav = useNavigation();
  const router = useRouter();

  const data = React.useMemo(() => Object.values(state.recurring).sort((a, b) => b.createdAt - a.createdAt), [state.recurring]);

  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Recurring',
      headerRight: () => (
        <HeaderIconButton
          name="plus"
          accessibilityLabel="New recurring expense"
          accessibilityHint="Create a new recurring expense"
          onPress={() => router.push('/(tabs)/activity/recurring' as never)}
        />
      ),
    });
  }, [nav, router]);

  const onRowPress = (id: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Delete', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (idx) => {
          if (idx === 0) {
            deleteRecurring(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      );
    }
  };

  const ruleLabel = (interval?: number, frequency?: string) => {
    const iv = Math.max(1, interval || 1);
    const base = iv > 1 ? `Every ${iv} ${frequency}s` : `Every ${frequency}`;
    return base;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
      renderItem={({ item }) => (
        <ListItem
          left={<AvatarIcon name="arrow.triangle.2.circlepath" bgColor={colorForActivity('recurring_added')} size={18} containerSize={36} />}
          title={
            <Text style={{ color: item.active ? t.colors.label : t.colors.secondaryLabel, fontSize: 16, fontWeight: '500' }}>
              {item.description}
            </Text>
          }
          subtitle={
            <Text style={{ color: t.colors.secondaryLabel, marginTop: 2 }}>
              {formatCurrency(item.amount)} • {ruleLabel(item.rule.interval, item.rule.frequency)} • Next {new Date(item.nextOccurrenceAt).toLocaleDateString()}
            </Text>
          }
          right={
            <Switch
              value={item.active}
              onValueChange={(v) => {
                toggleRecurringActive(item.id, v);
                Haptics.selectionAsync().catch(() => {});
              }}
              trackColor={{ false: t.colors.separator, true: t.colors.tint }}
            />
          }
          style={{ marginHorizontal: 16, marginTop: 12 }}
          onPress={() => onRowPress(item.id)}
          accessibilityLabel={`${item.description}, ${formatCurrency(item.amount)}, ${ruleLabel(item.rule.interval, item.rule.frequency)}`}
          accessibilityHint="Double tap to open actions"
        />
      )}
      ListEmptyComponent={<View style={{ height: 1 }} />}
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}
