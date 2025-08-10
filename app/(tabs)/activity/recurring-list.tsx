import React, { useLayoutEffect } from 'react';
import { ActionSheetIOS, Platform, Pressable, Text, View, Alert, Switch, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useStore, selectCurrencyForGroup, selectEffectiveLocale } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { ListItem } from '@/components/ui/ListItem';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { formatCurrency } from '@/utils/currency';
import { colorForActivity } from '@/utils/iconColors';
import { Swipeable } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GroupedSection } from '@/components/ui/GroupedSection';

export default function RecurringListScreen() {
  const { state, toggleRecurringActive, deleteRecurring } = useStore();
  const t = useTheme();
  const nav = useNavigation();
  const router = useRouter();
  const effectiveLocale = selectEffectiveLocale(state);

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
          options: ['Edit', 'Delete', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (idx) => {
          if (idx === 0) {
            router.push(`/(tabs)/activity/recurring-edit/${id}` as never);
          } else if (idx === 1) {
            deleteRecurring(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      );
    } else {
      // Android: go straight to edit for now
      router.push(`/(tabs)/activity/recurring-edit/${id}` as never);
    }
  };

  const renderRightActions = (id: string) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <Pressable
        accessibilityLabel="Edit recurring"
        accessibilityRole="button"
        accessibilityHint="Edits this recurring expense"
        hitSlop={8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          router.push(`/(tabs)/activity/recurring-edit/${id}` as never);
        }}
        style={({ pressed }) => [
          { justifyContent: 'center', alignItems: 'center', width: 88, backgroundColor: t.colors.tint },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <IconSymbol name="pencil" color="#ffffff" size={20} />
          <Text style={{ ...t.text.subheadline, color: '#fff', marginTop: t.spacing.xs }}>Edit</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel="Delete recurring"
        accessibilityRole="button"
        accessibilityHint="Deletes this recurring expense"
        hitSlop={8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          Alert.alert('Delete recurring?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                deleteRecurring(id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              },
            },
          ]);
        }}
        style={({ pressed }) => [
          { justifyContent: 'center', alignItems: 'center', width: 88, backgroundColor: t.colors.danger },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <IconSymbol name="trash" color="#ffffff" size={20} />
          <Text style={{ ...t.text.subheadline, color: '#fff', marginTop: t.spacing.xs }}>Delete</Text>
        </View>
      </Pressable>
    </View>
  );

  const ruleLabel = (interval?: number, frequency?: string) => {
    const iv = Math.max(1, interval || 1);
    const base = iv > 1 ? `Every ${iv} ${frequency}s` : `Every ${frequency}`;
    return base;
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: t.spacing.xxl }}>
      <View style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.m }}>
        <Text style={{ ...t.text.title3, color: t.colors.label }}>Recurring</Text>
      </View>
      {data.length === 0 ? (
        <Text style={{ ...t.text.subheadline, color: t.colors.secondaryLabel, marginHorizontal: t.spacing.l, marginTop: t.spacing.s }}>
          No recurring expenses yet.
        </Text>
      ) : (
        <GroupedSection>
          {data.map((item) => (
            <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)} overshootRight={false}>
              <ListItem
                variant="row"
                left={<AvatarIcon name="arrow.triangle.2.circlepath" bgColor={colorForActivity('recurring_added')} size={18} containerSize={36} />}
                title={item.description}
                subtitle={`${formatCurrency(item.amount, { currency: selectCurrencyForGroup(state, item.groupId), locale: effectiveLocale })} • ${ruleLabel(item.rule.interval, item.rule.frequency)} • Next ${new Date(item.nextOccurrenceAt).toLocaleDateString(effectiveLocale)} ${item.active ? '' : '• Paused'}`}
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
                onPress={() => onRowPress(item.id)}
                accessibilityLabel={`${item.description}, ${formatCurrency(item.amount, { currency: selectCurrencyForGroup(state, item.groupId), locale: effectiveLocale })}, ${ruleLabel(item.rule.interval, item.rule.frequency)}`}
                accessibilityHint="Double tap to open actions"
              />
            </Swipeable>
          ))}
        </GroupedSection>
      )}
      <View style={{ height: t.spacing.xxl }} />
    </ScrollView>
  );
}
