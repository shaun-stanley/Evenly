import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Action, ActivityItem, AddExpensePayload, Expense, Group, ID, State, EditExpensePayload } from './types';

const STORAGE_KEY = '@splitwise_ios_state_v1';

function genId(prefix: string = 'id'): ID {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
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
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
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
        createdAt: Date.now(),
      };
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'expense_added',
        message: `Added “${description}” $${amount.toFixed(2)} in ${state.groups[groupId].name}`,
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
      const activity: ActivityItem = {
        id: genId('act'),
        type: 'expense_edited',
        message: `Edited “${next.description}” $${next.amount.toFixed(2)} in ${state.groups[next.groupId]?.name ?? 'group'}`,
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
  hydrated: boolean;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = React.useState(false);

  // hydrate
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
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

  const deleteExpense = (id: ID) =>
    dispatch({ type: 'DELETE_EXPENSE', payload: { id } });

  const renameGroup = (id: ID, name: string) =>
    dispatch({ type: 'RENAME_GROUP', payload: { id, name } });

  const value = useMemo(() => ({ state, dispatch, addGroup, addExpense, editExpense, deleteExpense, renameGroup, hydrated }), [state, hydrated]);
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
    const members = group.memberIds.length || 1;
    const share = exp.amount / members;
    if (exp.paidBy === me) {
      // others owe me their shares
      const others = group.memberIds.filter((m) => m !== me).length;
      owed += share * others;
    }
    if (group.memberIds.includes(me)) {
      // I owe my share to payer (if not me)
      if (exp.paidBy !== me) owes += share;
    }
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
    const members = group.memberIds.length || 1;
    const share = exp.amount / members;
    // everyone owes their share
    for (const m of group.memberIds) {
      result[m] = (result[m] ?? 0) - share;
    }
    // payer gets full amount
    result[exp.paidBy] = (result[exp.paidBy] ?? 0) + exp.amount;
  }
  return result;
}

export function computeGroupTotalsForUserInGroup(state: State, groupId: ID): { owes: number; owed: number } {
  const balances = selectGroupMemberBalances(state, groupId);
  const me = state.currentMemberId;
  const net = balances[me] ?? 0;
  return { owes: net < 0 ? -net : 0, owed: net > 0 ? net : 0 };
}
