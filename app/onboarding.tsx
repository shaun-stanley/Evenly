import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useHaptics } from '@/hooks/useHaptics';
import { useStore } from '@/store/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const haptics = useHaptics();
  const { setOnboarded } = useStore();

  const [page, setPage] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);

  const pages = React.useMemo(() => [
    {
      key: 'welcome',
      icon: 'sparkles' as const,
      title: 'Welcome to Evenly',
      text: 'Split expenses the Apple way — simple, clear, and delightful. Create groups, add expenses, and settle up with ease.',
    },
    {
      key: 'gestures',
      icon: 'hand.tap' as const,
      title: 'Natural gestures',
      text: 'Swipe on items for quick actions. Long-press to see context menus. Everything feels at home on iOS.',
    },
    {
      key: 'privacy',
      icon: 'lock.shield' as const,
      title: 'Private by design',
      text: 'Your data stays on your device. Export anytime. We respect system settings like locale, haptics, and reduced motion.',
    },
  ], []);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (p !== page) setPage(p);
  };

  const next = () => {
    if (page < pages.length - 1) {
      const targetX = (page + 1) * SCREEN_WIDTH;
      scrollRef.current?.scrollTo({ x: targetX, y: 0, animated: true });
      setPage((p) => p + 1);
      haptics.impact('light');
    } else {
      complete();
    }
  };

  const skip = () => complete();

  const complete = () => {
    haptics.notification(true);
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container]}>
      {/* Top-right Skip */}
      {page < pages.length - 1 ? (
        <Pressable
          onPress={skip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={10}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      ) : null}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        onMomentumScrollEnd={onScrollEnd}
      >
        {pages.map((p) => (
          <View key={p.key} style={[styles.page, { width: SCREEN_WIDTH }]}
            accessibilityLabel={`${p.title}. ${p.text}`}
          >
            <View style={styles.iconCircle}>
              <IconSymbol name={p.icon} size={44} color={t.colors.tint as any} />
            </View>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.body}>{p.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Page indicators */}
      <View style={styles.dotsRow} accessibilityRole="adjustable" accessibilityLabel={`Page ${page + 1} of ${pages.length}`}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaRow}>
        {page < pages.length - 1 ? (
          <Button title="Continue" icon="chevron.right" onPress={next} shape="pill" />
        ) : (
          <Button title="Get Started" icon="checkmark" onPress={next} shape="pill" />
        )}
      </View>
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.colors.systemBackground as any,
      paddingHorizontal: t.spacing.l,
      paddingTop: t.spacing.xl,
      paddingBottom: t.spacing.xl,
    },
    skipBtn: {
      position: 'absolute',
      top: t.spacing.xl,
      right: t.spacing.l,
      zIndex: 2,
      padding: t.spacing.s,
      borderRadius: t.radius.sm,
    },
    skipText: {
      ...t.text.callout,
      color: t.colors.tint as any,
      fontWeight: '600',
    },
    page: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.spacing.l,
      gap: t.spacing.l,
    },
    iconCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (t.colors.tertiaryBackground || t.colors.fill) as any,
      marginBottom: t.spacing.m,
    },
    title: {
      ...t.text.title2,
      color: t.colors.label as any,
      textAlign: 'center',
    },
    body: {
      ...t.text.callout,
      color: t.colors.secondaryLabel as any,
      textAlign: 'center',
    },
    dotsRow: {
      flexDirection: 'row',
      alignSelf: 'center',
      gap: 6,
      marginTop: t.spacing.l,
      marginBottom: t.spacing.l,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: t.colors.separator as any,
      opacity: 0.6,
    },
    dotActive: {
      backgroundColor: t.colors.tint as any,
      opacity: 1,
    },
    ctaRow: {
      alignSelf: 'stretch',
      marginTop: 'auto',
    },
  });
}
