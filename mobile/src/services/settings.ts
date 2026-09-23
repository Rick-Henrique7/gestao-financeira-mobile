import { getDB } from '../db/database';
import { ServiceError, type UserSettings, type NewUserSettings } from '../types';

// ─── SETTINGS SERVICE ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: NewUserSettings = {
  display_name: 'Convidado',
  email: '',
  monthly_salary: 0,
  biometric_enabled: 0,
  notification_default_time: '09:00',
  hide_values: 0,
  notify_due_soon: 1,
  notify_goal_milestone: 1,
  notify_budget_exceeded: 1,
  alert_days_before: 3,
};

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  let row = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
  if (!row) {
    await db.runAsync(
      `INSERT INTO user_settings (id, display_name) VALUES (1, ?)`,
      DEFAULT_SETTINGS.display_name
    );
    row = (await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1'))!;
  }
  // Garante alert_days_before (coluna nova em migration 006 pode nao vir em row antiga)
  if (row && typeof (row as UserSettings).alert_days_before !== 'number') {
    (row as UserSettings).alert_days_before = 3;
  }
  return row;
}

export async function updateSettings(patch: Partial<NewUserSettings>): Promise<UserSettings> {
  const db = await getDB();
  const current = await getSettings();
  const next: NewUserSettings = { ...current, ...patch };
  await db.runAsync(
    `UPDATE user_settings SET
       display_name = ?,
       email = ?,
       monthly_salary = ?,
       biometric_enabled = ?,
       notification_default_time = ?,
       hide_values = ?,
       notify_due_soon = ?,
       notify_goal_milestone = ?,
       notify_budget_exceeded = ?,
       alert_days_before = ?,
       updated_at = datetime('now')
     WHERE id = 1`,
    next.display_name,
    next.email,
    next.monthly_salary,
    next.biometric_enabled,
    next.notification_default_time,
    next.hide_values,
    next.notify_due_soon ?? 1,
    next.notify_goal_milestone ?? 1,
    next.notify_budget_exceeded ?? 1,
    next.alert_days_before ?? 3
  );
  return getSettings();
}

export async function setHideValues(hide: boolean): Promise<void> {
  await updateSettings({ hide_values: hide ? 1 : 0 });
}

export async function setDisplayName(name: string): Promise<UserSettings> {
  if (!name?.trim()) throw new ServiceError('INVALID_NAME', 'Nome nao pode ser vazio');
  return updateSettings({ display_name: name.trim() });
}
