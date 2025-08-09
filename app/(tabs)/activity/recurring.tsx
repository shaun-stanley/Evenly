import React, { useLayoutEffect } from 'react';
import { ActionSheetIOS, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useStore, selectGroupsArray } from '@/store/store';
import type { RecurrenceFrequency } from '@/store/types';
import { useTheme } from '@/hooks/useTheme';
import { FormField } from '@/components/ui/FormField';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

export default function NewRecurringScreen() {
  const { state, addRecurring } = useStore();
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const groups = selectGroupsArray(state);

  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState<string>('');
  const [groupId, setGroupId] = React.useState(groups[0]?.id);
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>('monthly');
  const [interval, setInterval] = React.useState<string>('1');

  const canSave = description.trim().length > 0 && Number(amount) > 0 && !!groupId;

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
    const n = Number(amount);
    const iv = Math.max(1, Number(interval) || 1);
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
  }, [addRecurring, amount, canSave, description, frequency, groupId, interval, router, state.currentMemberId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Recurring',
      headerRight: () => (
        <HeaderIconButton
          name="checkmark"
          accessibilityLabel="Save recurring expense"
          accessibilityHint="Saves the recurring expense"
          onPress={onSave}
        />
      ),
    });
  }, [navigation, onSave]);

  if (groups.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, padding: 16 }}>
        <EmptyState
          icon="person.3"
          title="No groups yet"
          message="Create a group first to add a recurring expense."
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/groups/create' as never)}
            style={({ pressed }) => [{ backgroundColor: t.colors.tint, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }, pressed && { opacity: 0.8 }]}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Create a group</Text>
          </Pressable>
        </EmptyState>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 24 }}>
        <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
          <ListItem
            title={<Text style={{ color: t.colors.label, fontWeight: '600' }}>Group</Text>}
            right={<Text style={{ color: t.colors.secondaryLabel }}>{state.groups[groupId!]?.name}</Text>}
            showChevron
            inset={false}
            onPress={onPickGroup}
            accessibilityLabel="Choose group"
          />
          <FormField label="Description">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Rent"
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="next"
              style={{
                backgroundColor: t.colors.card,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
          <FormField label="Amount">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
              style={{
                backgroundColor: t.colors.card,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
        </Card>

        <Card style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 24 }}>
          <Text style={{ color: t.colors.secondaryLabel, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>FREQUENCY</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as RecurrenceFrequency[]).map((f) => {
              const selected = f === frequency;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: selected ? t.colors.tint : t.colors.card,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      shadowColor: t.shadows.card.color,
                      shadowOffset: t.shadows.card.offset,
                      shadowOpacity: t.shadows.card.opacity,
                      shadowRadius: t.shadows.card.radius,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ color: selected ? '#fff' : t.colors.label, fontWeight: '600' }}>{f[0].toUpperCase() + f.slice(1)}</Text>
                </Pressable>
              );
            })}
          </View>
          <FormField label="Every" helper={`Applies every ${interval || '1'} ${frequency}${Number(interval || '1') > 1 ? 's' : ''}.`}>
            <TextInput
              value={interval}
              onChangeText={setInterval}
              placeholder="1"
              keyboardType="number-pad"
              style={{
                backgroundColor: t.colors.card,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
