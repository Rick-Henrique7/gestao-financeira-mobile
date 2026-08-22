import { getDB, generateId } from '../db/database';
import { ServiceError, type GoalDeposit, type NewGoalDeposit, type GoalDepositType } from '../types';

// ─── GOAL DEPOSITS SERVICE ───────────────────────────────────────────────────
// Historico de movimentacoes em cada cofrinho (DEPOSIT ou WITHDRAWAL).
// Operacoes de credito/debito sao atomicas via db.withTransactionAsync.

export async function listDepositsByGoal(goalId: string): Promise<GoalDeposit[]> {
  const db = await getDB();
  return db.getAllAsync<GoalDeposit>(
    'SELECT * FROM goal_deposits WHERE goal_id = ? ORDER BY transaction_date DESC, created_at DESC',
    goalId
  );
}

export async function listRecentDeposits(goalId: string, limit = 5): Promise<GoalDeposit[]> {
  const db = await getDB();
  return db.getAllAsync<GoalDeposit>(
    'SELECT * FROM goal_deposits WHERE goal_id = ? ORDER BY transaction_date DESC, created_at DESC LIMIT ?',
    goalId, limit
  );
}

export async function createDeposit(input: NewGoalDeposit): Promise<GoalDeposit> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO goal_deposits
       (id, goal_id, type, amount, transaction_date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.goal_id,
    input.type,
    input.amount,
    input.transaction_date,
    input.notes ?? null
  );
  return (await db.getFirstAsync<GoalDeposit>(
    'SELECT * FROM goal_deposits WHERE id = ?', id
  ))!;
}

export async function depositToGoal(
  goalId: string,
  amount: number,
  transactionDate: string,
  notes?: string,
): Promise<void> {
  if (amount <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  }
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    const goal = await db.getFirstAsync<{ current_amount: number }>(
      'SELECT current_amount FROM financial_goals WHERE id = ?', goalId
    );
    if (!goal) {
      throw new ServiceError('NOT_FOUND', `Goal ${goalId} not found`);
    }
    const id = generateId();
    await db.runAsync(
      `INSERT INTO goal_deposits (id, goal_id, type, amount, transaction_date, notes)
       VALUES (?, ?, 'DEPOSIT', ?, ?, ?)`,
      id, goalId, amount, transactionDate, notes ?? null
    );
    await db.runAsync(
      `UPDATE financial_goals
          SET current_amount = current_amount + ?,
              updated_at = datetime('now')
        WHERE id = ?`,
      amount, goalId
    );
  });
}

export async function withdrawFromGoal(
  goalId: string,
  amount: number,
  transactionDate: string,
  notes?: string,
): Promise<void> {
  if (amount <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  }
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    const goal = await db.getFirstAsync<{ current_amount: number }>(
      'SELECT current_amount FROM financial_goals WHERE id = ?', goalId
    );
    if (!goal) {
      throw new ServiceError('NOT_FOUND', `Goal ${goalId} not found`);
    }
    if (amount > goal.current_amount) {
      throw new ServiceError(
        'INSUFFICIENT_BALANCE',
        `Saldo insuficiente. Disponivel: R$ ${goal.current_amount.toFixed(2)}`
      );
    }
    const id = generateId();
    await db.runAsync(
      `INSERT INTO goal_deposits (id, goal_id, type, amount, transaction_date, notes)
       VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?)`,
      id, goalId, amount, transactionDate, notes ?? null
    );
    await db.runAsync(
      `UPDATE financial_goals
          SET current_amount = current_amount - ?,
              updated_at = datetime('now')
        WHERE id = ?`,
      amount, goalId
    );
  });
}

export async function deleteDeposit(id: string): Promise<void> {
  const db = await getDB();
  const r = await db.runAsync('DELETE FROM goal_deposits WHERE id = ?', id);
  if (r.changes === 0) {
    throw new ServiceError('NOT_FOUND', `Deposit ${id} not found`);
  }
}

export async function getGoalBalance(goalId: string): Promise<number> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ current_amount: number }>(
    'SELECT current_amount FROM financial_goals WHERE id = ?', goalId
  );
  return r?.current_amount ?? 0;
}

function validate(input: NewGoalDeposit): void {
  if (!input.goal_id) {
    throw new ServiceError('INVALID_GOAL', 'goal_id e obrigatorio');
  }
  if (input.amount <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  }
  if (!input.transaction_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'Data deve ser ISO YYYY-MM-DD');
  }
  if (input.type !== 'DEPOSIT' && input.type !== 'WITHDRAWAL') {
    throw new ServiceError('INVALID_TYPE', 'Tipo deve ser DEPOSIT ou WITHDRAWAL');
  }
}

export type { GoalDepositType };
