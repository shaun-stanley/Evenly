import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Action, ActivityItem, AddExpensePayload, Expense, Group, ID, State, EditExpensePayload, AddRecurringPayload, EditRecurringPayload, RecurringExpense, RecurrenceRule, AddSettlementPayload, Settlement, AddCommentPayload } from './types';
import { formatCurrency } from '@/utils/currency';
import { deleteAttachmentsForExpense } from '@/utils/attachments';

const STORAGE_KEY = '@evenly_state_v1';
const OLD_STORAGE_KEY = '@splitwise_ios_state_v1';

function genId(prefix: string = 'id'): ID {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

// Suggest settlement payments to minimize transactions given current balances.
export function computeSettlementSuggestions(state: State, groupId: ID): { fromMemberId: ID; toMemberId: ID; amount: number }[] {
  const balances = selectGroupMemberBalances(state, groupId);
  const debtors: { id: ID; amt: number }[] = [];
  const creditors: { id: ID; amt: number }[] = [];
  for (const [id, bal] of Object.entries(balances)) {
    if (bal < -0.005) debtors.push({ id, amt: -bal }); // owes amt
    else if (bal > 0.005) creditors.push({ id, amt: bal }); // is owed amt
  }
  debtors.sort((a, b) => b.amt - a.amt); // largest debtor first
  creditors.sort((a, b) => b.amt - a.amt); // largest creditor first
  const suggestions: { fromMemberId: ID; toMemberId: ID; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0.005) suggestions.push({ fromMemberId: debtors[i].id, toMemberId: creditors[j].id, amount: pay });
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt <= 0.005) i++;
    if (creditors[j].amt <= 0.005) j++;
  }
  return suggestions;
}

export function selectCurrencyForGroup(state: State, groupId: ID | undefined): string {
  if (!groupId) return state.settings.currency;
  const g = state.groups[groupId];
  return g?.currency || state.settings.currency;
}

// Compute the next occurrence timestamp for a given rule starting from a base date.
function computeNextOccurrence(rule: RecurrenceRule, from: number): number {
  const interval = Math.max(1, rule.interval ?? 1);
  let next = rule.startDate;
  if (next <= from) {
    const base = new Date(rule.startDate);
    const cur = new Date(from);
    const n = new Date(base);
    while (n.getTime() <= cur.getTime()) {
      if (rule.frequency === 'daily') n.setDate(n.getDate() + interval);
      else if (rule.frequency === 'weekly') n.setDate(n.getDate() + 7 * interval);
      else if (rule.frequency === 'monthly') n.setMonth(n.getMonth() + interval);
      else if (rule.frequency === 'yearly') n.setFullYear(n.getFullYear() + interval);
    }
    next = n.getTime();
  }
  if (rule.endDate && next > rule.endDate) return next; // may be ignored later
  return next;
}

const initialState: State = {
  currentMemberId: 'me',
  members: {
    me: { id: 'me', name: 'You' },
    alex: { id: 'alex', name: 'Alex' },
    sam: { id: 'sam', name: 'Sam' },
  },
  groups: {},
  groupOrder: [],
  expenses: {},
  activity: [],
  recurring: {},
  settlements: {},
  settings: { currency: 'USD', locale: 'system', hasOnboarded: false },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE': {
      // Ensure new keys exist when loading older persisted states
      const incoming = action.payload as State;
      const incomingSettings = (incoming as any).settings ?? {};
      const mergedSettings = { ...initialState.settings, ...incomingSettings } as State['settings'];
      // If an older state doesn't have hasOnboarded, treat as already onboarded to avoid re-showing onboarding on upgrade
      if (typeof (incomingSettings as any).hasOnboarded === 'undefined') {
        (mergedSettings as any).hasOnboarded = true;
      }
      return {
        ...initialState,
        ...incoming,
        recurring: incoming.recurring ?? {},
        settlements: incoming.settlements ?? {},
        settings: mergedSettings,
      };
    }
    case 'ADD_GROUP': {
      const id = genId('grp');
      const memberIds = action.payload.memberIds && action.payload.memberIds.length > 0
        ? action.payload.memberIds
        : Object.keys(state.members);
      const group: Group = {
        id,
        name: action.payload.name,
        memberIds,
        createdAt: Date.now(),
      };
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'group_created',
        message: `Created group “${group.name}”`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        groups: { ...state.groups, [id]: group },
        groupOrder: [id, ...state.groupOrder],
        activity: [activity, ...state.activity],
      };
    }
    case 'RENAME_GROUP': {
      const { id, name } = action.payload;
      const prev = state.groups[id];
      if (!prev) return state;
      const next: Group = { ...prev, name };
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'group_renamed',
        message: `Renamed group to “${name}”`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        groups: { ...state.groups, [id]: next },
        activity: [activity, ...state.activity],
      };
    }
    case 'ADD_EXPENSE': {
      const { groupId, description, amount, paidBy, splitType = 'equal' } = action.payload;
      if (!state.groups[groupId]) return state;
      const id = genId('exp');
      const expense: Expense = {
        id,
        groupId,
        description,
        amount,
        paidBy: paidBy ?? state.currentMemberId,
        splitType,
        shares: action.payload.shares,
        attachments: (action.payload as any).attachments,
        createdAt: Date.now(),
      };
      const currency = state.groups[groupId]?.currency || state.settings.currency;
      const locale = state.settings.locale && state.settings.locale !== 'system' ? state.settings.locale : undefined;
      const attachmentsCount = (action.payload as any).attachments?.length || undefined;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'expense_added',
        message: `Added “${description}” ${formatCurrency(amount, { currency, locale })} in ${state.groups[groupId].name}${(action.payload as any).attachments?.length ? ` · ${(action.payload as any).attachments.length} attachment${(action.payload as any).attachments.length === 1 ? '' : 's'}` : ''}`,
        attachmentsCount,
        createdAt: Date.now(),
      };
      return {
        ...state,
        expenses: { ...state.expenses, [id]: expense },
        activity: [activity, ...state.activity],
      };
    }
    case 'EDIT_EXPENSE': {
      const { id, ...updates } = action.payload as EditExpensePayload;
      const prev = state.expenses[id];
      if (!prev) return state;
      const next: Expense = { ...prev, ...updates };
      const currency = state.groups[next.groupId]?.currency || state.settings.currency;
      const locale = state.settings.locale && state.settings.locale !== 'system' ? state.settings.locale : undefined;
      const attachmentsCount = next.attachments?.length || undefined;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'expense_edited',
        message: `Edited “${next.description}” ${formatCurrency(next.amount, { currency, locale })} in ${state.groups[next.groupId]?.name ?? 'group'}${next.attachments?.length ? ` · ${next.attachments.length} attachment${next.attachments.length === 1 ? '' : 's'}` : ''}`,
        attachmentsCount,
        createdAt: Date.now(),
      };
      return {
        ...state,
        expenses: { ...state.expenses, [id]: next },
        activity: [activity, ...state.activity],
      };
    }
    case 'DELETE_EXPENSE': {
      const { id } = action.payload as { id: ID };
      const prev = state.expenses[id];
      if (!prev) return state;
      const { [id]: _omit, ...rest } = state.expenses;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'expense_deleted',
        message: `Deleted “${prev.description}” from ${state.groups[prev.groupId]?.name ?? 'group'}`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        expenses: rest,
        activity: [activity, ...state.activity],
      };
    }
    case 'ADD_RECURRING': {
      const p = action.payload as AddRecurringPayload;
      if (!state.groups[p.groupId]) return state;
      const id = genId('rec');
      const rec: RecurringExpense = {
        id,
        groupId: p.groupId,
        description: p.description,
        amount: p.amount,
        paidBy: p.paidBy ?? state.currentMemberId,
        splitType: p.splitType ?? 'equal',
        shares: p.shares,
        rule: p.rule,
        nextOccurrenceAt: computeNextOccurrence(p.rule, Date.now()),
        active: true,
        createdAt: Date.now(),
      };
      const currency = state.groups[p.groupId]?.currency || state.settings.currency;
      const locale = state.settings.locale && state.settings.locale !== 'system' ? state.settings.locale : undefined;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'recurring_added',
        message: `Added recurring “${rec.description}” ${formatCurrency(rec.amount, { currency, locale })} in ${state.groups[p.groupId].name}`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        recurring: { ...state.recurring, [id]: rec },
        activity: [activity, ...state.activity],
      };
    }
    case 'EDIT_RECURRING': {
      const { id, ...updates } = action.payload as EditRecurringPayload;
      const prev = state.recurring[id];
      if (!prev) return state;
      const next: RecurringExpense = {
        ...prev,
        ...updates,
        nextOccurrenceAt: updates.rule ? computeNextOccurrence(updates.rule, Date.now()) : prev.nextOccurrenceAt,
      };
      const currency = state.groups[next.groupId]?.currency || state.settings.currency;
      const locale = state.settings.locale && state.settings.locale !== 'system' ? state.settings.locale : undefined;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'recurring_edited',
        message: `Edited recurring “${next.description}” ${formatCurrency(next.amount, { currency, locale })} in ${state.groups[next.groupId]?.name ?? 'group'}`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        recurring: { ...state.recurring, [id]: next },
        activity: [activity, ...state.activity],
      };
    }
    case 'DELETE_RECURRING': {
      const { id } = action.payload as { id: ID };
      const prev = state.recurring[id];
      if (!prev) return state;
      const { [id]: _omit, ...rest } = state.recurring;
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'recurring_deleted',
        message: `Deleted recurring “${prev.description}” from ${state.groups[prev.groupId]?.name ?? 'group'}`,
        createdAt: Date.now(),
      };
      return { ...state, recurring: rest, activity: [activity, ...state.activity] };
    }
    case 'ADD_SETTLEMENT': {
      const p = action.payload as AddSettlementPayload;
      if (!state.groups[p.groupId]) return state;
      const id = genId('set');
      const s: Settlement = {
        id,
        groupId: p.groupId,
        fromMemberId: p.fromMemberId,
        toMemberId: p.toMemberId,
        amount: p.amount,
        note: p.note,
        createdAt: Date.now(),
      };
      const g = state.groups[p.groupId];
      const currency = g?.currency || state.settings.currency;
      const locale = state.settings.locale && state.settings.locale !== 'system' ? state.settings.locale : undefined;
      const fromName = state.members[p.fromMemberId]?.name ?? 'Someone';
      const toName = state.members[p.toMemberId]?.name ?? 'Someone';
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'settlement_recorded',
        message: `${fromName} paid ${toName} ${formatCurrency(p.amount, { currency, locale })} in ${g?.name ?? 'group'}`,
        createdAt: Date.now(),
      };
      return { ...state, settlements: { ...state.settlements, [id]: s }, activity: [activity, ...state.activity] };
    }
    case 'DELETE_SETTLEMENT': {
      const { id } = action.payload as { id: ID };
      const prev = state.settlements[id];
      if (!prev) return state;
      const { [id]: _omit, ...rest } = state.settlements;
      return { ...state, settlements: rest };
    }
    case 'ADD_COMMENT': {
      const p = action.payload as AddCommentPayload;
      const exp = state.expenses[p.expenseId];
      if (!exp) return state;
      const comment = {
        id: genId('cmt'),
        memberId: state.currentMemberId,
        text: (p.text || '').trim(),
        createdAt: Date.now(),
      };
      if (!comment.text) return state;
      const nextExp: Expense = { ...exp, comments: [...(exp.comments ?? []), comment] };
      const g = state.groups[exp.groupId];
      const who = state.members[state.currentMemberId]?.name ?? 'Someone';
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'comment_added',
        message: `${who} commented on “${exp.description}” in ${g?.name ?? 'group'}`,
        createdAt: Date.now(),
      };
      return {
        ...state,
        expenses: { ...state.expenses, [exp.id]: nextExp },
        activity: [activity, ...state.activity],
      };
    }
    case 'TOGGLE_RECURRING_ACTIVE': {
      const { id, active } = action.payload as { id: ID; active: boolean };
      const prev = state.recurring[id];
      if (!prev) return state;
      const next: RecurringExpense = { ...prev, active };
      return { ...state, recurring: { ...state.recurring, [id]: next } };
    }
    case 'SET_GROUP_CURRENCY': {
      const { id, currency } = action.payload as { id: ID; currency?: string };
      const prev = state.groups[id];
      if (!prev) return state;
      const next: Group = { ...prev };
      if (currency) next.currency = currency; else delete (next as any).currency;
      return { ...state, groups: { ...state.groups, [id]: next } };
    }
    case 'SET_CURRENCY': {
      const { currency } = action.payload as { currency: string };
      return { ...state, settings: { ...state.settings, currency } };
    }
    case 'SET_LOCALE': {
      const { locale } = action.payload as { locale?: string | 'system' };
      return { ...state, settings: { ...state.settings, locale: locale ?? 'system' } };
    }
    case 'SET_ONBOARDED': {
      const { hasOnboarded } = action.payload as { hasOnboarded: boolean };
      return { ...state, settings: { ...state.settings, hasOnboarded } };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  addGroup: (name: string, memberIds?: ID[]) => void;
  addExpense: (payload: AddExpensePayload) => void;
  editExpense: (payload: EditExpensePayload) => void;
  deleteExpense: (id: ID) => void;
  renameGroup: (id: ID, name: string) => void;
  addRecurring: (payload: AddRecurringPayload) => void;
  editRecurring: (payload: EditRecurringPayload) => void;
  deleteRecurring: (id: ID) => void;
  toggleRecurringActive: (id: ID, active: boolean) => void;
  setGroupCurrency: (id: ID, currency?: string) => void;
  setCurrency: (currency: string) => void;
  setLocale: (locale?: string | 'system') => void;
  setOnboarded: (hasOnboarded: boolean) => void;
  addSettlement: (payload: AddSettlementPayload) => void;
  deleteSettlement: (id: ID) => void;
  addComment: (payload: AddCommentPayload) => void;
  hydrated: boolean;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = React.useState(false);

  // hydrate (with fallback from old key)
  useEffect(() => {
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const legacy = await AsyncStorage.getItem(OLD_STORAGE_KEY);
          if (legacy) {
            raw = legacy;
            // write forward to new key
            await AsyncStorage.setItem(STORAGE_KEY, legacy);
            // optional: remove old key
            await AsyncStorage.removeItem(OLD_STORAGE_KEY).catch(() => {});
          }
        }
        if (raw) {
          const parsed: State = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      } finally {
        hydratedRef.current = true;
        setHydrated(true);
      }
    })();
  }, []);

  // persist
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Failed to save state', e)
    );
  }, [state]);

  const addGroup = (name: string, memberIds?: ID[]) =>
    dispatch({ type: 'ADD_GROUP', payload: { name, memberIds } });

  const addExpense = (payload: AddExpensePayload) =>
    dispatch({ type: 'ADD_EXPENSE', payload });

  const editExpense = (payload: EditExpensePayload) =>
    dispatch({ type: 'EDIT_EXPENSE', payload });

  const deleteExpense = (id: ID) => {
    const exp = state.expenses[id];
    dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
    // Fire-and-forget cleanup of persisted files
    if (exp) deleteAttachmentsForExpense(exp).catch((e) => console.warn('Failed to cleanup attachments', e));
  };

  const renameGroup = (id: ID, name: string) =>
    dispatch({ type: 'RENAME_GROUP', payload: { id, name } });

  const addRecurring = (payload: AddRecurringPayload) =>
    dispatch({ type: 'ADD_RECURRING', payload });

  const editRecurring = (payload: EditRecurringPayload) =>
    dispatch({ type: 'EDIT_RECURRING', payload });

  const deleteRecurring = (id: ID) =>
    dispatch({ type: 'DELETE_RECURRING', payload: { id } });

  const toggleRecurringActive = (id: ID, active: boolean) =>
    dispatch({ type: 'TOGGLE_RECURRING_ACTIVE', payload: { id, active } });

  const setGroupCurrency = (id: ID, currency?: string) =>
    dispatch({ type: 'SET_GROUP_CURRENCY', payload: { id, currency } });

  const setCurrency = (currency: string) =>
    dispatch({ type: 'SET_CURRENCY', payload: { currency } });

  const setLocale = (locale?: string | 'system') =>
    dispatch({ type: 'SET_LOCALE', payload: { locale } });

  const setOnboarded = (hasOnboarded: boolean) =>
    dispatch({ type: 'SET_ONBOARDED', payload: { hasOnboarded } });

  const addSettlement = (payload: AddSettlementPayload) =>
    dispatch({ type: 'ADD_SETTLEMENT', payload });

  const deleteSettlement = (id: ID) =>
    dispatch({ type: 'DELETE_SETTLEMENT', payload: { id } });

  const addComment = (payload: AddCommentPayload) =>
    dispatch({ type: 'ADD_COMMENT', payload });

  const value = useMemo(() => ({ state, dispatch, addGroup, addExpense, editExpense, deleteExpense, renameGroup, addRecurring, editRecurring, deleteRecurring, toggleRecurringActive, setGroupCurrency, setCurrency, setLocale, setOnboarded, addSettlement, deleteSettlement, addComment, hydrated }), [state, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Selectors and helpers
export function selectGroupsArray(state: State): Group[] {
  return state.groupOrder.map((id) => state.groups[id]).filter(Boolean);
}

export function selectGroup(state: State, id: ID): Group | undefined {
  return state.groups[id];
}

export function selectExpensesForGroup(state: State, groupId: ID): Expense[] {
  return Object.values(state.expenses)
    .filter((e) => e.groupId === groupId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function computeUserTotals(state: State): { owes: number; owed: number } {
  const me = state.currentMemberId;
  let owes = 0;
  let owed = 0;

  for (const exp of Object.values(state.expenses)) {
    const group = state.groups[exp.groupId];
    if (!group) continue;
    const shares = computeSharesForExpense(exp, group);
    if (exp.paidBy === me) {
      // others owe me their shares
      for (const m of group.memberIds) {
        if (m === me) continue;
        owed += shares[m] ?? 0;
      }
    }
    if (group.memberIds.includes(me) && exp.paidBy !== me) {
      owes += shares[me] ?? 0;
    }
  }
  // apply settlements across all groups
  for (const s of Object.values((state as any).settlements || {}) as Settlement[]) {
    if (s.fromMemberId === me) owes = Math.max(0, owes - s.amount);
    if (s.toMemberId === me) owed = Math.max(0, owed - s.amount);
  }
  return { owes, owed };
}

export function selectGroupMemberBalances(state: State, groupId: ID): Record<ID, number> {
  const group = state.groups[groupId];
  const result: Record<ID, number> = {};
  if (!group) return result;
  for (const m of group.memberIds) result[m] = 0;
  const exps = Object.values(state.expenses).filter((e) => e.groupId === groupId);
  for (const exp of exps) {
    const shares = computeSharesForExpense(exp, group);
    // everyone owes their share
    for (const m of group.memberIds) {
      result[m] = (result[m] ?? 0) - (shares[m] ?? 0);
    }
    // payer gets full amount
    result[exp.paidBy] = (result[exp.paidBy] ?? 0) + exp.amount;
  }
  // apply settlements: fromMember balance increases by amount, toMember decreases by amount
  const settlements = (Object.values((state as any).settlements || {}) as Settlement[]).filter((s) => s.groupId === groupId);
  for (const s of settlements) {
    if (result[s.fromMemberId] != null) result[s.fromMemberId] += s.amount;
    if (result[s.toMemberId] != null) result[s.toMemberId] -= s.amount;
  }
  return result;
}

export function computeGroupTotalsForUserInGroup(state: State, groupId: ID): { owes: number; owed: number } {
  const balances = selectGroupMemberBalances(state, groupId);
  const me = state.currentMemberId;
  const net = balances[me] ?? 0;
  return { owes: net < 0 ? -net : 0, owed: net > 0 ? net : 0 };
}

// Locale selector: returns undefined when following system locale
export function selectEffectiveLocale(state: State): string | undefined {
  const l = (state as any).settings?.locale as string | 'system' | undefined;
  return l && l !== 'system' ? l : undefined;
}

// Helper: compute per-member shares in currency units based on split type and shares
function computeSharesForExpense(exp: Expense, group: Group): Record<ID, number> {
  const members = group.memberIds;
  const result: Record<ID, number> = {};
  if (!members.length) return result;
  if (exp.splitType === 'amount') {
    const provided = exp.shares || {};
    let sum = 0;
    for (const m of members) sum += Number(provided[m] || 0);
    if (sum <= 0) {
      const eq = exp.amount / members.length;
      for (const m of members) result[m] = eq;
      return result;
    }
    const scale = exp.amount / sum;
    for (const m of members) result[m] = Number(provided[m] || 0) * scale;
    return result;
  }
  if (exp.splitType === 'percent') {
    const provided = exp.shares || {};
    let sumPct = 0;
    for (const m of members) sumPct += Number(provided[m] || 0);
    if (sumPct <= 0) {
      const eq = exp.amount / members.length;
      for (const m of members) result[m] = eq;
      return result;
    }
    for (const m of members) {
      const pct = Number(provided[m] || 0) / sumPct; // normalize
      result[m] = exp.amount * pct;
    }
    return result;
  }
  // equal split
  const eq = exp.amount / members.length;
  for (const m of members) result[m] = eq;
  return result;
}
