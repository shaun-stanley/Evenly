import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useStore } from '@/store/store';
import { useTheme } from '@/hooks/useTheme';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AvatarIcon } from '@/components/ui/AvatarIcon';
import { colorForActivity } from '@/utils/iconColors';
import { useNavigation, useRouter } from 'expo-router';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

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
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(), []);
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <HeaderIconButton
            name="arrow.triangle.2.circlepath"
            accessibilityLabel="Recurring list"
            accessibilityHint="View and manage recurring expenses"
            onPress={() => router.push('/(tabs)/activity/recurring-list' as never)}
          />
          <HeaderIconButton
            name="plus"
            accessibilityLabel="New recurring expense"
            accessibilityHint="Create a new recurring expense"
            onPress={() => router.push('/(tabs)/activity/recurring' as never)}
          />
        </View>
      ),
    });
  }, [navigation, router]);

  const iconForType = (type: string) => {
    switch (type) {
      case 'expense_added':
        return 'plus' as const;
      case 'expense_edited':
        return 'pencil' as const;
      case 'expense_deleted':
        return 'trash' as const;
      case 'group_created':
        return 'person.3' as const;
      case 'group_renamed':
        return 'textformat' as const;
      case 'recurring_added':
      case 'recurring_edited':
      case 'recurring_deleted':
        return 'arrow.triangle.2.circlepath' as const;
      default:
        return 'clock' as const;
    }
  };

  return (
    <FlatList
      data={state.activity}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
      renderItem={({ item }) => {
        const showAttach = (item.type === 'expense_added' || item.type === 'expense_edited') && (item as any).attachmentsCount > 0;
        return (
          <ListItem
            left={<AvatarIcon name={iconForType(item.type)} bgColor={colorForActivity(item.type)} size={18} containerSize={36} />}
            title={<Text style={{ color: t.colors.label, fontSize: 16, fontWeight: '500' }}>{item.message}</Text>}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {showAttach ? (
                  <View
                    accessible
                    accessibilityLabel={`${(item as any).attachmentsCount} attachments`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      backgroundColor: t.colors.fill,
                    }}
                  >
                    <IconSymbol name="paperclip" size={14} color={t.colors.secondaryLabel} />
                    <Text style={{ marginLeft: 4, color: t.colors.secondaryLabel, fontSize: 12 }}>
                      {(item as any).attachmentsCount}
                    </Text>
                  </View>
                ) : null}
                <Text style={{ color: t.colors.secondaryLabel }}>{timeAgo(item.createdAt)}</Text>
              </View>
            }
            style={{ marginHorizontal: 16, marginTop: 12 }}
            accessibilityLabel={item.message}
            accessibilityHint="Activity item"
          />
        );
      }}
      ListEmptyComponent={
        <View style={{ padding: 16 }}>
          <EmptyState icon="clock" title="No activity yet" message="Your recent activity will appear here as you add expenses and make changes." />
        </View>
      }
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

function makeStyles() {
  return StyleSheet.create({});
}
