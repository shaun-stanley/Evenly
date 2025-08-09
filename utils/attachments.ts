import * as FileSystem from 'expo-file-system';
import type { Attachment, Expense } from '@/store/types';

const ATTACH_DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'attachments' : undefined;

async function ensureDir() {
  if (!ATTACH_DIR) return;
  try {
    const info = await FileSystem.getInfoAsync(ATTACH_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(ATTACH_DIR, { intermediates: true });
    }
  } catch (e) {
    console.warn('ensureDir failed', e);
  }
}

function extFromTypeOrUri(type?: string, uri?: string): string {
  if (type) {
    if (type === 'image/jpeg') return '.jpg';
    if (type === 'image/png') return '.png';
    if (type === 'image/heic' || type === 'image/heif') return '.heic';
    if (type === 'image/webp') return '.webp';
    const guess = type.split('/')[1];
    if (guess) return `.${guess}`;
  }
  if (uri) {
    const m = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    if (m) return `.${m[1].toLowerCase()}`;
  }
  return '.jpg';
}

function isInAppDir(uri?: string) {
  if (!uri || !ATTACH_DIR) return false;
  return uri.startsWith(ATTACH_DIR);
}

export async function saveAttachmentFile(att: Attachment): Promise<Attachment> {
  if (!ATTACH_DIR || !att.uri) return att;
  if (isInAppDir(att.uri)) return att; // already persisted
  await ensureDir();
  const ext = extFromTypeOrUri(att.type, att.uri);
  const dest = `${ATTACH_DIR}/${att.id}${ext}`;
  try {
    await FileSystem.copyAsync({ from: att.uri, to: dest });
    return { ...att, uri: dest };
  } catch (e) {
    console.warn('Failed to copy attachment', e);
    return att; // fallback
  }
}

export async function deleteAttachmentFile(uri?: string) {
  if (!uri) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.warn('Failed to delete attachment', e);
  }
}

export async function deleteAttachmentsForExpense(expense?: Expense) {
  if (!expense?.attachments?.length) return;
  await Promise.all(expense.attachments.map((a) => deleteAttachmentFile(a.uri)));
}
