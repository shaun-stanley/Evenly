import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const SAMPLE_GROUPS = [
  { id: 'trip-rome', name: 'Rome Trip', members: 4 },
  { id: 'apt-401', name: 'Apartment 401', members: 3 },
];

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <FlatList
      data={SAMPLE_GROUPS}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/group/${item.id}`)} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.members} members</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 24, color: '#9ca3af', marginLeft: 8 },
});
