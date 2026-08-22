// Migration 003 - goal_deposits (historico de aportes/resgates)
export const migration003 = `
CREATE TABLE IF NOT EXISTS goal_deposits (
  id TEXT PRIMARY KEY NOT NULL,
  goal_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('DEPOSIT', 'WITHDRAWAL')),
  amount REAL NOT NULL CHECK(amount > 0),
  transaction_date TEXT NOT NULL,
  notes TEXT CHECK(length(notes) <= 150),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goal_deposits_goal ON goal_deposits(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_deposits_date ON goal_deposits(transaction_date);
`;
