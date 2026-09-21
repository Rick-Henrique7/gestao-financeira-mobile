import { create } from 'zustand';
import {
  listBills, createBill, markBillPaid, deleteBill, updateBill,
} from '../services/bills';
import type { Bill, NewBill } from '../types';

interface BillsState {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (b: NewBill) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  update: (id: string, patch: Partial<NewBill>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBillsStore = create<BillsState>((set) => ({
  bills: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const bills = await listBills();
      set({ bills, loading: false });
    } catch (e) {
      console.error('[billsStore] refresh failed:', e);
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (b) => {
    // NAO swallow error - re-throw pro BillForm.onSubmit pegar
    await createBill(b);
    const bills = await listBills();
    set({ bills, error: null });
  },

  togglePaid: async (id) => {
    await markBillPaid(id);
    const bills = await listBills();
    set({ bills, error: null });
  },

  update: async (id, patch) => {
    await updateBill(id, patch);
    const bills = await listBills();
    set({ bills, error: null });
  },

  remove: async (id) => {
    await deleteBill(id);
    const bills = await listBills();
    set({ bills, error: null });
  },
}));
