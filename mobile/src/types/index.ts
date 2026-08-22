// ─── TYPES COMPARTILHADOS ─────────────────────────────────────────────────────

export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type LoanStatus = 'PENDING' | 'PARTIAL' | 'PAID';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type Frequency = 'MONTHLY' | 'YEARLY' | 'WEEKLY';
export type CashflowType = 'INCOME' | 'EXPENSE';
export type IRPFCategoryCode = 'RENDA_VARIAVEL' | 'RENDIMENTOS' | 'BENS_DIREITOS' | 'DEDUCOES';

// ─── 1. Bills ────────────────────────────────────────────────────────────────
export interface Bill {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  due_time: string;
  is_recurrent: 0 | 1;
  frequency: Frequency | null;
  status: BillStatus;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export type NewBill = Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'is_recurrent' | 'due_time' | 'frequency' | 'status' | 'category' | 'notes'> & {
  due_time?: string;
  is_recurrent?: 0 | 1;
  frequency?: Frequency | null;
  status?: BillStatus;
  category?: string | null;
  notes?: string | null;
};

// ─── 2. Loans (valores a receber) ────────────────────────────────────────────
export interface Receivable {
  id: string;
  debtor_name: string;
  amount: number;
  amount_paid: number;
  loan_date: string;
  due_date: string;
  status: LoanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export type NewReceivable = Omit<Receivable, 'id' | 'amount_paid' | 'status' | 'notes' | 'created_at' | 'updated_at'> & {
  amount_paid?: number;
  status?: LoanStatus;
  notes?: string | null;
};

// ─── 3. Financial Goals ──────────────────────────────────────────────────────
export interface FinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category_icon: string;
  color_hex: string;
  created_at: string;
  updated_at: string;
}
export type NewFinancialGoal = Omit<FinancialGoal, 'id' | 'current_amount' | 'category_icon' | 'color_hex' | 'created_at' | 'updated_at'> & {
  current_amount?: number;
  category_icon?: string;
  color_hex?: string;
};

// ─── 3b. Goal Deposits ──────────────────────────────────────────────────────
export type GoalDepositType = 'DEPOSIT' | 'WITHDRAWAL';
export interface GoalDeposit {
  id: string;
  goal_id: string;
  type: GoalDepositType;
  amount: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}
export type NewGoalDeposit = Omit<GoalDeposit, 'id' | 'created_at' | 'notes'> & {
  notes?: string | null;
};

// ─── 4. Subscriptions ────────────────────────────────────────────────────────
export interface Subscription {
  id: string;
  service_name: string;
  monthly_cost: number;
  billing_day: number;
  status: SubscriptionStatus;
  category: string | null;
  color: string;
  initials: string;
  created_at: string;
  updated_at: string;
}
export type NewSubscription = Omit<Subscription, 'id' | 'status' | 'category' | 'color' | 'initials' | 'created_at' | 'updated_at'> & {
  status?: SubscriptionStatus;
  category?: string | null;
  color?: string;
  initials?: string;
};

// ─── 5. IRPF ─────────────────────────────────────────────────────────────────
export interface IRPFCategory {
  id: string;
  name: string;
  code: IRPFCategoryCode;
  created_at: string;
}

export interface IRPFRecord {
  id: string;
  category_id: string;
  fiscal_year: number;
  title: string;
  cnpj_cpf: string | null;
  gross_value: number;
  deductible_value: number;
  irrf_tax: number;
  ticker: string | null;
  quantity: number;
  avg_price: number;
  description: string | null;
  status: 'PENDING' | 'ATTACHED';
  created_at: string;
  updated_at: string;
}
export type NewIRPFRecord = Omit<IRPFRecord, 'id' | 'cnpj_cpf' | 'deductible_value' | 'irrf_tax' | 'ticker' | 'quantity' | 'avg_price' | 'description' | 'status' | 'created_at' | 'updated_at'> & {
  cnpj_cpf?: string | null;
  deductible_value?: number;
  irrf_tax?: number;
  ticker?: string | null;
  quantity?: number;
  avg_price?: number;
  description?: string | null;
  status?: 'PENDING' | 'ATTACHED';
};

// ─── 6. Cashflow ─────────────────────────────────────────────────────────────
export interface CashflowTransaction {
  id: string;
  type: CashflowType;
  category: string;
  amount: number;
  transaction_date: string;
  description: string | null;
  created_at: string;
}
export type NewCashflowTransaction = Omit<CashflowTransaction, 'id' | 'description' | 'created_at'> & {
  description?: string | null;
};

// ─── 7. Document Attachments ──────────────────────────────────────────────────
export interface DocumentAttachment {
  id: string;
  ir_record_id: string | null;
  bill_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size_kb: number;
  is_backed_up: 0 | 1;
  expires_at: string;
  created_at: string;
}
export type NewDocumentAttachment = Omit<DocumentAttachment, 'id' | 'is_backed_up' | 'created_at'> & {
  is_backed_up?: 0 | 1;
};

// ─── 8. User Settings ────────────────────────────────────────────────────────
export interface UserSettings {
  id: 1;
  display_name: string;
  email: string;
  monthly_salary: number;
  biometric_enabled: 0 | 1;
  notification_default_time: string;
  hide_values: 0 | 1;
  created_at: string;
  updated_at: string;
}
export type NewUserSettings = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;

// ─── Service error ───────────────────────────────────────────────────────────
export class ServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}
