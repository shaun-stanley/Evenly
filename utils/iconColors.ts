// Colorful icon palette and helpers for Apple-like fun icons

const palette = [
  '#FF3B30', // red
  '#FF9500', // orange
  '#FFCC00', // yellow
  '#34C759', // green
  '#00C7BE', // mint
  '#32ADE6', // cyan
  '#007AFF', // blue
  '#5856D6', // indigo
  '#AF52DE', // purple
  '#FF2D55', // pink
];

export type ActivityType =
  | 'expense_added'
  | 'expense_edited'
  | 'expense_deleted'
  | 'group_created'
  | 'group_renamed'
  | 'recurring_added'
  | 'recurring_edited'
  | 'recurring_deleted'
  | string;

export function colorForActivity(type: ActivityType): string {
  switch (type) {
    case 'expense_added':
      return '#34C759'; // green
    case 'expense_edited':
      return '#FF9500'; // orange
    case 'expense_deleted':
      return '#FF3B30'; // red
    case 'group_created':
      return '#AF52DE'; // purple
    case 'group_renamed':
      return '#5856D6'; // indigo
    case 'recurring_added':
    case 'recurring_edited':
    case 'recurring_deleted':
      return '#32ADE6'; // cyan
    default:
      return '#007AFF'; // blue
  }
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function colorForGroup(id: string): string {
  const idx = hashString(id) % palette.length;
  return palette[idx];
}
