import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { State } from '@/store/types';

export async function exportStateToFile(state: State): Promise<{ uri: string }> {
  const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uri = `${dir}evenly-export-${stamp}.json`;
  const data = JSON.stringify(state, null, 2);
  await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
  return { uri };
}

export async function shareFile(uri: string): Promise<boolean> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;
    await Sharing.shareAsync(uri, { dialogTitle: 'Export Evenly Data' });
    return true;
  } catch (e) {
    console.warn('Share failed', e);
    return false;
  }
}

export async function exportAndShare(state: State): Promise<{ uri: string; shared: boolean }>{
  const { uri } = await exportStateToFile(state);
  const shared = await shareFile(uri);
  return { uri, shared };
}
