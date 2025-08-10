import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectGroup, selectGroupMemberBalances, selectCurrencyForGroup, computeSettlementSuggestions, selectEffectiveLocale } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';

export default function SettleUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = String(id || '');
  const router = useRouter();
  const { state, addSettlement } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  const group = useMemo(() => (id ? selectGroup(state, groupId) : undefined), [state, id]);
  const currency = selectCurrencyForGroup(state, id ? groupId : undefined);
  const effectiveLocale = selectEffectiveLocale(state);
  const balances = useMemo(() => (id ? selectGroupMemberBalances(state, groupId) : {}), [state, id]);
  const suggestions = useMemo(() => (id ? computeSettlementSuggestions(state, groupId) : []), [state, id]);

  if (!id || !group) return null;

  const nameFor = (mid: string) => state.members[mid]?.name ?? 'Someone';

  const onRecord = (fromId: string, toId: string, amount: number) => {
    Alert.alert(
      'Record payment?',
      `${nameFor(fromId)} → ${nameFor(toId)} ${formatCurrency(amount, { currency, locale: effectiveLocale })}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record',
          style: 'default',
          onPress: () => {
            addSettlement({ groupId, fromMemberId: fromId, toMemberId: toId, amount, note: 'Settle Up' });
          },
        },
      ]
    );
  };

  const orderedMembers = [...group.memberIds];
  orderedMembers.sort((a, b) => (balances[b] ?? 0) - (balances[a] ?? 0));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Balances</Text>
        {orderedMembers.map((mId) => {
          const bal = balances[mId] ?? 0;
          return (
            <ListItem
              key={mId}
              title={<Text style={styles.rowTitle}>{nameFor(mId)}</Text>}
              right={<Text style={[styles.rowAmount, bal < 0 ? styles.neg : bal > 0 ? styles.pos : styles.muted]}>{formatCurrency(Math.abs(bal), { currency, locale: effectiveLocale })}{bal < 0 ? ' owed' : bal > 0 ? ' due' : ''}</Text>}
              accessibilityLabel={`${nameFor(mId)} balance ${formatCurrency(Math.abs(bal), { currency, locale: effectiveLocale })}`}
              style={{ paddingVertical: 10 }}
            />
          );
        })}
      </Card>

      <Card style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.sectionTitle}>Suggested payments</Text>
          {suggestions.length > 0 && (
            <Text style={styles.helperText}>{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</Text>
          )}
        </View>
        {suggestions.length === 0 ? (
          <Text style={styles.muted}>All settled up for now.</Text>
        ) : (
          suggestions.map((s, idx) => (
            <ListItem
              key={`${s.fromMemberId}-${s.toMemberId}-${idx}`}
              title={
                <Text style={styles.rowTitle}>
                  {nameFor(s.fromMemberId)} → {nameFor(s.toMemberId)}
                </Text>
              }
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.rowAmount}>{formatCurrency(s.amount, { currency, locale: effectiveLocale })}</Text>
                  <Button
                    title="Record"
                    accessibilityLabel={`Record ${formatCurrency(s.amount, { currency, locale: effectiveLocale })} from ${nameFor(s.fromMemberId)} to ${nameFor(s.toMemberId)}`}
                    onPress={() => onRecord(s.fromMemberId, s.toMemberId, s.amount)}
                  />
                </View>
              }
              style={{ paddingVertical: 10 }}
              accessibilityHint="Records this settlement"
            />
          ))
        )}
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background, paddingTop: t.spacing.s },
    card: { marginHorizontal: t.spacing.l, marginBottom: t.spacing.l },
    sectionTitle: { fontSize: t.typography.body.fontSize, fontWeight: '600', marginBottom: t.spacing.s, color: t.colors.label },
    rowTitle: { fontSize: t.typography.body.fontSize, color: t.colors.label },
    rowAmount: { fontWeight: '600', color: t.colors.label },
    helperText: { color: t.colors.secondaryLabel },
    muted: { color: t.colors.secondaryLabel },
    pos: { color: t.colors.success },
    neg: { color: t.colors.danger },
  });
}
