import React from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '@/store/store';

export default function EditExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const { state, editExpense } = useStore();

  const expense = expenseId ? state.expenses[String(expenseId)] : undefined;
  const [title, setTitle] = React.useState(expense?.description ?? '');
  const [amount, setAmount] = React.useState(expense ? String(expense.amount) : '');

  const save = () => {
    if (!expense || !id) return;
    const value = parseFloat(amount);
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a description.');
      return;
    }
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount greater than 0.');
      return;
    }
    editExpense({ id: expense.id, description: title.trim(), amount: value });
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
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Dinner"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
        />
      </View>

      <Pressable style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
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
  primaryText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
