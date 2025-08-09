import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useStore, computeUserTotals } from '@/store/store';

export default function OverviewScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const { state } = useStore();
  const totals = computeUserTotals(state);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: tint }]}>Balances</Text>
        <View style={styles.row}>
          <Text style={styles.label}>You owe</Text>
          <Text style={[styles.value, styles.negative]}>${totals.owes.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>You are owed</Text>
          <Text style={[styles.value, styles.positive]}>${totals.owed.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.title, { color: tint }]}>Quick Actions</Text>
        <Text style={styles.muted}>Add expenses and create groups to get started.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    color: '#555',
  },
  value: {
    fontWeight: '600',
  },
  negative: { color: '#ff3b30' },
  positive: { color: '#34c759' },
  muted: { color: '#6b7280' },
});
