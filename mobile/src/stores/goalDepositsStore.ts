import { create } from 'zustand';
import {
  listDepositsByGoal, listRecentDeposits, createDeposit, deleteDeposit,
} from '../services/goalDeposits';
import type { GoalDeposit, NewGoalDeposit } from '../types';

interface GoalDepositsState {
  byGoal: Record<string, GoalDeposit[]>;
  recent: GoalDeposit[];
  loading: boolean;
  error: string | null;
  refreshByGoal: (goalId: string) => Promise<void>;
  refreshRecent: (limit?: number) => Promise<void>;
  add: (input: NewGoalDeposit) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useGoalDepositsStore = create<GoalDepositsState>((set, get) => ({
  byGoal: {},
  recent: [],
  loading: false,
  error: null,

  refreshByGoal: async (goalId) => {
    set({ loading: true, error: null });
    try {
      const list = await listDepositsByGoal(goalId);
      set((s) => ({ byGoal: { ...s.byGoal, [goalId]: list }, loading: false }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  refreshRecent: async (limit = 10) => {
    try {
      const all: GoalDeposit[] = [];
      const goalIds = Object.keys(get().byGoal);
      for (const gid of goalIds) {
        const ds = await listRecentDeposits(gid, limit);
        all.push(...ds);
      }
      all.sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1));
      set({ recent: all.slice(0, limit) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  add: async (input) => {
    try {
      await createDeposit(input);
      const list = await listDepositsByGoal(input.goal_id);
      set((s) => ({ byGoal: { ...s.byGoal, [input.goal_id]: list } }));
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  remove: async (id) => {
    try {
      await deleteDeposit(id);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
