import React, { useLayoutEffect } from 'react';
import { ActionSheetIOS, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useStore, computeUserTotals, selectGroupsArray, computeGroupTotalsForUserInGroup } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { EmptyState } from '@/components/ui/EmptyState';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatCurrency } from '@/utils/currency';

export default function OverviewScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const totals = computeUserTotals(state);
  const groups = selectGroupsArray(state);
  const dateFmt = React.useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }),
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Splitwise',
      headerRight: () => (
        <HeaderIconButton
          name="plus"
          accessibilityLabel="Add group"
          accessibilityHint="Creates a new group"
          onPress={() => router.push({ pathname: '/(tabs)/groups/create' } as never)}
        />
      ),
    });
  }, [navigation, router]);

  if (!hydrated) return null;

  const owesMore = totals.owes >= totals.owed;
  const headline = owesMore ? 'YOU OWE' : 'YOU ARE OWED';
  const headlineColor = owesMore ? t.colors.danger : t.colors.success;
  const headlineAmount = owesMore ? totals.owes : totals.owed;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Haptics.selectionAsync().catch(() => {});
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (groups.length === 0) {
      router.push('/(tabs)/groups/create');
      return;
    }
    if (groups.length === 1) {
      router.push(`/group/${groups[0].id}/add-expense`);
      return;
    }
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Add expense to…',
          options: [...groups.map((g) => g.name), 'Cancel'],
          cancelButtonIndex: groups.length,
        },
        (idx) => {
          if (idx != null && idx >= 0 && idx < groups.length) {
            router.push(`/group/${groups[idx].id}/add-expense`);
          }
        }
      );
    } else {
      router.push('/(tabs)/groups');
    }
  };

  const handleSettleUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Placeholder: navigate to Groups for now
    if (groups.length === 0) router.push('/(tabs)/groups/create');
    else router.push('/(tabs)/groups');
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{headline}</Text>
        <Text style={[styles.balanceAmount, { color: headlineColor }]}>{formatCurrency(headlineAmount)}</Text>
        <Text style={styles.balanceMeta}>Across groups</Text>
      </Card>

      <View style={styles.ctaRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add expense"
          accessibilityHint="Create a new expense in a group"
          onPress={handleAddExpense}
          style={({ pressed }) => [styles.ctaButton, { backgroundColor: t.colors.tint }, pressed && { opacity: 0.8 }]}
        >
          <IconSymbol name="plus" color="#fff" size={16} />
          <Text style={styles.ctaText}>Add expense</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settle up"
          accessibilityHint="Record payments to settle balances"
          onPress={handleSettleUp}
          style={({ pressed }) => [styles.ctaButton, { backgroundColor: t.colors.separator }, pressed && { opacity: 0.8 }]}
        >
          <IconSymbol name="checkmark" color={t.colors.label} size={16} />
          <Text style={[styles.ctaText, { color: t.colors.label }]}>Settle up</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionHeader}>RECENT ACTIVITY</Text>
      {state.activity.slice(0, 5).map((item) => (
        <ListItem
          key={item.id}
          title={<Text style={styles.activityTitle}>{item.message}</Text>}
          right={<Text style={styles.activityDate}>{dateFmt.format(new Date(item.createdAt))}</Text>}
          onPress={() => router.push('/(tabs)/activity')}
          accessibilityLabel={item.message}
          accessibilityHint="Opens the Activity tab"
        />
      ))}
      {state.activity.length === 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          <EmptyState icon="clock" title="No activity yet" message="Add expenses to see recent activity here.">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add your first expense"
              onPress={handleAddExpense}
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.emptyButtonText}>Add your first expense</Text>
            </Pressable>
          </EmptyState>
        </View>
      )}

      <Text style={[styles.sectionHeader, { marginTop: 16 }]}>YOUR GROUPS</Text>
      {groups.map((g) => {
        const gt = computeGroupTotalsForUserInGroup(state, g.id);
        let right: React.ReactNode = <Text style={styles.groupStatusMuted}>Settled up</Text>;
        if (gt.owes > 0) right = <Text style={styles.groupStatusNeg}>You owe {formatCurrency(gt.owes)}</Text>;
        if (gt.owed > 0) right = <Text style={styles.groupStatusPos}>You are owed {formatCurrency(gt.owed)}</Text>;
        return (
          <ListItem
            key={g.id}
            title={<Text style={styles.groupName}>{g.name}</Text>}
            subtitle={<Text style={styles.groupMeta}>{g.memberIds.length} members</Text>}
            showChevron
            right={right}
            accessibilityLabel={`Open group ${g.name}`}
            accessibilityHint="Opens the group details"
            onPress={() => router.push(`/group/${g.id}`)}
          />
        );
      })}
      {groups.length === 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          <EmptyState icon="person.3" title="No groups yet" message="Create a group to start splitting expenses with friends.">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create a group"
              onPress={() => router.push('/(tabs)/groups/create')}
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.emptyButtonText}>Create a group</Text>
            </Pressable>
          </EmptyState>
        </View>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1 },
    balanceCard: { marginHorizontal: 16, marginTop: 16 },
    infoCard: { marginHorizontal: 16, marginTop: 8 },
    balanceLabel: { color: t.colors.secondaryLabel, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
    balanceAmount: { fontSize: 34, fontWeight: '700', marginTop: 4 },
    balanceMeta: { color: t.colors.secondaryLabel, marginTop: 4 },
    sectionHeader: { color: t.colors.secondaryLabel, fontSize: 12, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
    activityTitle: { color: t.colors.label, fontSize: 16, fontWeight: '500' },
    activityDate: { color: t.colors.secondaryLabel },
    groupName: { color: t.colors.label, fontSize: 16, fontWeight: '600' },
    groupMeta: { color: t.colors.secondaryLabel, marginTop: 2 },
    groupStatusNeg: { color: t.colors.danger },
    groupStatusPos: { color: t.colors.success },
    groupStatusMuted: { color: t.colors.secondaryLabel },
    muted: { color: t.colors.secondaryLabel, marginHorizontal: 16 },
    ctaRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 12 },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    ctaText: { color: '#fff', fontWeight: '600' },
    emptyButton: {
      marginTop: 10,
      backgroundColor: t.colors.tint,
      alignSelf: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
    },
    emptyButtonText: { color: '#fff', fontWeight: '600' },
  });
}
