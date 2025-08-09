import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/store';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { state, addGroup, hydrated } = useStore();
  const [name, setName] = React.useState('');
  const [selected, setSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const id of Object.keys(state.members)) initial[id] = true;
    return initial;
  });

  if (!hydrated) return null;

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const onCreate = () => {
    const memberIds = Object.keys(selected).filter((id) => selected[id]);
    if (memberIds.length === 0) {
      Alert.alert('Pick members', 'Select at least one member for the group.');
      return;
    }
    const groupName = name.trim() || 'New Group';
    addGroup(groupName, memberIds);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.card}>
        <Text style={styles.label}>Group name</Text>
        <TextInput
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          returnKeyType="done"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Members</Text>
        <FlatList
          data={Object.values(state.members)}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => toggle(item.id)} style={styles.memberRow}>
              <View style={styles.avatar} />
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <View style={[styles.checkbox, selected[item.id] && styles.checkboxOn]} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      </View>

      <View style={{ padding: 16 }}>
        <Pressable onPress={onCreate} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: { fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  avatar: { width: 28, height: 28, borderRadius: 7, backgroundColor: '#e5e7eb', marginRight: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#d1d5db' },
  checkboxOn: { backgroundColor: '#007aff', borderColor: '#007aff' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb' },
  primaryBtn: { backgroundColor: '#007aff', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '600' },
});
