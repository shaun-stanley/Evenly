import React from 'react';
import { Alert, ActionSheetIOS, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { useStore, selectGroup, selectExpensesForGroup, computeGroupTotalsForUserInGroup } from '@/store/store';
import { Swipeable } from 'react-native-gesture-handler';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated, deleteExpense, renameGroup } = useStore();
  const group = useMemo(() => (id ? selectGroup(state, id) : undefined), [state, id]);
  const expenses = useMemo(
    () => (id ? selectExpensesForGroup(state, id) : []),
    [state, id]
  );
  const groupTotals = useMemo(() => (id ? computeGroupTotalsForUserInGroup(state, id) : { owes: 0, owed: 0 }), [state, id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: group?.name ?? 'Group',
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (!id) return;
            if (Platform.OS === 'ios') {
              // @ts-ignore iOS only API
              Alert.prompt('Rename Group', 'Enter a new name', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save', onPress: (text?: string) => { const n = text?.trim(); if (n) renameGroup(String(id), n); } },
              ], 'plain-text', group?.name ?? '');
            } else {
              Alert.alert('Rename', 'Rename is available on iOS for now.');
            }
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 8 })}
        >
          <Text style={{ color: '#007aff', fontWeight: '600' }}>Rename</Text>
        </Pressable>
      ),
    });
  }, [group?.name, navigation, id, renameGroup]);

  if (!hydrated) return null;

  const onExpensePress = (expenseId: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) router.push(`/group/${id}/edit-expense?expenseId=${expenseId}`);
          if (index === 2) {
            Alert.alert('Delete expense?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expenseId) },
            ]);
          }
        }
      );
    } else {
      Alert.alert('Expense', 'Choose an action', [
        { text: 'Edit', onPress: () => router.push(`/group/${id}/edit-expense?expenseId=${expenseId}`) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expenseId) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const renderRightActions = (expenseId: string) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <Pressable
        accessibilityLabel="Edit expense"
        onPress={() => router.push(`/group/${id}/edit-expense?expenseId=${expenseId}`)}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: '#0a84ff' },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.actionText}>Edit</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Delete expense"
        onPress={() =>
          Alert.alert('Delete expense?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expenseId) },
          ])
        }
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: '#ff3b30' },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{group?.name ?? id}</Text>
          <Text style={styles.meta}>{group?.memberIds.length ?? 0} members</Text>
        </View>
        <Pressable style={styles.button} onPress={() => router.push(`/group/${id}/add-expense`)}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your balance in this group</Text>
        {groupTotals.owes === 0 && groupTotals.owed === 0 ? (
          <Text style={styles.muted}>All settled up.</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.muted}>You owe</Text>
            <Text style={[styles.amountNeg]}>${groupTotals.owes.toFixed(2)}</Text>
          </View>
        )}
        {groupTotals.owed > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.muted}>You are owed</Text>
            <Text style={[styles.amountPos]}>${groupTotals.owed.toFixed(2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        {expenses.length === 0 ? (
          <Text style={styles.muted}>No expenses yet.</Text>
        ) : (
          expenses.map((e) => (
            <Swipeable key={e.id} renderRightActions={() => renderRightActions(e.id)} overshootRight={false}>
              <Pressable style={styles.expenseRow} onPress={() => onExpensePress(e.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{e.description}</Text>
                  <Text style={styles.expenseMeta}>Paid by {state.members[e.paidBy]?.name ?? 'Someone'}</Text>
                </View>
                <Text style={styles.expenseAmount}>${e.amount.toFixed(2)}</Text>
              </Pressable>
            </Swipeable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatar: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#e5e7eb', marginRight: 12 },
  name: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#6b7280' },
  amountNeg: { color: '#ef4444', fontWeight: '600' },
  amountPos: { color: '#16a34a', fontWeight: '600' },
  button: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontWeight: '600' },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  expenseTitle: { fontSize: 16, fontWeight: '500' },
  expenseMeta: { color: '#6b7280', marginTop: 2 },
  expenseAmount: { fontWeight: '600' },
  actionButton: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: { color: 'white', fontWeight: '600' },
});
