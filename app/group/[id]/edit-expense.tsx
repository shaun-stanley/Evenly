import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { centsFromText, textFromCents, formatCurrency } from '@/utils/currency';
import { FormField } from '@/components/ui/FormField';

export default function EditExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const { state, editExpense } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  const expense = expenseId ? state.expenses[String(expenseId)] : undefined;
  const [title, setTitle] = React.useState(expense?.description ?? '');
  const [amountCents, setAmountCents] = React.useState(() =>
    expense ? Math.round(Number(expense.amount) * 100) : 0
  );
  const amountRef = React.useRef<TextInput>(null);

  // Split state
  const [splitType, setSplitType] = React.useState<'equal' | 'amount' | 'percent'>(expense?.splitType ?? 'equal');
  const [amountSharesCents, setAmountSharesCents] = React.useState<Record<string, number>>(() =>
    expense?.splitType === 'amount' && expense.shares
      ? Object.fromEntries(Object.entries(expense.shares).map(([k, v]) => [k, Math.round(Number(v) * 100)]))
      : {}
  );
  const [percentShares, setPercentShares] = React.useState<Record<string, number>>(() =>
    expense?.splitType === 'percent' && expense.shares
      ? Object.fromEntries(Object.entries(expense.shares).map(([k, v]) => [k, Number(v)]))
      : {}
  );

  const save = () => {
    if (!expense || !id) return;
    const value = amountCents / 100;
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert('Title required', 'Please enter a description.');
      return;
    }
    if (isNaN(value) || value <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Invalid amount', 'Enter a valid amount greater than 0.');
      return;
    }
    const shares =
      splitType === 'amount'
        ? Object.fromEntries(Object.entries(amountSharesCents).map(([k, v]) => [k, (v || 0) / 100]))
        : splitType === 'percent'
        ? percentShares
        : undefined;
    editExpense({ id: expense.id, description: title.trim(), amount: value, splitType, shares });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text style={{ color: t.colors.secondaryLabel }}>Expense not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <FormField label="Title" required>
          <TextInput
            placeholder="Dinner"
            placeholderTextColor={t.colors.secondaryLabel}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            accessibilityLabel="Title"
            accessibilityHint="Edit the description for this expense"
            autoFocus
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => amountRef.current?.focus()}
            clearButtonMode="while-editing"
            autoCapitalize="words"
          />
        </FormField>
        <FormField
          label="Split"
          helper={splitType === 'equal' ? 'Split equally among members' : splitType === 'amount' ? 'Enter amounts per person (we will normalize to total)' : 'Enter percentage per person (we will normalize to 100%)'}
        >
          <View style={styles.segmentRow} accessibilityRole="tablist">
            {(['equal', 'amount', 'percent'] as const).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setSplitType(opt)}
                style={[styles.segment, splitType === opt && styles.segmentSelected]}
                accessibilityRole="tab"
                accessibilityState={{ selected: splitType === opt }}
                accessibilityLabel={opt === 'equal' ? 'Equal' : opt === 'amount' ? 'Amount' : 'Percent'}
                hitSlop={8}
              >
                <Text style={[styles.segmentText, splitType === opt && styles.segmentTextSelected]}>
                  {opt === 'equal' ? 'Equal' : opt === 'amount' ? 'Amount' : 'Percent'}
                </Text>
              </Pressable>
            ))}
          </View>
        </FormField>

        {(() => {
          const group = expense ? state.groups[expense.groupId] : undefined;
          if (!group || splitType === 'equal') return null;
          return (
            <View>
              {group.memberIds.map((mid) => (
                <FormField key={mid} label={state.members[mid]?.name ?? 'Member'}>
                  {splitType === 'amount' ? (
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={t.colors.secondaryLabel}
                      keyboardType="number-pad"
                      value={textFromCents(amountSharesCents[mid] || 0)}
                      onChangeText={(tx) =>
                        setAmountSharesCents((prev) => ({ ...prev, [mid]: centsFromText(tx) }))
                      }
                      style={styles.input}
                      accessibilityLabel={`Amount for ${state.members[mid]?.name ?? 'member'}`}
                      returnKeyType="done"
                      clearButtonMode="while-editing"
                    />
                  ) : (
                    <TextInput
                      placeholder="0"
                      placeholderTextColor={t.colors.secondaryLabel}
                      keyboardType="number-pad"
                      value={String(percentShares[mid] ?? '')}
                      onChangeText={(tx) =>
                        setPercentShares((prev) => ({ ...prev, [mid]: Number((tx || '0').replace(/\D/g, '')) }))
                      }
                      style={styles.input}
                      accessibilityLabel={`Percent for ${state.members[mid]?.name ?? 'member'}`}
                      returnKeyType="done"
                      clearButtonMode="while-editing"
                    />
                  )}
                </FormField>
              ))}
            </View>
          );
        })()}

        <FormField
          label="Amount"
          required
          helper={(() => {
            const v = amountCents / 100;
            if (!isNaN(v) && v > 0) return <Text style={styles.helper}>Will update to {formatCurrency(v)}</Text>;
            return null;
          })()}
        >
          <TextInput
            ref={amountRef}
            placeholder="0.00"
            placeholderTextColor={t.colors.secondaryLabel}
            keyboardType="number-pad"
            value={textFromCents(amountCents)}
            onChangeText={(tx) => setAmountCents(centsFromText(tx))}
            style={styles.input}
            accessibilityLabel="Amount"
            accessibilityHint="Edit the amount in dollars and cents"
            returnKeyType="done"
            clearButtonMode="while-editing"
          />
        </FormField>

        {(() => {
          const v = amountCents / 100;
          const valid = title.trim().length > 0 && !isNaN(v) && amountCents > 0;
          return (
            <Pressable
              style={[styles.primary, !valid && styles.primaryDisabled]}
              onPress={save}
              disabled={!valid}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              accessibilityHint="Updates this expense"
              accessibilityState={{ disabled: !valid }}
              hitSlop={8}
            >
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          );
        })()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { padding: 16, backgroundColor: t.colors.background, flexGrow: 1 },
    field: { marginBottom: 16 },
    label: { marginBottom: 8, color: t.colors.secondaryLabel },
    input: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: t.colors.label,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    segmentRow: {
      flexDirection: 'row',
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      padding: 4,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: t.radius.sm,
    },
    segmentSelected: {
      backgroundColor: t.colors.tint,
    },
    segmentText: { color: t.colors.label },
    segmentTextSelected: { color: 'white', fontWeight: '600' },
    primary: {
      marginTop: 24,
      backgroundColor: t.colors.tint,
      borderRadius: t.radius.md,
      alignItems: 'center',
      paddingVertical: 12,
    },
    primaryDisabled: {
      opacity: 0.5,
    },
    primaryText: { color: 'white', fontWeight: '600', fontSize: 16 },
    helper: { marginTop: 6, color: t.colors.secondaryLabel },
  });
}
