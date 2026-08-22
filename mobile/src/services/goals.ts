import { getDB, generateId } from '../db/database';
import { ServiceError, type FinancialGoal, type NewFinancialGoal } from '../types';

// ─── GOALS SERVICE (metas e cofrinhos) ───────────────────────────────────────

export async function listGoals(): Promise<FinancialGoal[]> {
  const db = await getDB();
  return db.getAllAsync<FinancialGoal>(
    'SELECT * FROM financial_goals ORDER BY target_date ASC'
  );
}

export async function getGoal(id: string): Promise<FinancialGoal | null> {
  const db = await getDB();
  const r = await db.getFirstAsync<FinancialGoal>(
    'SELECT * FROM financial_goals WHERE id = ?', id
  );
  return r ?? null;
}

export async function getTotalSaved(): Promise<number> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(current_amount), 0) as total FROM financial_goals'
  );
  return r?.total ?? 0;
}

export async function createGoal(input: NewFinancialGoal): Promise<FinancialGoal> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO financial_goals
       (id, title, target_amount, current_amount, target_date, category_icon, color_hex)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.title.trim(),
    input.target_amount,
    input.current_amount ?? 0,
    input.target_date,
    input.category_icon ?? 'default',
    input.color_hex ?? '#E2FF00'
  );
  return (await getGoal(id))!;
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB();
  const result = await db.runAsync('DELETE FROM financial_goals WHERE id = ?', id);
  if (result.changes === 0) {
    throw new ServiceError('NOT_FOUND', `Goal ${id} not found`);
  }
}

function validate(input: NewFinancialGoal): void {
  if (!input.title?.trim()) {
    throw new ServiceError('INVALID_TITLE', 'Titulo e obrigatorio');
  }
  if (input.target_amount <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Valor alvo deve ser > 0');
  }
  if (!input.target_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'Data deve ser ISO YYYY-MM-DD');
  }
}
