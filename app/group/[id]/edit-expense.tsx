import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal, Linking, Share, ActionSheetIOS } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectCurrencyForGroup, selectEffectiveLocale } from '@/store/store';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import type { Tokens } from '@/theme/tokens';
import { centsFromText, textFromCents, formatCurrency } from '@/utils/currency';
import { GroupedSection } from '@/components/ui/GroupedSection';
import { ListItem } from '@/components/ui/ListItem';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Button } from '@/components/ui/Button';
import type { Attachment } from '@/store/types';
import { saveAttachmentFile, deleteAttachmentFile } from '@/utils/attachments';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function EditExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
  const router = useRouter();
  const { state, editExpense, addComment } = useStore();
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  const expense = expenseId ? state.expenses[String(expenseId)] : undefined;
  const [title, setTitle] = React.useState(expense?.description ?? '');
  const [amountCents, setAmountCents] = React.useState(() =>
    expense ? Math.round(Number(expense.amount) * 100) : 0
  );
  const amountRef = React.useRef<TextInput>(null);
  const [attachments, setAttachments] = React.useState<Attachment[]>(expense?.attachments ?? []);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [newComment, setNewComment] = React.useState('');

  // Split state
  const [splitType, setSplitType] = React.useState<'equal' | 'amount' | 'percent'>(expense?.splitType ?? 'equal');
  const [amountSharesCents, setAmountSharesCents] = React.useState<Record<string, number>>(() =>
    expense?.splitType === 'amount' && expense.shares
      ? Object.fromEntries(Object.entries(expense.shares).map(([k, v]) => [k, Math.round(Number(v) * 100)]))
      : {}
  );
  const [percentShares, setPercentShares] = React.useState<Record<string, number>>(() =>
    expense?.splitType === 'percent' && expense.shares
      ? Object.fromEntries(Object.entries(expense.shares).map(([k, v]) => [k, Number(v)]))
      : {}
  );
  const currency = selectCurrencyForGroup(state, expense?.groupId);
  const effectiveLocale = selectEffectiveLocale(state);

  const ensureLibraryPermission = async (): Promise<boolean> => {
    try {
      const cur = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = cur.status;
      if (status !== 'granted') {
        const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        Alert.alert(
          'Photos permission needed',
          'Please allow photo library access in Settings to attach receipts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}), style: 'default' },
          ],
        );
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Permission check failed', e);
      return true;
    }
  };

  const ensureCameraPermission = async (): Promise<boolean> => {
    try {
      const cur = await ImagePicker.getCameraPermissionsAsync();
      let status = cur.status;
      if (status !== 'granted') {
        const req = await ImagePicker.requestCameraPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access in Settings to take a photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}), style: 'default' },
          ],
        );
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Permission check failed', e);
      return true;
    }
  };

  const pickImages = async () => {
    try {
      if (!(await ensureLibraryPermission())) return;
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
    Haptics.selectionAsync().catch(() => {});
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const shareAttachment = async (att: Attachment) => {
    try {
      await Share.share({ url: att.uri });
    } catch (e) {
      console.warn('Share failed', e);
    }
  };

  const openAttachmentMenu = (att: Attachment, index: number) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'View', 'Share', 'Remove'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (i) => {
          if (i === 1) setViewerIndex(index);
          if (i === 2) shareAttachment(att);
          if (i === 3) removeAttachment(att.id);
        }
      );
    } else {
      Alert.alert('Attachment', undefined, [
        { text: 'View', onPress: () => setViewerIndex(index) },
        { text: 'Share', onPress: () => shareAttachment(att) },
        { text: 'Remove', style: 'destructive', onPress: () => removeAttachment(att.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const takePhoto = async () => {
    try {
      if (!(await ensureCameraPermission())) return;
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (!res.canceled) {
        const a = res.assets[0] as ImagePicker.ImagePickerAsset;
        const att: Attachment = {
          id: `att_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
          uri: a.uri,
          type: a.mimeType,
          width: a.width,
          height: a.height,
          createdAt: Date.now(),
        };
        setAttachments((prev) => [...prev, att]);
      }
    } catch (e) {
      console.warn('Camera failed', e);
    }
  };

  const save = async () => {
    if (!expense || !id) return;
    const value = amountCents / 100;
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
    // Persist any new attachments and cleanup removed ones
    let persisted = attachments;
    try {
      persisted = await Promise.all(attachments.map((a) => saveAttachmentFile(a)));
      const old = expense.attachments ?? [];
      const removed = old.filter((o) => !persisted.find((p) => p.id === o.id));
      await Promise.all(removed.map((r) => deleteAttachmentFile(r.uri)));
    } catch (e) {
      console.warn('Persist/cleanup attachments failed', e);
    }
    editExpense({ id: expense.id, description: title.trim(), amount: value, splitType, shares, attachments: persisted });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text style={{ color: t.colors.secondaryLabel }}>Expense not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        <GroupedSection>
          <ListItem
            variant="row"
            title="Title"
            right={
              <TextInput
                placeholder="Dinner"
                placeholderTextColor={t.colors.secondaryLabel}
                value={title}
                onChangeText={setTitle}
                style={styles.inputRow}
                accessibilityLabel="Title"
                accessibilityHint="Edit the description for this expense"
                autoFocus
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => amountRef.current?.focus()}
                clearButtonMode="while-editing"
                autoCapitalize="words"
              />
            }
          />
        </GroupedSection>

        <GroupedSection>
          <ListItem variant="row" title={`Attachments${attachments.length ? ` (${attachments.length})` : ''}`} />
          {attachments.length > 0 ? (
            <View style={styles.attachmentsPad}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {attachments.map((att, idx) => (
                  <View key={att.id} style={{ position: 'relative' }}>
                    <Pressable onPress={() => setViewerIndex(idx)} onLongPress={() => openAttachmentMenu(att, idx)} accessibilityRole="imagebutton" accessibilityLabel="View attachment">
                      <Image
                        source={{ uri: att.uri }}
                        style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: t.colors.fill }}
                        contentFit="cover"
                        accessible
                        accessibilityLabel="Attachment thumbnail"
                      />
                    </Pressable>
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
                          borderRadius: 14,
                          padding: 2,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <IconSymbol name="xmark" color="#fff" size={16} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
          <View style={[styles.attachmentsPad, { paddingTop: 0 }]}> 
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Add Photo" icon="plus" onPress={pickImages} variant="gray" size="small" shape="pill" />
              <Button title="Take Photo" icon="camera" onPress={takePhoto} variant="gray" size="small" shape="pill" />
            </View>
          </View>
        </GroupedSection>

        <Modal visible={viewerIndex !== null} transparent animationType="fade" onRequestClose={() => setViewerIndex(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' }} onPress={() => setViewerIndex(null)}>
            {viewerIndex !== null && attachments[viewerIndex] ? (
              <Image
                source={{ uri: attachments[viewerIndex].uri }}
                style={{ width: '90%', height: '80%' }}
                contentFit="contain"
                accessible
                accessibilityLabel="Full-size attachment"
              />
            ) : null}
          </Pressable>
        </Modal>
        <GroupedSection>
          <ListItem
            variant="row"
            title="Split"
            subtitle={splitType === 'equal' ? 'Split equally among members' : splitType === 'amount' ? 'Enter amounts per person (we will normalize to total)' : 'Enter percentage per person (we will normalize to 100%)'}
            right={
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
                    <Text style={[styles.segmentText, splitType === opt && styles.segmentTextSelected]}>
                      {opt === 'equal' ? 'Equal' : opt === 'amount' ? 'Amount' : 'Percent'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
        </GroupedSection>

        {(() => {
          const group = expense ? state.groups[expense.groupId] : undefined;
          if (!group || splitType === 'equal') return null;
          return (
            <GroupedSection>
              {group.memberIds.map((mid) => (
                <ListItem
                  key={mid}
                  variant="row"
                  title={state.members[mid]?.name ?? 'Member'}
                  right={
                    splitType === 'amount' ? (
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor={t.colors.secondaryLabel}
                        keyboardType="number-pad"
                        value={textFromCents(amountSharesCents[mid] || 0)}
                        onChangeText={(tx) => setAmountSharesCents((prev) => ({ ...prev, [mid]: centsFromText(tx) }))}
                        style={[styles.inputRow, { textAlign: 'right' }]}
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
                        style={[styles.inputRow, { textAlign: 'right' }]}
                        accessibilityLabel={`Percent for ${state.members[mid]?.name ?? 'member'}`}
                        returnKeyType="done"
                        clearButtonMode="while-editing"
                      />
                    )
                  }
                />
              ))}
            </GroupedSection>
          );
        })()}

        <GroupedSection>
          <ListItem
            variant="row"
            title="Amount"
            subtitle={(() => {
              const v = amountCents / 100;
              if (!isNaN(v) && v > 0) return <Text style={styles.helper}>Will update to {formatCurrency(v, { currency, locale: effectiveLocale })}</Text>;
              return undefined;
            })()}
            right={
              <TextInput
                ref={amountRef}
                placeholder={formatCurrency(0, { currency, locale: effectiveLocale })}
                placeholderTextColor={t.colors.secondaryLabel}
                keyboardType="number-pad"
                value={textFromCents(amountCents)}
                onChangeText={(tx) => setAmountCents(centsFromText(tx))}
                style={[styles.inputRow, { textAlign: 'right' }]}
                accessibilityLabel="Amount"
                accessibilityHint="Edit the amount in dollars and cents"
                returnKeyType="done"
                clearButtonMode="while-editing"
              />
            }
          />
        </GroupedSection>

        <GroupedSection>
          <ListItem variant="row" title={`Comments${expense?.comments?.length ? ` (${expense.comments.length})` : ''}`} />
          <View style={styles.attachmentsPad}>
            {expense?.comments && expense.comments.length > 0 ? (
              <View style={{ gap: 8 }}>
                {expense.comments.map((c) => (
                  <View
                    key={c.id}
                    style={{
                      backgroundColor: t.colors.card,
                      borderRadius: t.radius.md,
                      padding: 10,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: t.colors.separator,
                    }}
                    accessible
                    accessibilityLabel={`Comment by ${state.members[c.memberId]?.name ?? 'member'}`}
                  >
                    <Text style={{ color: t.colors.label, fontWeight: '600' }}>
                      {state.members[c.memberId]?.name ?? 'Member'}
                    </Text>
                    <Text style={{ color: t.colors.label, marginTop: 4 }}>{c.text}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: t.colors.secondaryLabel }}>No comments yet.</Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <TextInput
                placeholder="Add a comment"
                placeholderTextColor={t.colors.secondaryLabel}
                value={newComment}
                onChangeText={setNewComment}
                style={[styles.input, { flex: 1 }]}
                accessibilityLabel="New comment"
                returnKeyType="send"
                onSubmitEditing={() => {
                  const text = newComment.trim();
                  if (!text || !expense) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  addComment({ expenseId: expense.id, text });
                  setNewComment('');
                }}
                clearButtonMode="while-editing"
              />
              <Pressable
                onPress={() => {
                  const text = newComment.trim();
                  if (!text || !expense) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  addComment({ expenseId: expense.id, text });
                  setNewComment('');
                }}
                accessibilityRole="button"
                accessibilityLabel="Send comment"
                hitSlop={8}
                style={({ pressed }) => [
                  {
                    backgroundColor: t.colors.tint,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: t.radius.md,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <IconSymbol name="paperplane.fill" color="#fff" size={18} />
              </Pressable>
            </View>
          </View>
        </GroupedSection>

        {(() => {
          const v = amountCents / 100;
          const valid = title.trim().length > 0 && !isNaN(v) && amountCents > 0;
          return (
            <Button
              title="Save"
              onPress={save}
              disabled={!valid}
              accessibilityLabel="Save changes"
              size="large"
              shape="pill"
              block
              style={{ marginHorizontal: t.spacing.l, marginTop: t.spacing.l, marginBottom: t.spacing.xl }}
            />
          );
        })()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(t: Tokens) {
  return StyleSheet.create({
    container: { backgroundColor: t.colors.background, flexGrow: 1, paddingBottom: t.spacing.xl },
    input: {
      backgroundColor: t.colors.fill,
      borderRadius: t.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: t.colors.label,
      // Removed outline for Apple-like field appearance
    },
    inputRow: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 17,
      color: t.colors.label,
      minWidth: 120,
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
    attachmentsPad: {
      paddingHorizontal: t.spacing.l,
      paddingVertical: t.spacing.m,
    },
    helper: { marginTop: 6, color: t.colors.secondaryLabel },
  });
}
