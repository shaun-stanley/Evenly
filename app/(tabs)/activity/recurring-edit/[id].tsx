import React, { useLayoutEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useStore, selectCurrencyForGroup, selectEffectiveLocale } from '@/store/store';
import type { RecurrenceFrequency } from '@/store/types';
import { useTheme } from '@/hooks/useTheme';
import { FormField } from '@/components/ui/FormField';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { ListItem } from '@/components/ui/ListItem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { centsFromText, textFromCents, formatCurrency } from '@/utils/currency';

export default function EditRecurringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, editRecurring, deleteRecurring } = useStore();
  const rec = id ? state.recurring[String(id)] : undefined;
  const t = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [description, setDescription] = React.useState(rec?.description ?? '');
  const [amountCents, setAmountCents] = React.useState(Math.round((rec?.amount ?? 0) * 100));
  const [frequency, setFrequency] = React.useState<RecurrenceFrequency>(rec?.rule.frequency ?? 'monthly');
  const [interval, setInterval] = React.useState<string>(String(rec?.rule.interval ?? 1));
  const currency = rec ? selectCurrencyForGroup(state, rec.groupId) : state.settings.currency;

  const canSave = !!rec && description.trim().length > 0 && amountCents > 0;
  const effectiveLocale = selectEffectiveLocale(state);

  const onSave = React.useCallback(() => {
    if (!rec || !id || !canSave) return;
    const n = amountCents / 100;
    const iv = Math.max(1, parseInt(interval || '1', 10) || 1);
    editRecurring({
      id: String(id),
      description: description.trim(),
      amount: n,
      rule: { frequency, interval: iv, startDate: rec.rule.startDate },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  }, [amountCents, canSave, description, editRecurring, frequency, id, interval, rec, router]);

  const onDelete = React.useCallback(() => {
    if (!rec || !id) return;
    Alert.alert('Delete recurring?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRecurring(String(id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          router.back();
        },
      },
    ]);
  }, [deleteRecurring, id, rec, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Recurring',
      headerRight: () => (
        <HeaderIconButton
          name="checkmark"
          accessibilityLabel="Save recurring expense"
          accessibilityHint="Saves the changes"
          onPress={onSave}
          disabled={!canSave}
        />
      ),
    });
  }, [navigation, onSave, canSave]);

  if (!rec) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: t.colors.secondaryLabel }}>Recurring item not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: t.spacing.xxl }}>
        <Card style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.l }}>
          <ListItem
            title="Group"
            right={<Text style={{ color: t.colors.secondaryLabel }}>{state.groups[rec.groupId]?.name}</Text>}
            inset={false}
            accessibilityLabel="Group"
            accessibilityHint="Group cannot be changed"
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
                borderRadius: t.radius.md,
                paddingHorizontal: t.spacing.m,
                paddingVertical: t.spacing.m,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
          <FormField
            label="Amount"
            helper={(() => {
              const v = amountCents / 100;
              if (!isNaN(v) && v > 0) return <Text style={{ color: t.colors.secondaryLabel }}>Will create {formatCurrency(v, { currency, locale: effectiveLocale })} on schedule</Text>;
              return null;
            })()}
          >
            <TextInput
              value={textFromCents(amountCents)}
              onChangeText={(tx) => setAmountCents(centsFromText(tx))}
              placeholder="0.00"
              keyboardType="number-pad"
              returnKeyType="done"
              style={{
                backgroundColor: t.colors.card,
                borderRadius: t.radius.md,
                paddingHorizontal: t.spacing.m,
                paddingVertical: t.spacing.m,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
        </Card>

        <Card style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.m, marginBottom: t.spacing.xxl }}>
          <Text style={{ ...t.text.footnote, color: t.colors.secondaryLabel, fontWeight: '700', marginBottom: t.spacing.s }}>FREQUENCY</Text>
          <View style={{ flexDirection: 'row', gap: t.spacing.s }}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as RecurrenceFrequency[]).map((f) => {
              const selected = f === frequency;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: selected ? t.colors.tint : t.colors.card,
                      paddingHorizontal: t.spacing.m,
                      paddingVertical: t.spacing.s,
                      borderRadius: t.radius.md,
                      shadowColor: t.shadows.card.color,
                      shadowOffset: t.shadows.card.offset,
                      shadowOpacity: t.shadows.card.opacity,
                      shadowRadius: t.shadows.card.radius,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ ...t.text.subheadline, color: selected ? '#fff' : t.colors.label, fontWeight: '600' }}>{f[0].toUpperCase() + f.slice(1)}</Text>
                </Pressable>
              );
            })}
          </View>
          <FormField label="Every" helper={`Applies every ${interval || '1'} ${frequency}${(parseInt(interval || '1', 10) || 1) > 1 ? 's' : ''}.`}>
            <TextInput
              value={interval}
              onChangeText={(tx) => setInterval(tx.replace(/\D/g, ''))}
              placeholder="1"
              keyboardType="number-pad"
              style={{
                backgroundColor: t.colors.card,
                borderRadius: t.radius.md,
                paddingHorizontal: t.spacing.m,
                paddingVertical: t.spacing.m,
                color: t.colors.label,
                borderWidth: 1,
                borderColor: t.colors.separator,
              }}
            />
          </FormField>
        </Card>

        <View style={{ marginHorizontal: t.spacing.l, gap: t.spacing.m }}>
          <Button title="Save changes" variant="filled" onPress={onSave} disabled={!canSave} accessibilityLabel="Save recurring changes" />
          <Button title="Delete recurring" variant="destructive" onPress={onDelete} accessibilityLabel="Delete recurring" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
