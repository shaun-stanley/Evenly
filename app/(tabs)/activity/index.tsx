import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useStore } from '@/store/store';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function ActivityScreen() {
  const { state } = useStore();
  return (
    <FlatList
      data={state.activity}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.text}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>No activity yet.</Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  text: { color: '#111827' },
  time: { color: '#9ca3af', marginTop: 4, fontSize: 12 },
});
