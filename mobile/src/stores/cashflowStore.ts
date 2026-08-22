import { create } from 'zustand';
import {
  listCashflow, createCashflow, deleteCashflow, getCashflowSummary,
} from '../services/cashflow';
import type { CashflowTransaction, NewCashflowTransaction } from '../types';

interface CashflowSummary {
  income: number;
  expense: number;
  balance: number;
}

interface CashflowState {
  transactions: CashflowTransaction[];
  summary: CashflowSummary;
  loading: boolean;
  error: string | null;
  refresh: (startDate?: string, endDate?: string) => Promise<void>;
  add: (t: NewCashflowTransaction) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const emptySummary: CashflowSummary = { income: 0, expense: 0, balance: 0 };

export const useCashflowStore = create<CashflowState>((set) => ({
  transactions: [],
  summary: emptySummary,
  loading: false,
  error: null,

  refresh: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const transactions = await listCashflow(startDate, endDate);
      let summary = emptySummary;
      if (startDate && endDate) {
        summary = await getCashflowSummary(startDate, endDate);
      }
      set({ transactions, summary, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (t) => {
    try {
      await createCashflow(t);
      const transactions = await listCashflow();
      set({ transactions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id) => {
    try {
      await deleteCashflow(id);
      const transactions = await listCashflow();
      set({ transactions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
