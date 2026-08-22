import { getDB, generateId } from '../db/database';
import { ServiceError, type Receivable, type NewReceivable } from '../types';

// ─── LOANS SERVICE (valores a receber / emprestimos) ──────────────────────────

export async function listLoans(): Promise<Receivable[]> {
  const db = await getDB();
  return db.getAllAsync<Receivable>('SELECT * FROM receivables ORDER BY due_date ASC');
}

export async function getLoan(id: string): Promise<Receivable | null> {
  const db = await getDB();
  const r = await db.getFirstAsync<Receivable>('SELECT * FROM receivables WHERE id = ?', id);
  return r ?? null;
}

export async function createLoan(input: NewReceivable): Promise<Receivable> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO receivables
       (id, debtor_name, amount, amount_paid, loan_date, due_date, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.debtor_name.trim(),
    input.amount,
    input.amount_paid ?? 0,
    input.loan_date,
    input.due_date,
    input.status ?? 'PENDING',
    input.notes ?? null
  );
  return (await getLoan(id))!;
}

export async function registerPayment(id: string, amount: number): Promise<Receivable> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE receivables
        SET amount_paid = amount_paid + ?,
            status = CASE
              WHEN amount_paid + ? >= amount THEN 'PAID'
              WHEN amount_paid + ? > 0 THEN 'PARTIAL'
              ELSE 'PENDING'
            END,
            updated_at = datetime('now')
      WHERE id = ?`,
    amount, amount, amount, id
  );
  return (await getLoan(id))!;
}

export async function deleteLoan(id: string): Promise<void> {
  const db = await getDB();
  const r = await db.runAsync('DELETE FROM receivables WHERE id = ?', id);
  if (r.changes === 0) throw new ServiceError('NOT_FOUND', `Loan ${id} not found`);
}

function validate(input: NewReceivable): void {
  if (!input.debtor_name?.trim()) {
    throw new ServiceError('INVALID_NAME', 'Nome do devedor obrigatorio');
  }
  if (input.amount <= 0) throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  if (!input.loan_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'loan_date deve ser ISO');
  }
  if (!input.due_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'due_date deve ser ISO');
  }
}
