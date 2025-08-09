export type ID = string;

export type Member = {
  id: ID;
  name: string;
};

export type Group = {
  id: ID;
  name: string;
  memberIds: ID[];
  createdAt: number;
  currency?: string; // optional ISO 4217 code to override app default for this group
};

export type SplitType = 'equal' | 'amount' | 'percent';

export type Expense = {
  id: ID;
  groupId: ID;
  description: string;
  amount: number; // in currency units for now
  paidBy: ID; // memberId
  splitType: SplitType;
  shares?: Record<ID, number>; // used for non-equal splits
  createdAt: number;
};

// Recurring expenses (Phase 3)
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval?: number; // every N units, default 1
  // For monthly/yearly you might specify day of month or weekday in future
  startDate: number; // timestamp ms
  endDate?: number; // optional
  count?: number; // number of occurrences
};

export type RecurringExpense = {
  id: ID;
  groupId: ID;
  description: string;
  amount: number;
  paidBy: ID;
  splitType: SplitType;
  shares?: Record<ID, number>;
  rule: RecurrenceRule;
  nextOccurrenceAt: number; // computed next fire time
  active: boolean;
  createdAt: number;
};

export type ActivityItem = {
  id: ID;
  type:
    | 'expense_added'
    | 'expense_edited'
    | 'expense_deleted'
    | 'group_created'
    | 'group_renamed'
    | 'recurring_added'
    | 'recurring_edited'
    | 'recurring_deleted';
  message: string;
  createdAt: number;
};

export type Settings = {
  currency: string; // ISO 4217 code e.g. 'USD'
};

export type State = {
  currentMemberId: ID;
  members: Record<ID, Member>;
  groups: Record<ID, Group>;
  groupOrder: ID[]; // ordering for list
  expenses: Record<ID, Expense>;
  activity: ActivityItem[]; // newest first
  recurring: Record<ID, RecurringExpense>;
  settings: Settings;
};

export type AddExpensePayload = {
  groupId: ID;
  description: string;
  amount: number;
  paidBy?: ID; // default current user
  splitType?: SplitType; // default equal
  shares?: Record<ID, number>; // for 'amount' or 'percent' splits
};

export type EditExpensePayload = {
  id: ID;
  description?: string;
  amount?: number;
  paidBy?: ID;
  splitType?: SplitType;
  shares?: Record<ID, number>;
};

export type AddRecurringPayload = {
  groupId: ID;
  description: string;
  amount: number;
  paidBy?: ID;
  splitType?: SplitType;
  shares?: Record<ID, number>;
  rule: RecurrenceRule;
};

export type EditRecurringPayload = {
  id: ID;
  description?: string;
  amount?: number;
  paidBy?: ID;
  splitType?: SplitType;
  shares?: Record<ID, number>;
  rule?: RecurrenceRule;
  active?: boolean;
};

export type Action =
  | { type: 'ADD_EXPENSE'; payload: AddExpensePayload }
  | { type: 'EDIT_EXPENSE'; payload: EditExpensePayload }
  | { type: 'DELETE_EXPENSE'; payload: { id: ID } }
  | { type: 'ADD_GROUP'; payload: { name: string; memberIds?: ID[] } }
  | { type: 'RENAME_GROUP'; payload: { id: ID; name: string } }
  | { type: 'ADD_RECURRING'; payload: AddRecurringPayload }
  | { type: 'EDIT_RECURRING'; payload: EditRecurringPayload }
  | { type: 'DELETE_RECURRING'; payload: { id: ID } }
  | { type: 'TOGGLE_RECURRING_ACTIVE'; payload: { id: ID; active: boolean } }
  | { type: 'SET_GROUP_CURRENCY'; payload: { id: ID; currency?: string } }
  | { type: 'SET_CURRENCY'; payload: { currency: string } }
  | { type: 'HYDRATE'; payload: State };
