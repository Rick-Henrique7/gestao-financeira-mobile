import { create } from 'zustand';
import {
  listIRPF, listCategories, createIRPF, markIRPFAttached, deleteIRPF,
} from '../services/irpf';
import type { IRPFRecord, NewIRPFRecord, IRPFCategory } from '../types';

interface IRPFState {
  records: IRPFRecord[];
  categories: IRPFCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  add: (r: NewIRPFRecord) => Promise<void>;
  attach: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useIRPFStore = create<IRPFState>((set) => ({
  records: [],
  categories: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const records = await listIRPF();
      set({ records, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  refreshCategories: async () => {
    try {
      const categories = await listCategories();
      set({ categories });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  add: async (r) => {
    try {
      await createIRPF(r);
      const records = await listIRPF();
      set({ records });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  attach: async (id) => {
    try {
      await markIRPFAttached(id);
      const records = await listIRPF();
      set({ records });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id) => {
    try {
      await deleteIRPF(id);
      const records = await listIRPF();
      set({ records });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
