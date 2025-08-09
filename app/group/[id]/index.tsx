import React from 'react';
import { Alert, ActionSheetIOS, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect, useMemo } from 'react';
import { useStore, selectGroup, selectExpensesForGroup, computeGroupTotalsForUserInGroup } from '@/store/store';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated, deleteExpense, renameGroup } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
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
        <HeaderIconButton
          name="pencil"
          accessibilityLabel="Rename group"
          accessibilityHint="Opens a prompt to rename this group"
          onPress={() => {
            if (!id) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if (Platform.OS === 'ios') {
              // @ts-ignore iOS only API
              Alert.prompt(
                'Rename Group',
                'Enter a new name',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Save',
                    onPress: (text?: string) => {
                      const n = text?.trim();
                      if (n) renameGroup(String(id), n);
                    },
                  },
                ],
                'plain-text',
                group?.name ?? ''
              );
            } else {
              Alert.alert('Rename', 'Rename is available on iOS for now.');
            }
          }}
        />
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
        accessibilityRole="button"
        accessibilityHint="Edits this expense"
        hitSlop={8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          router.push(`/group/${id}/edit-expense?expenseId=${expenseId}`);
        }}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: t.colors.tint },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <IconSymbol name="pencil" color="#ffffff" size={20} />
          <Text style={styles.actionText}>Edit</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel="Delete expense"
        accessibilityRole="button"
        accessibilityHint="Deletes this expense"
        hitSlop={8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          Alert.alert('Delete expense?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expenseId) },
          ]);
        }}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: t.colors.danger },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <IconSymbol name="trash" color="#ffffff" size={20} />
          <Text style={styles.actionText}>Delete</Text>
        </View>
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
        <Pressable
          accessibilityLabel="Add expense"
          accessibilityRole="button"
          accessibilityHint="Adds a new expense"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push(`/group/${id}/add-expense`);
          }}
          hitSlop={8}
          style={({ pressed }) => [{ padding: 6, borderRadius: 8 }, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="plus.circle.fill" color={t.colors.tint} size={28} />
        </Pressable>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Your balance in this group</Text>
        {groupTotals.owes === 0 && groupTotals.owed === 0 ? (
          <Text style={styles.muted}>All settled up.</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.muted}>You owe</Text>
            <Text style={[styles.amountNeg]}>{formatCurrency(groupTotals.owes)}</Text>
          </View>
        )}
        {groupTotals.owed > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={styles.muted}>You are owed</Text>
            <Text style={[styles.amountPos]}>{formatCurrency(groupTotals.owed)}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        {expenses.length === 0 ? (
          <EmptyState icon="tray" message="No expenses yet." />
        ) : (
          expenses.map((e) => (
            <Swipeable key={e.id} renderRightActions={() => renderRightActions(e.id)} overshootRight={false}>
              <ListItem
                title={<Text style={styles.expenseTitle}>{e.description}</Text>}
                subtitle={<Text style={styles.expenseMeta}>Paid by {state.members[e.paidBy]?.name ?? 'Someone'}</Text>}
                right={<Text style={styles.expenseAmount}>{formatCurrency(e.amount)}</Text>}
                accessibilityLabel={`Expense ${e.description}, ${formatCurrency(e.amount)}, paid by ${state.members[e.paidBy]?.name ?? 'someone'}`}
                accessibilityHint="Opens options for this expense"
                onPress={() => onExpensePress(e.id)}
              />
            </Swipeable>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background, paddingTop: t.spacing.s },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.card,
      padding: t.spacing.l,
      margin: t.spacing.l,
      borderRadius: t.radius.lg,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    avatar: { width: 44, height: 44, borderRadius: 10, backgroundColor: t.colors.separator, marginRight: t.spacing.m },
    name: { fontSize: t.typography.title.fontSize, fontWeight: t.typography.title.fontWeight as any, color: t.colors.label },
    meta: { color: t.colors.secondaryLabel, marginTop: 2 },
    card: { marginHorizontal: t.spacing.l, marginBottom: t.spacing.l },
    sectionTitle: { fontSize: t.typography.body.fontSize, fontWeight: '600', marginBottom: t.spacing.s, color: t.colors.label },
    muted: { color: t.colors.secondaryLabel },
    amountNeg: { color: t.colors.danger, fontWeight: '600' },
    amountPos: { color: t.colors.success, fontWeight: '600' },
    button: {
      backgroundColor: t.colors.tint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    buttonText: { color: 'white', fontWeight: '600' },
    expenseTitle: { fontSize: t.typography.body.fontSize, fontWeight: '500' as any, color: t.colors.label },
    expenseMeta: { color: t.colors.secondaryLabel, marginTop: 2 },
    expenseAmount: { fontWeight: '600', color: t.colors.label },
    actionButton: {
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    actionText: { color: 'white', fontWeight: '600' },
  });
}
