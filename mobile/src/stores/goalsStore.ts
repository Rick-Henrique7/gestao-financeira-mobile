import { create } from 'zustand';
import {
  listGoals, createGoal, deleteGoal, getTotalSaved,
} from '../services/goals';
import {
  depositToGoal, withdrawFromGoal, listRecentDeposits,
} from '../services/goalDeposits';
import type { FinancialGoal, NewFinancialGoal, GoalDeposit } from '../types';

interface GoalsState {
  goals: FinancialGoal[];
  totalSaved: number;
  recentDeposits: GoalDeposit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshTotalSaved: () => Promise<void>;
  refreshRecentDeposits: (limit?: number) => Promise<void>;
  add: (g: NewFinancialGoal) => Promise<void>;
  remove: (id: string) => Promise<void>;
  deposit: (id: string, amount: number, date: string, notes?: string) => Promise<void>;
  withdraw: (id: string, amount: number, date: string, notes?: string) => Promise<void>;
}

const reloadGoals = async (set: (s: Partial<GoalsState>) => void) => {
  const goals = await listGoals();
  const totalSaved = await getTotalSaved();
  set({ goals, totalSaved });
};

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  totalSaved: 0,
  recentDeposits: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      await reloadGoals(set);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  refreshTotalSaved: async () => {
    try {
      const totalSaved = await getTotalSaved();
      set({ totalSaved });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  refreshRecentDeposits: async (limit = 10) => {
    try {
      const all: GoalDeposit[] = [];
      const goals = await listGoals();
      for (const g of goals) {
        const ds = await listRecentDeposits(g.id, limit);
        all.push(...ds);
      }
      all.sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1));
      set({ recentDeposits: all.slice(0, limit) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  add: async (g) => {
    try {
      await createGoal(g);
      await reloadGoals(set);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id) => {
    try {
      await deleteGoal(id);
      await reloadGoals(set);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  deposit: async (id, amount, date, notes) => {
    try {
      await depositToGoal(id, amount, date, notes);
      await reloadGoals(set);
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  withdraw: async (id, amount, date, notes) => {
    try {
      await withdrawFromGoal(id, amount, date, notes);
      await reloadGoals(set);
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },
}));
