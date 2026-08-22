import { create } from 'zustand';
import { getSettings, updateSettings, setHideValues } from '../services/settings';
import type { UserSettings, NewUserSettings } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (input: Partial<NewUserSettings>) => Promise<void>;
  toggleHideValues: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await getSettings();
      set({ settings, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  update: async (input) => {
    try {
      const settings = await updateSettings(input);
      set({ settings });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  toggleHideValues: async () => {
    const current = get().settings;
    const next = current?.hide_values === 1 ? 0 : 1;
    try {
      await setHideValues(next === 1);
      const settings = await getSettings();
      set({ settings });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
