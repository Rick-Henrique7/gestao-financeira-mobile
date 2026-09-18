// Migration 005 - Adiciona preferencias de notificacao e notificacao de vencimento
export const migration005 = `
ALTER TABLE user_settings ADD COLUMN notify_due_soon INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN notify_goal_milestone INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN notify_budget_exceeded INTEGER DEFAULT 1;
`;
