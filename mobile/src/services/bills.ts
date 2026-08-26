import { withDB } from '../db/database';
import { generateId } from '../db/database';
import { ServiceError, type Bill, type NewBill } from '../types';

// ─── BILLS SERVICE (contas a pagar) ──────────────────────────────────────────

export async function listBills(): Promise<Bill[]> {
  return withDB((db) => db.getAllAsync<Bill>('SELECT * FROM bills ORDER BY due_date ASC'));
}

export async function getBill(id: string): Promise<Bill | null> {
  return withDB(async (db) => {
    const r = await db.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?', id);
    return r ?? null;
  });
}

export async function createBill(input: NewBill): Promise<Bill> {
  validate(input);
  const id = generateId();
  return withDB(async (db) => {
    await db.runAsync(
      `INSERT INTO bills
         (id, title, amount, due_date, due_time, is_recurrent, frequency, status, category, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.title.trim(),
      input.amount,
      input.due_date,
      input.due_time ?? '00:00',
      input.is_recurrent ?? 0,
      input.frequency ?? null,
      input.status ?? 'PENDING',
      input.category ?? null,
      input.notes ?? null
    );
    return (await getBill(id))!;
  });
}

export async function updateBill(id: string, patch: Partial<NewBill>): Promise<Bill> {
  return withDB(async (db) => {
    await db.runAsync(
      `UPDATE bills SET title=?, amount=?, due_date=?, status=?, notes=?, updated_at=datetime('now')
       WHERE id=?`,
      patch.title ?? null,
      patch.amount ?? null,
      patch.due_date ?? null,
      patch.status ?? null,
      patch.notes ?? null,
      id
    );
    return (await getBill(id))!;
  });
}

export async function markBillPaid(id: string): Promise<void> {
  await withDB((db) =>
    db.runAsync(
      `UPDATE bills SET status='PAID', updated_at=datetime('now') WHERE id=?`,
      id
    )
  );
}

export async function deleteBill(id: string): Promise<void> {
  await withDB(async (db) => {
    const r = await db.runAsync('DELETE FROM bills WHERE id = ?', id);
    if (r.changes === 0) throw new ServiceError('NOT_FOUND', `Bill ${id} not found`);
  });
}

function validate(input: NewBill): void {
  if (!input.title?.trim()) throw new ServiceError('INVALID_TITLE', 'Titulo obrigatorio');
  if (input.amount <= 0) throw new ServiceError('INVALID_AMOUNT', 'Valor deve ser > 0');
  if (!input.due_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new ServiceError('INVALID_DATE', 'Data deve ser ISO YYYY-MM-DD');
  }
}
