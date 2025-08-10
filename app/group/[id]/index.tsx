import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, ActionSheetIOS, Platform, Pressable, ScrollView, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
 
import { useStore, selectGroup, selectExpensesForGroup, computeGroupTotalsForUserInGroup, selectCurrencyForGroup, selectEffectiveLocale } from '@/store/store';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/currency';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { BlurView } from 'expo-blur';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated, deleteExpense, renameGroup, setGroupCurrency } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const group = useMemo(() => (id ? selectGroup(state, id) : undefined), [state, id]);
  const expenses = useMemo(
    () => (id ? selectExpensesForGroup(state, id) : []),
    [state, id]
  );
  const groupTotals = useMemo(() => (id ? computeGroupTotalsForUserInGroup(state, id) : { owes: 0, owed: 0 }), [state, id]);
  const currency = selectCurrencyForGroup(state, id ? String(id) : undefined);
  const effectiveLocale = selectEffectiveLocale(state);
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);
  const [compact, setCompact] = useState(false);

  // Animated net balance (counts up/down smoothly)
  const net = (groupTotals?.owed ?? 0) - (groupTotals?.owes ?? 0);
  const netAnim = useRef(new Animated.Value(0)).current;
  const [netDisplay, setNetDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(netAnim, {
      toValue: net,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = netAnim.addListener(({ value }) => setNetDisplay(value));
    return () => {
      netAnim.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: group?.name ?? 'Group',
      headerRight: () => (
        <HeaderIconButton
          name="ellipsis.circle"
          accessibilityLabel="More options"
          accessibilityHint="Shows actions for this group"
          onPress={() => {
            if (Platform.OS === 'ios') {
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  title: group?.name ?? 'Group',
                  options: ['Rename Group', 'Change Currency', 'View Recurring', 'Cancel'],
                  cancelButtonIndex: 3,
                },
                (idx) => {
                  if (idx === 0) {
                    // Rename
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
                            if (n && id) renameGroup(String(id), n);
                          },
                        },
                      ],
                      'plain-text',
                      group?.name ?? ''
                    );
                  } else if (idx === 1) {
                    onPickCurrency();
                  } else if (idx === 2) {
                    router.push('/(tabs)/activity/recurring-list' as never);
                  }
                }
              );
            } else {
              Alert.alert('Options', undefined, [
                { text: 'Rename Group', onPress: () => Alert.alert('Rename', 'Available on iOS for now.') },
                { text: 'Change Currency', onPress: onPickCurrency },
                { text: 'View Recurring', onPress: () => router.push('/(tabs)/activity/recurring-list' as never) },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }
          }}
        />
      ),
      headerTitle: compact
        ? () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.colors.separator, marginRight: t.spacing.s }} />
              <Text style={{ ...t.text.headline, color: t.colors.label }} numberOfLines={1}>
                {group?.name ?? 'Group'}
              </Text>
            </View>
          )
        : undefined,
    });
  }, [group?.name, navigation, router, id, renameGroup, t.colors.separator, t.colors.label, t.spacing.s, compact]);

  if (!hydrated) return null;

  const onPickCurrency = () => {
    setShowCurrencyPicker(true);
  };

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
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const isCompact = y > 8;
          if (isCompact !== compact) setCompact(isCompact);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: t.spacing.xxl * 2 }}
      >
        {/* Glass balance card */}
        <View style={styles.glassCard}>
          <BlurView tint="default" intensity={40} style={StyleSheet.absoluteFillObject} />
          <View style={styles.glassInner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.sectionTitle}>Net balance</Text>
              {(groupTotals.owes > 0 || groupTotals.owed > 0) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Settle up"
                  accessibilityHint="Record settlements"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    router.push(`/group/${id}/settle-up`);
                  }}
                  style={({ pressed }) => [styles.settlePill, pressed && { opacity: 0.8 }]}
                >
                  <IconSymbol name="checkmark.circle" color="#ffffff" size={16} />
                  <Text style={styles.settlePillText}>Settle Up</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.largeBalance}>
              {formatCurrency(netDisplay, { currency, locale: effectiveLocale })}
            </Text>
            <View style={styles.pillsRow}>
              <View style={[styles.pill, styles.pillDanger]}>
                <IconSymbol name="arrow.down.circle.fill" color={t.colors.danger as string} size={18} />
                <Text style={styles.pillLabelDanger}>You owe</Text>
                <Text style={styles.pillAmountDanger}>
                  {formatCurrency(groupTotals.owes, { currency, locale: effectiveLocale })}
                </Text>
              </View>
              <View style={[styles.pill, styles.pillSuccess]}>
                <IconSymbol name="arrow.up.circle.fill" color={t.colors.success as string} size={18} />
                <Text style={styles.pillLabelSuccess}>You are owed</Text>
                <Text style={styles.pillAmountSuccess}>
                  {formatCurrency(groupTotals.owed, { currency, locale: effectiveLocale })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Group</Text>
        </View>
        <GroupedSection>
          <ListItem
            variant="row"
            title={"Currency"}
            subtitle={"Applies only to this group"}
            right={
              <Text style={styles.expenseAmount}>
                {group?.currency ? group.currency : `Default (${state.settings.currency})`}
              </Text>
            }
            showChevron
            onPress={onPickCurrency}
            accessibilityLabel={`Currency ${group?.currency ? group.currency : `Default (${state.settings.currency})`}`}
            accessibilityHint="Opens currency picker"
          />
        </GroupedSection>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Expenses</Text>
        </View>
        {expenses.length === 0 ? (
          <EmptyState icon="tray" message="No expenses yet." />
        ) : (
          <GroupedSection>
            {expenses.map((e) => (
              <Swipeable key={e.id} renderRightActions={() => renderRightActions(e.id)} overshootRight={false}>
                <ListItem
                  variant="row"
                  left={<IconSymbol name={symbolForExpense(e.description)} color={t.colors.secondaryLabel} size={18} />}
                  title={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{e.description}</Text>
                      {e.attachments && e.attachments.length > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: t.spacing.s }}>
                          <IconSymbol name="paperclip" color={t.colors.secondaryLabel} size={14} />
                          <Text style={styles.attachCount}>{e.attachments.length}</Text>
                        </View>
                      ) : null}
                    </View>
                  }
                  subtitle={
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      Paid by {state.members[e.paidBy]?.name ?? 'Someone'}
                    </Text>
                  }
                  right={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {e.comments && e.comments.length > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: t.spacing.s }}>
                          <IconSymbol name="text.bubble" color={t.colors.secondaryLabel} size={16} />
                          <Text style={styles.attachCount}>{e.comments.length}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.expenseAmount}>{formatCurrency(e.amount, { currency: selectCurrencyForGroup(state, e.groupId), locale: effectiveLocale })}</Text>
                    </View>
                  }
                  accessibilityLabel={`Expense ${e.description}, ${formatCurrency(e.amount, { currency: selectCurrencyForGroup(state, e.groupId), locale: effectiveLocale })}, paid by ${state.members[e.paidBy]?.name ?? 'someone'}`}
                  accessibilityHint="Opens options for this expense"
                  onPress={() => onExpensePress(e.id)}
                  onLongPress={() => onExpensePress(e.id)}
                />
              </Swipeable>
            ))}
          </GroupedSection>
        )}
      </ScrollView>

      {/* Floating glass FAB */}
      <View pointerEvents="box-none" style={styles.fabWrap}>
        <Pressable
          accessibilityLabel="Add"
          accessibilityHint="Adds a new expense"
          onPress={() => {
            if (!id) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push(`/group/${id}/add-expense`);
          }}
          onLongPress={() => {
            if (Platform.OS === 'ios') {
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: ['Add Expense', 'Add Note (soon)', 'Scan Receipt (soon)', 'Cancel'],
                  cancelButtonIndex: 3,
                },
                (idx) => {
                  if (idx === 0) router.push(`/group/${id}/add-expense`);
                }
              );
            } else {
              router.push(`/group/${id}/add-expense`);
            }
          }}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <BlurView tint="default" intensity={28} style={StyleSheet.absoluteFillObject} />
          <IconSymbol name="plus" color="#ffffff" size={22} />
        </Pressable>
      </View>

      <CurrencyPicker
        visible={showCurrencyPicker}
        selectedCode={group?.currency}
        includeDefaultOption={{ label: `Use default (${state.settings.currency})`, value: undefined }}
        onSelect={(code) => {
          if (!id) return;
          setGroupCurrency(String(id), code);
        }}
        onClose={() => setShowCurrencyPicker(false)}
        title="Currency"
      />
    </View>
  );
}

function symbolForExpense(desc: string): string {
  const d = (desc || '').toLowerCase();
  if (/(food|dinner|lunch|meal|restaurant|pizza|burger|cafe)/.test(d)) return 'fork.knife';
  if (/(grocery|grocer|market|bread|shopping|store|supermarket|bag)/.test(d)) return 'bag.fill';
  if (/(breakfast|morning|sun)/.test(d)) return 'sun.max.fill';
  if (/(taxi|uber|ride|cab|transport|bus|train|car)/.test(d)) return 'car.fill';
  if (/(flight|air|plane)/.test(d)) return 'airplane';
  if (/(rent|home|house|apartment)/.test(d)) return 'house.fill';
  if (/(gift|present)/.test(d)) return 'gift.fill';
  if (/(ticket|movie|cinema)/.test(d)) return 'ticket.fill';
  return 'creditcard';
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    glassCard: {
      marginHorizontal: t.spacing.l,
      marginTop: t.spacing.l,
      borderRadius: t.radius.lg,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.separator,
    },
    glassInner: { padding: t.spacing.l },
    largeBalance: { ...t.text.largeTitle, color: t.colors.label, marginTop: t.spacing.s, fontVariant: ['tabular-nums'] },
    pillsRow: { flexDirection: 'row', gap: t.spacing.s, marginTop: t.spacing.m },
    pill: {
      flex: 1,
      borderRadius: t.radius.md,
      paddingHorizontal: t.spacing.m,
      paddingVertical: t.spacing.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.separator,
      backgroundColor: t.colors.fill,
    },
    pillLabelDanger: { ...t.text.subheadline, color: t.colors.danger, marginTop: 2 },
    pillLabelSuccess: { ...t.text.subheadline, color: t.colors.success, marginTop: 2 },
    pillAmountDanger: { ...t.text.title2, color: t.colors.danger, fontVariant: ['tabular-nums'] },
    pillAmountSuccess: { ...t.text.title2, color: t.colors.success, fontVariant: ['tabular-nums'] },
    pillDanger: {},
    pillSuccess: {},
    settlePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.xs,
      paddingHorizontal: t.spacing.m,
      paddingVertical: 6,
      backgroundColor: t.colors.tint,
      borderRadius: 999,
    },
    settlePillText: { ...t.text.subheadline, color: '#ffffff', fontWeight: '600' },
    sectionHeaderContainer: { marginHorizontal: t.spacing.l, marginTop: t.spacing.l },
    sectionTitle: { ...t.text.title3, color: t.colors.label, marginBottom: t.spacing.s },
    itemTitle: { ...t.text.body, color: t.colors.label },
    itemSubtitle: { ...t.text.caption1, color: t.colors.secondaryLabel },
    expenseAmount: { ...t.text.body, color: t.colors.label, fontVariant: ['tabular-nums'] },
    actionButton: {
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    actionText: { ...t.text.subheadline, color: 'white', fontWeight: '600' },
    attachCount: { marginLeft: t.spacing.xs, ...t.text.caption1, color: t.colors.secondaryLabel },
    fabWrap: { position: 'absolute', bottom: t.spacing.xxl, right: t.spacing.xl },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.separator,
      backgroundColor: t.colors.tint,
    },
  });
}
