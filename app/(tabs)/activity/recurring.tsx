import React, { useLayoutEffect } from 'react';
import { ActionSheetIOS, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useStore, selectGroupsArray, selectCurrencyForGroup, selectEffectiveLocale } from '@/store/store';
import type { RecurrenceFrequency } from '@/store/types';
import { useTheme } from '@/hooks/useTheme';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { centsFromText, textFromCents, formatCurrency } from '@/utils/currency';
import { GroupedSection } from '@/components/ui/GroupedSection';

export default function NewRecurringScreen() {
  const { state, addRecurring } = useStore();
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const groups = selectGroupsArray(state);
  const effectiveLocale = selectEffectiveLocale(state);

  const [description, setDescription] = React.useState('');
  const [amountCents, setAmountCents] = React.useState(0);
  const [groupId, setGroupId] = React.useState(groups[0]?.id);
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>('monthly');
  const [interval, setInterval] = React.useState<string>('1');
  const currency = selectCurrencyForGroup(state, groupId);

  const canSave = description.trim().length > 0 && amountCents > 0 && !!groupId;

  const onPickGroup = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose group…',
          options: [...groups.map((g) => g.name), 'Cancel'],
          cancelButtonIndex: groups.length,
        },
        (idx) => {
          if (idx != null && idx >= 0 && idx < groups.length) setGroupId(groups[idx].id);
        }
      );
    } else {
      // Fallback: just jump to groups tab for now
      router.push('/(tabs)/groups' as never);
    }
  };

  const onSave = React.useCallback(() => {
    if (!canSave || !groupId) return;
    const n = amountCents / 100;
    const iv = Math.max(1, parseInt(interval || '1', 10) || 1);
    addRecurring({
      groupId,
      description: description.trim(),
      amount: n,
      paidBy: state.currentMemberId,
      splitType: 'equal',
      rule: { frequency, interval: iv, startDate: Date.now() },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  }, [addRecurring, amountCents, canSave, description, frequency, groupId, interval, router, state.currentMemberId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Recurring',
      headerRight: () => (
        <HeaderIconButton
          name="checkmark"
          accessibilityLabel="Save recurring expense"
          accessibilityHint="Saves the recurring expense"
          onPress={onSave}
          disabled={!canSave}
        />
      ),
    });
  }, [navigation, onSave, canSave]);

  if (groups.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, padding: 16 }}>
        <EmptyState
          icon="person.3"
          title="No groups yet"
          message="Create a group first to add a recurring expense."
        >
          <Button title="Create a group" variant="filled" onPress={() => router.push('/(tabs)/groups/create' as never)} />
        </EmptyState>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: t.spacing.xxl }}>
        {/* Details section */}
        <View style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.l }}>
          <Text style={{ ...t.text.footnote, color: t.colors.secondaryLabel, fontWeight: '700' }}>DETAILS</Text>
        </View>
        <GroupedSection>
          <ListItem
            variant="row"
            title="Group"
            right={<Text style={{ color: t.colors.secondaryLabel }}>{state.groups[groupId!]?.name}</Text>}
            showChevron
            onPress={onPickGroup}
            accessibilityLabel="Choose group"
          />
          <ListItem
            variant="row"
            title="Description"
            right={
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Rent"
                autoCapitalize="sentences"
                autoCorrect
                returnKeyType="next"
                placeholderTextColor={t.colors.secondaryLabel}
                style={{
                  color: t.colors.label,
                  textAlign: 'right',
                  minWidth: 140,
                  paddingVertical: 0,
                }}
              />
            }
          />
          <ListItem
            variant="row"
            title="Amount"
            right={
              <TextInput
                value={textFromCents(amountCents)}
                onChangeText={(tx) => setAmountCents(centsFromText(tx))}
                placeholder="0.00"
                keyboardType="number-pad"
                returnKeyType="done"
                placeholderTextColor={t.colors.secondaryLabel}
                style={{
                  color: t.colors.label,
                  textAlign: 'right',
                  minWidth: 100,
                  paddingVertical: 0,
                }}
              />
            }
          />
        </GroupedSection>
        {(() => {
          const v = amountCents / 100;
          if (!isNaN(v) && v > 0)
            return (
              <Text style={{ color: t.colors.secondaryLabel, marginHorizontal: t.spacing.l, marginTop: t.spacing.s }}>
                Will create {formatCurrency(v, { currency, locale: effectiveLocale })} on schedule
              </Text>
            );
          return null;
        })()}

        {/* Frequency section */}
        <View style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.l }}>
          <Text style={{ ...t.text.footnote, color: t.colors.secondaryLabel, fontWeight: '700' }}>FREQUENCY</Text>
        </View>
        <GroupedSection>
          <View style={{ paddingHorizontal: t.spacing.l, paddingVertical: t.spacing.m }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s }}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as RecurrenceFrequency[]).map((f) => {
                const selected = f === frequency;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFrequency(f)}
                    accessibilityRole="button"
                    accessibilityLabel={`Frequency ${f}`}
                    style={({ pressed }) => [
                      {
                        backgroundColor: selected ? t.colors.tint : t.colors.fill,
                        paddingHorizontal: t.spacing.m,
                        paddingVertical: t.spacing.s,
                        borderRadius: t.radius.md,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={{ ...t.text.subheadline, color: selected ? '#fff' : t.colors.label, fontWeight: '600' }}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <ListItem
            variant="row"
            title="Every"
            right={
              <TextInput
                value={interval}
                onChangeText={(tx) => setInterval(tx.replace(/\D/g, ''))}
                placeholder="1"
                keyboardType="number-pad"
                placeholderTextColor={t.colors.secondaryLabel}
                style={{ color: t.colors.label, textAlign: 'right', minWidth: 60, paddingVertical: 0 }}
              />
            }
            accessibilityHint={`Applies every ${interval || '1'} ${frequency}${(parseInt(interval || '1', 10) || 1) > 1 ? 's' : ''}.`}
          />
        </GroupedSection>

        {/* Primary save action */}
        <View style={{ marginHorizontal: t.spacing.l }}>
          <Button
            title="Save recurring"
            variant="filled"
            onPress={onSave}
            disabled={!canSave}
            accessibilityLabel="Save recurring expense"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
