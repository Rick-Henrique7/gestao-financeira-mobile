// Migration 001 - Schema inicial
export const migration001 = `
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  due_date TEXT NOT NULL,
  due_time TEXT DEFAULT '00:00',
  is_recurrent INTEGER DEFAULT 0,
  frequency TEXT,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID','OVERDUE')),
  category TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receivables (
  id TEXT PRIMARY KEY NOT NULL,
  debtor_name TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  amount_paid REAL DEFAULT 0,
  loan_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','PARTIAL','PAID')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_goals (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK(length(title) <= 100),
  target_amount REAL NOT NULL CHECK(target_amount > 0),
  current_amount REAL DEFAULT 0.0,
  target_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  service_name TEXT NOT NULL,
  monthly_cost REAL NOT NULL CHECK(monthly_cost > 0),
  billing_day INTEGER NOT NULL CHECK(billing_day BETWEEN 1 AND 31),
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','PAUSED','CANCELLED')),
  category TEXT,
  color TEXT DEFAULT '#FFF500',
  initials TEXT DEFAULT 'OK',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS irpf_categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL CHECK(code IN ('RENDA_VARIAVEL','RENDIMENTOS','BENS_DIREITOS','DEDUCOES')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS irpf_records (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL REFERENCES irpf_categories(id) ON DELETE RESTRICT,
  fiscal_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  cnpj_cpf TEXT,
  gross_value REAL DEFAULT 0,
  deductible_value REAL DEFAULT 0,
  irrf_tax REAL DEFAULT 0,
  ticker TEXT,
  quantity REAL DEFAULT 0,
  avg_price REAL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','ATTACHED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cashflow_transactions (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('INCOME','EXPENSE')),
  category TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  transaction_date TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_attachments (
  id TEXT PRIMARY KEY NOT NULL,
  ir_record_id TEXT REFERENCES irpf_records(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_kb REAL NOT NULL,
  is_backed_up INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  display_name TEXT DEFAULT 'Convidado',
  email TEXT DEFAULT '',
  monthly_salary REAL DEFAULT 0,
  biometric_enabled INTEGER DEFAULT 0,
  notification_default_time TEXT DEFAULT '09:00',
  hide_values INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_cashflow_date ON cashflow_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_irpf_fiscal ON irpf_records(fiscal_year);
`;
