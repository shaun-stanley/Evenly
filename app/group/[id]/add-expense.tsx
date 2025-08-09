import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectCurrencyForGroup } from '@/store/store';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { centsFromText, textFromCents, formatCurrency } from '@/utils/currency';
import { FormField } from '@/components/ui/FormField';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import type { Attachment } from '@/store/types';

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const [title, setTitle] = React.useState('');
  const [amountCents, setAmountCents] = React.useState(0);
  const amountRef = React.useRef<TextInput>(null);
  const { addExpense, state } = useStore();
  const currency = selectCurrencyForGroup(state, id ? String(id) : undefined);

  // Split state
  const [splitType, setSplitType] = React.useState<'equal' | 'amount' | 'percent'>('equal');
  const [amountSharesCents, setAmountSharesCents] = React.useState<Record<string, number>>({});
  const [percentShares, setPercentShares] = React.useState<Record<string, number>>({});
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);

  const pickImages = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
      });
      if (!res.canceled) {
        const next = res.assets.map((a: ImagePicker.ImagePickerAsset) => ({
          id: `att_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
          uri: a.uri,
          type: a.mimeType,
          width: a.width,
          height: a.height,
          createdAt: Date.now(),
        }));
        setAttachments((prev) => [...prev, ...next]);
      }
    } catch (e) {
      console.warn('Image pick failed', e);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const save = () => {
    const value = amountCents / 100;
    if (!id) return;
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert('Title required', 'Please enter a description.');
      return;
    }
    if (isNaN(value) || value <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Invalid amount', 'Enter a valid amount greater than 0.');
      return;
    }
    const shares =
      splitType === 'amount'
        ? Object.fromEntries(Object.entries(amountSharesCents).map(([k, v]) => [k, (v || 0) / 100]))
        : splitType === 'percent'
        ? percentShares
        : undefined;
    addExpense({ groupId: id, description: title.trim(), amount: value, splitType, shares, attachments });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <FormField label="Title" required>
          <TextInput
            placeholder="Dinner"
            placeholderTextColor={t.colors.secondaryLabel}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            accessibilityLabel="Title"
            accessibilityHint="Enter a short description for this expense"
            autoFocus
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => amountRef.current?.focus()}
            clearButtonMode="while-editing"
            autoCapitalize="words"
          />
        </FormField>

        {/* Split type selector */}
        <FormField label="Split" helper={splitType === 'equal' ? 'Split equally among members' : splitType === 'amount' ? 'Enter amounts per person (we will normalize to total)' : 'Enter percentage per person (we will normalize to 100%)'}>
          <View style={styles.segmentRow} accessibilityRole="tablist">
            {(['equal', 'amount', 'percent'] as const).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setSplitType(opt)}
                style={[styles.segment, splitType === opt && styles.segmentSelected]}
                accessibilityRole="tab"
                accessibilityState={{ selected: splitType === opt }}
                accessibilityLabel={opt === 'equal' ? 'Equal' : opt === 'amount' ? 'Amount' : 'Percent'}
                hitSlop={8}
              >
                <Text style={[styles.segmentText, splitType === opt && styles.segmentTextSelected]}>{opt === 'equal' ? 'Equal' : opt === 'amount' ? 'Amount' : 'Percent'}</Text>
              </Pressable>
            ))}
          </View>
        </FormField>

        {/* Per-member shares */}
        {(() => {
          const group = id ? state.groups[String(id)] : undefined;
          if (!group || splitType === 'equal') return null;
          return (
            <View>
              {group.memberIds.map((mid) => (
                <FormField key={mid} label={state.members[mid]?.name ?? 'Member'}>
                  {splitType === 'amount' ? (
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={t.colors.secondaryLabel}
                      keyboardType="number-pad"
                      value={textFromCents(amountSharesCents[mid] || 0)}
                      onChangeText={(tx) =>
                        setAmountSharesCents((prev) => ({ ...prev, [mid]: centsFromText(tx) }))
                      }
                      style={styles.input}
                      accessibilityLabel={`Amount for ${state.members[mid]?.name ?? 'member'}`}
                      returnKeyType="done"
                      clearButtonMode="while-editing"
                    />
                  ) : (
                    <TextInput
                      placeholder="0"
                      placeholderTextColor={t.colors.secondaryLabel}
                      keyboardType="number-pad"
                      value={String(percentShares[mid] ?? '')}
                      onChangeText={(tx) =>
                        setPercentShares((prev) => ({ ...prev, [mid]: Number((tx || '0').replace(/\D/g, '')) }))
                      }
                      style={styles.input}
                      accessibilityLabel={`Percent for ${state.members[mid]?.name ?? 'member'}`}
                      returnKeyType="done"
                      clearButtonMode="while-editing"
                    />
                  )}
                </FormField>
              ))}
            </View>
          );
        })()}
        <FormField
          label="Amount"
          required
          helper={(() => {
            const v = amountCents / 100;
            if (!isNaN(v) && v > 0) return <Text style={styles.helper}>Will add {formatCurrency(v, { currency })}</Text>;
            return null;
          })()}
        >
          <TextInput
            ref={amountRef}
            placeholder="0.00"
            placeholderTextColor={t.colors.secondaryLabel}
            keyboardType="number-pad"
            value={textFromCents(amountCents)}
            onChangeText={(tx) => setAmountCents(centsFromText(tx))}
            style={styles.input}
            accessibilityLabel="Amount"
            accessibilityHint="Enter the amount in dollars and cents"
            returnKeyType="done"
            clearButtonMode="while-editing"
          />
        </FormField>

        <FormField label="Attachments" helper="Add photos or receipts">
          <View style={{ gap: 12 }}>
            {attachments.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {attachments.map((att) => (
                  <View key={att.id} style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: att.uri }}
                      style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: t.colors.fill }}
                      contentFit="cover"
                      accessible
                      accessibilityLabel="Attachment thumbnail"
                    />
                    <Pressable
                      onPress={() => removeAttachment(att.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove attachment"
                      hitSlop={8}
                      style={({ pressed }) => [
                        {
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          backgroundColor: t.colors.danger,
                          borderRadius: 12,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            <Button title="Add Photo" icon="plus" onPress={pickImages} variant="gray" />
          </View>
        </FormField>

        {(() => {
          const v = amountCents / 100;
          const valid = title.trim().length > 0 && !isNaN(v) && amountCents > 0;
          return (
            <Pressable
              style={[styles.primary, !valid && styles.primaryDisabled]}
              onPress={save}
              disabled={!valid}
              accessibilityRole="button"
              accessibilityLabel="Save expense"
              accessibilityHint="Adds this expense to the group"
              accessibilityState={{ disabled: !valid }}
              hitSlop={8}
            >
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
          );
        })()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { padding: 16, backgroundColor: t.colors.background, flexGrow: 1 },
    field: { marginBottom: 16 },
    label: { marginBottom: 8, color: t.colors.secondaryLabel },
    input: {
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: t.colors.label,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    segmentRow: {
      flexDirection: 'row',
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      padding: 4,
      marginTop: 4,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: t.radius.sm,
    },
    segmentSelected: {
      backgroundColor: t.colors.tint,
    },
    segmentText: { color: t.colors.label },
    segmentTextSelected: { color: 'white', fontWeight: '600' },
    primary: {
      marginTop: 24,
      backgroundColor: t.colors.tint,
      borderRadius: t.radius.md,
      alignItems: 'center',
      paddingVertical: 12,
    },
    primaryDisabled: {
      opacity: 0.5,
    },
    primaryText: { color: 'white', fontWeight: '600', fontSize: 16 },
    helper: { marginTop: 6, color: t.colors.secondaryLabel },
  });
}
