import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useStore, selectGroupsArray } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { ListItem } from '@/components/ui/ListItem';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { colorForGroup } from '@/utils/iconColors';
import { EmptyState } from '@/components/ui/EmptyState';

export default function GroupsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, hydrated } = useStore();
  const groups = selectGroupsArray(state);
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  useLayoutEffect(() => {
    navigation.setOptions({
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

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
      renderItem={({ item }) => (
        <ListItem
          title={<Text style={styles.name}>{item.name}</Text>}
          subtitle={<Text style={styles.meta}>{item.memberIds.length} members</Text>}
          left={<AvatarIcon name="person.3" bgColor={colorForGroup(item.id)} size={18} containerSize={36} />}
          showChevron
          accessibilityLabel={`Open group ${item.name}`}
          accessibilityHint="Opens the group details"
          onPress={() => router.push(`/group/${item.id}`)}
        />
      )}
      ListEmptyComponent={<EmptyState icon="person.3" title="No groups yet" message="Tap Add to create your first group." />}
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: t.colors.label },
    meta: { color: t.colors.secondaryLabel, marginTop: 2 },
  });
}
