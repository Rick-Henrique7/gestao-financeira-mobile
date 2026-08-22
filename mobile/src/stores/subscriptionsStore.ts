import { create } from 'zustand';
import { listSubs, createSub, toggleSubStatus, deleteSub } from '../services/subscriptions';
import type { Subscription, NewSubscription } from '../types';

interface SubsState {
  subs: Subscription[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (s: NewSubscription) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSubsStore = create<SubsState>((set) => ({
  subs: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const subs = await listSubs();
      set({ subs, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (s) => {
    try {
      await createSub(s);
      const subs = await listSubs();
      set({ subs });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  toggle: async (id) => {
    try {
      await toggleSubStatus(id);
      const subs = await listSubs();
      set({ subs });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id) => {
    try {
      await deleteSub(id);
      const subs = await listSubs();
      set({ subs });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
