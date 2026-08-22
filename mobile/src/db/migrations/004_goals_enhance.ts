// Migration 004 - goals_enhance (color + icon nos cofrinhos)
export const migration004 = `
ALTER TABLE financial_goals ADD COLUMN category_icon TEXT DEFAULT 'default';
ALTER TABLE financial_goals ADD COLUMN color_hex TEXT DEFAULT '#E2FF00';
`;
