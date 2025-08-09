import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const SAMPLE_ACTIVITY = [
  { id: '1', text: 'You added Dinner: $45.00' },
  { id: '2', text: 'Alex settled up with you: $20.00' },
];

export default function ActivityScreen() {
  return (
    <FlatList
      data={SAMPLE_ACTIVITY}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      )}
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
});
