import { getDB, generateId } from '../db/database';
import { ServiceError, type CashflowTransaction, type NewCashflowTransaction } from '../types';

// ─── CASHFLOW SERVICE (fluxo de caixa) ───────────────────────────────────────

export async function listCashflow(
  startDate?: string,
  endDate?: string
): Promise<CashflowTransaction[]> {
  const db = await getDB();
  if (startDate && endDate) {
    return db.getAllAsync<CashflowTransaction>(
      `SELECT * FROM cashflow_transactions
        WHERE transaction_date BETWEEN ? AND ?
        ORDER BY transaction_date DESC`,
      startDate, endDate
    );
  }
  return db.getAllAsync<CashflowTransaction>(
    'SELECT * FROM cashflow_transactions ORDER BY transaction_date DESC'
  );
}

export async function createCashflow(input: NewCashflowTransaction): Promise<CashflowTransaction> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO cashflow_transactions
       (id, type, category, amount, transaction_date, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.type,
    input.category.trim(),
    input.amount,
    input.transaction_date,
    input.description ?? null
  );
  return (await getCashflow(id))!;
}

export async function getCashflow(id: string): Promise<CashflowTransaction | null> {
  const db = await getDB();
  const r = await db.getFirstAsync<CashflowTransaction>(
    'SELECT * FROM cashflow_transactions WHERE id = ?', id
  );
  return r ?? null;
}

export async function deleteCashflow(id: string): Promise<void> {
  const db = await getDB();
  const result = await db.runAsync(
    'DELETE FROM cashflow_transactions WHERE id = ?', id
  );
  if (result.changes === 0) {
    throw new ServiceError('NOT_FOUND', `Cashflow ${id} not found`);
  }
}

export async function getCashflowSummary(
  startDate: string,
  endDate: string
): Promise<{ income: number; expense: number; balance: number }> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ income: number | null; expense: number | null }>(
    `SELECT
       SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
     FROM cashflow_transactions
     WHERE transaction_date BETWEEN ? AND ?`,
    startDate, endDate
  );
  const income = r?.income ?? 0;
  const expense = r?.expense ?? 0;
  return { income, expense, balance: income - expense };
}

function validate(input: NewCashflowTransaction): void {
  if (!input.category?.trim()) {
    throw new ServiceError('INVALID_CATEGORY', 'Categoria e obrigatoria');
  }
  if (input.amount <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  }
  if (!input.transaction_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'Data deve ser ISO YYYY-MM-DD');
  }
}
