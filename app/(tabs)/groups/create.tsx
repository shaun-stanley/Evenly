import React from 'react';
import { Alert, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListItem } from '@/components/ui/ListItem';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { state, addGroup, hydrated } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const [name, setName] = React.useState('');
  const [selected, setSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const id of Object.keys(state.members)) initial[id] = true;
    return initial;
  });

  if (!hydrated) return null;

  const toggle = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

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

  const members = Object.values(state.members);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Details section */}
      <GroupedSection>
        <ListItem
          variant="row"
          title="Group name"
          right={
            <TextInput
              placeholder="Enter name"
              placeholderTextColor={t.colors.secondaryLabel}
              value={name}
              onChangeText={setName}
              style={styles.inputRow}
              returnKeyType="done"
              accessibilityLabel="Group name"
              clearButtonMode="while-editing"
            />
          }
        />
      </GroupedSection>

      {/* Members section */}
      <GroupedSection>
        <ListItem variant="row" title="Members" />
        {members.map((m) => (
          <ListItem
            key={m.id}
            variant="row"
            left={<View style={styles.avatar} />}
            title={m.name}
            onPress={() => toggle(m.id)}
            right={selected[m.id] ? <IconSymbol name="checkmark" color={t.colors.tint} size={18} /> : undefined}
            accessibilityLabel={`Toggle ${m.name}`}
            accessibilityRole="button"
          />
        ))}
      </GroupedSection>

      {/* Create button */}
      {(() => {
        const selectedCount = Object.values(selected).filter(Boolean).length;
        const canCreate = selectedCount > 0;
        return (
          <Button
            title="Create"
            onPress={onCreate}
            disabled={!canCreate}
            accessibilityLabel="Create group"
            style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.l, marginBottom: t.spacing.xl }}
          />
        );
      })()}
    </ScrollView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    inputRow: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 17,
      color: t.colors.label,
      minWidth: 160,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: t.colors.fill,
      marginRight: 10,
    },
  });
}
