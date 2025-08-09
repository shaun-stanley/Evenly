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
};

export type SplitType = 'equal'; // future: 'exact' | 'percentage'

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

export type ActivityItem = {
  id: ID;
  type: 'expense_added' | 'expense_edited' | 'expense_deleted' | 'group_created' | 'group_renamed';
  message: string;
  createdAt: number;
};

export type State = {
  currentMemberId: ID;
  members: Record<ID, Member>;
  groups: Record<ID, Group>;
  groupOrder: ID[]; // ordering for list
  expenses: Record<ID, Expense>;
  activity: ActivityItem[]; // newest first
};

export type AddExpensePayload = {
  groupId: ID;
  description: string;
  amount: number;
  paidBy?: ID; // default current user
  splitType?: SplitType; // default equal
};

export type EditExpensePayload = {
  id: ID;
  description?: string;
  amount?: number;
  paidBy?: ID;
  splitType?: SplitType;
  shares?: Record<ID, number>;
};

export type Action =
  | { type: 'ADD_EXPENSE'; payload: AddExpensePayload }
  | { type: 'EDIT_EXPENSE'; payload: EditExpensePayload }
  | { type: 'DELETE_EXPENSE'; payload: { id: ID } }
  | { type: 'ADD_GROUP'; payload: { name: string; memberIds?: ID[] } }
  | { type: 'RENAME_GROUP'; payload: { id: ID; name: string } }
  | { type: 'HYDRATE'; payload: State };
