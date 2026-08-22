import { create } from 'zustand';
import {
  listLoans, createLoan, registerPayment, deleteLoan,
} from '../services/loans';
import type { Receivable, NewReceivable } from '../types';

interface LoansState {
  loans: Receivable[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (l: NewReceivable) => Promise<void>;
  pay: (id: string, amount: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLoansStore = create<LoansState>((set) => ({
  loans: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const loans = await listLoans();
      set({ loans, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (l) => {
    try {
      await createLoan(l);
      const loans = await listLoans();
      set({ loans });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  pay: async (id, amount) => {
    try {
      await registerPayment(id, amount);
      const loans = await listLoans();
      set({ loans });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id) => {
    try {
      await deleteLoan(id);
      const loans = await listLoans();
      set({ loans });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
