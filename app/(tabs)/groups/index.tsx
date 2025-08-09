import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useStore, selectGroupsArray } from '@/store/store';

export default function GroupsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated } = useStore();
  const groups = selectGroupsArray(state);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push({ pathname: '/(tabs)/groups/create' } as never)}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingHorizontal: 8 }]}
        >
          <Text style={{ color: '#007aff', fontWeight: '600' }}>Add</Text>
        </Pressable>
      ),
    });
  }, [navigation, router]);

  if (!hydrated) return null;

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/group/${item.id}`)} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.memberIds.length} members</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>No groups yet. Tap Add to create one.</Text>
        </View>
      }
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
