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

export type Attachment = {
  id: ID;
  uri: string;
  type?: string; // mime type
  width?: number;
  height?: number;
  createdAt: number;
};

export type Comment = {
  id: ID;
  memberId: ID;
  text: string;
  createdAt: number;
};

export type Expense = {
  id: ID;
  groupId: ID;
  description: string;
  amount: number; // in currency units for now
  paidBy: ID; // memberId
  splitType: SplitType;
  shares?: Record<ID, number>; // used for non-equal splits
  attachments?: Attachment[]; // optional photos/receipts
  comments?: Comment[]; // optional discussion
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
    | 'recurring_deleted'
    | 'settlement_recorded'
    | 'comment_added';
  message: string;
  attachmentsCount?: number;
  createdAt: number;
};

export type Settings = {
  currency: string; // ISO 4217 code e.g. 'USD'
  locale?: string | 'system'; // BCP 47 or 'system' to follow device
};

export type State = {
  currentMemberId: ID;
  members: Record<ID, Member>;
  groups: Record<ID, Group>;
  groupOrder: ID[]; // ordering for list
  expenses: Record<ID, Expense>;
  activity: ActivityItem[]; // newest first
  recurring: Record<ID, RecurringExpense>;
  settlements: Record<ID, Settlement>;
  settings: Settings;
};

export type Settlement = {
  id: ID;
  groupId: ID;
  fromMemberId: ID; // payer
  toMemberId: ID;   // receiver
  amount: number;   // currency units, positive
  note?: string;
  createdAt: number;
};

export type AddExpensePayload = {
  groupId: ID;
  description: string;
  amount: number;
  paidBy?: ID; // default current user
  splitType?: SplitType; // default equal
  shares?: Record<ID, number>; // for 'amount' or 'percent' splits
  attachments?: Attachment[];
};

export type EditExpensePayload = {
  id: ID;
  description?: string;
  amount?: number;
  paidBy?: ID;
  splitType?: SplitType;
  shares?: Record<ID, number>;
  attachments?: Attachment[];
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

export type AddSettlementPayload = {
  groupId: ID;
  fromMemberId: ID;
  toMemberId: ID;
  amount: number;
  note?: string;
};

export type AddCommentPayload = {
  expenseId: ID;
  text: string;
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
  | { type: 'SET_LOCALE'; payload: { locale?: string | 'system' } }
  | { type: 'ADD_SETTLEMENT'; payload: AddSettlementPayload }
  | { type: 'DELETE_SETTLEMENT'; payload: { id: ID } }
  | { type: 'ADD_COMMENT'; payload: AddCommentPayload }
  | { type: 'HYDRATE'; payload: State };
