import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import * as Haptics from 'expo-haptics';

export default function EditExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const { state, editExpense } = useStore();

  const expense = expenseId ? state.expenses[String(expenseId)] : undefined;
  const [title, setTitle] = React.useState(expense?.description ?? '');
  const [amount, setAmount] = React.useState(expense ? String(expense.amount) : '');
  const amountRef = React.useRef<TextInput>(null);

  const save = () => {
    if (!expense || !id) return;
    const value = parseFloat(amount);
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
    editExpense({ id: expense.id, description: title.trim(), amount: value });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#6b7280' }}>Expense not found.</Text>
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
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Dinner"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoFocus
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => amountRef.current?.focus()}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            ref={amountRef}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            returnKeyType="done"
            clearButtonMode="while-editing"
          />
          {(() => {
            const v = parseFloat(amount);
            if (!isNaN(v) && v > 0) {
              return <Text style={styles.helper}>Will update to ${v.toFixed(2)}</Text>;
            }
            return null;
          })()}
        </View>

        {(() => {
          const v = parseFloat(amount);
          const valid = title.trim().length > 0 && !isNaN(v) && v > 0;
          return (
            <Pressable style={[styles.primary, !valid && styles.primaryDisabled]} onPress={save} disabled={!valid}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          );
        })()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f3f4f6', flexGrow: 1 },
  field: { marginBottom: 16 },
  label: { marginBottom: 8, color: '#374151' },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  primary: {
    marginTop: 24,
    backgroundColor: '#007aff',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryDisabled: {
    backgroundColor: '#9ec9ff',
  },
  primaryText: { color: 'white', fontWeight: '600', fontSize: 16 },
  helper: { marginTop: 6, color: '#6b7280' },
});
