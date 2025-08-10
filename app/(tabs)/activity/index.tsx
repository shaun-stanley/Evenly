import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
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
      case 'settlement_recorded':
        return 'checkmark.circle' as const;
      case 'comment_added':
        return 'text.bubble' as const;
      default:
        return 'clock' as const;
    }
  };

  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'expenses' | 'recurring' | 'groups' | 'settlements' | 'comments'>('all');

  const matchesFilter = (type: string) => {
    if (filter === 'all') return true;
    if (filter === 'expenses') return type === 'expense_added' || type === 'expense_edited' || type === 'expense_deleted';
    if (filter === 'recurring') return type === 'recurring_added' || type === 'recurring_edited' || type === 'recurring_deleted';
    if (filter === 'groups') return type === 'group_created' || type === 'group_renamed';
    if (filter === 'settlements') return type === 'settlement_recorded';
    if (filter === 'comments') return type === 'comment_added';
    return true;
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.activity.filter((a) => matchesFilter(a.type) && (q.length === 0 || a.message.toLowerCase().includes(q)));
  }, [state.activity, query, filter]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: t.spacing.xxl, paddingTop: t.spacing.m }}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: t.spacing.l, marginBottom: t.spacing.xs }}>
          <View
            style={{
              backgroundColor: t.colors.card,
              borderRadius: 12,
              paddingHorizontal: t.spacing.m,
              paddingVertical: t.spacing.s,
              shadowColor: t.shadows.card.color,
              shadowOffset: t.shadows.card.offset,
              shadowOpacity: t.shadows.card.opacity,
              shadowRadius: t.shadows.card.radius,
            }}
          >
            <TextInput
              placeholder="Search activity"
              placeholderTextColor={t.colors.secondaryLabel}
              value={query}
              onChangeText={setQuery}
              style={{ color: t.colors.label, fontSize: 16, paddingVertical: t.spacing.s }}
              accessibilityLabel="Search activity"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <View
            accessibilityRole="tablist"
            style={{ marginTop: t.spacing.m, flexDirection: 'row', backgroundColor: t.colors.card, borderRadius: t.radius.sm, padding: t.spacing.xs }}
          >
            {(['all', 'expenses', 'recurring', 'groups', 'settlements', 'comments'] as const).map((f) => (
              <Text
                key={f}
                onPress={() => setFilter(f)}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === f }}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  paddingVertical: t.spacing.s,
                  borderRadius: t.radius.sm,
                  color: filter === f ? 'white' : t.colors.label,
                  backgroundColor: filter === f ? t.colors.tint : 'transparent',
                  fontWeight: filter === f ? '600' : '400',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            ))}
          </View>
        </View>
      }
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
                      paddingHorizontal: t.spacing.s,
                      paddingVertical: t.spacing.xs,
                      borderRadius: t.radius.sm,
                      backgroundColor: t.colors.fill,
                    }}
                  >
                    <IconSymbol name="paperclip" size={14} color={t.colors.secondaryLabel} />
                    <Text style={{ marginLeft: t.spacing.xs, color: t.colors.secondaryLabel, fontSize: 12 }}>
                      {(item as any).attachmentsCount}
                    </Text>
                  </View>
                ) : null}
                <Text style={{ color: t.colors.secondaryLabel }}>{timeAgo(item.createdAt)}</Text>
              </View>
            }
            accessibilityLabel={item.message}
            accessibilityHint="Activity item"
            onPress={() => router.push({ pathname: '/(tabs)/activity/detail', params: { id: item.id } } as never)}
          />
        );
      }}
      ListEmptyComponent={
        <View style={{ padding: t.spacing.l }}>
          {state.activity.length === 0 ? (
            <EmptyState icon="clock" title="No activity yet" message="Your recent activity will appear here as you add expenses and make changes." />
          ) : (
            <EmptyState icon="magnifyingglass" title="No results" message={query || filter !== 'all' ? 'Try adjusting your search or filters.' : 'No matching items.'} />
          )}
        </View>
      }
      ListFooterComponent={<View style={{ height: t.spacing.xxl }} />}
    />
  );
}

function makeStyles() {
  return StyleSheet.create({});
}
