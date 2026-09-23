// Migration 006 - Lead time (em dias) para alertas de contas a vencer.
// Define quantos dias antes do vencimento a conta aparece nas notificacoes.
// Default: 3 dias (consistente com o texto do toggle em Settings).
export const migration006 = `
ALTER TABLE user_settings ADD COLUMN alert_days_before INTEGER DEFAULT 3;
`;
