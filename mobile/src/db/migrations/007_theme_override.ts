// Migration 007 - Persiste escolha manual de tema.
// Valores: 'dark' | 'light' | 'white' | null (null = seguir sistema)
export const migration007 = `
ALTER TABLE user_settings ADD COLUMN theme_override TEXT DEFAULT NULL;
`;
