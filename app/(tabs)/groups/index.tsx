import React, { useLayoutEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
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
  // Using ListItem's built-in typography; no local styles needed

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
      contentContainerStyle={{ paddingBottom: t.spacing.xxl, paddingTop: t.spacing.s }}
      renderItem={({ item }) => (
        <ListItem
          title={item.name}
          subtitle={`${item.memberIds.length} members`}
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
