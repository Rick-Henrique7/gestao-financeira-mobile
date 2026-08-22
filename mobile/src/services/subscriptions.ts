import { getDB, generateId } from '../db/database';
import { ServiceError, type Subscription, type NewSubscription } from '../types';

// ─── SUBSCRIPTIONS SERVICE ───────────────────────────────────────────────────

export async function listSubs(): Promise<Subscription[]> {
  const db = await getDB();
  return db.getAllAsync<Subscription>(
    'SELECT * FROM subscriptions ORDER BY monthly_cost DESC'
  );
}

export async function getSub(id: string): Promise<Subscription | null> {
  const db = await getDB();
  const r = await db.getFirstAsync<Subscription>('SELECT * FROM subscriptions WHERE id = ?', id);
  return r ?? null;
}

export async function createSub(input: NewSubscription): Promise<Subscription> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  // Gera initials a partir do service_name
  const initials = (input.initials ?? autoInitials(input.service_name)).slice(0, 2);
  await db.runAsync(
    `INSERT INTO subscriptions
       (id, service_name, monthly_cost, billing_day, status, category, color, initials)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.service_name.trim(),
    input.monthly_cost,
    input.billing_day,
    input.status ?? 'ACTIVE',
    input.category ?? null,
    input.color ?? '#FFF500',
    initials.toUpperCase()
  );
  return (await getSub(id))!;
}

export async function toggleSubStatus(id: string): Promise<Subscription> {
  const db = await getDB();
  const sub = await getSub(id);
  if (!sub) throw new ServiceError('NOT_FOUND', `Sub ${id} not found`);
  const next = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
  await db.runAsync(
    `UPDATE subscriptions SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    next, id
  );
  return (await getSub(id))!;
}

export async function deleteSub(id: string): Promise<void> {
  const db = await getDB();
  const r = await db.runAsync('DELETE FROM subscriptions WHERE id = ?', id);
  if (r.changes === 0) throw new ServiceError('NOT_FOUND', `Sub ${id} not found`);
}

function autoInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return (parts[0]![0]! + parts[1]![0]!).slice(0, 2);
}

function validate(input: NewSubscription): void {
  if (!input.service_name?.trim()) {
    throw new ServiceError('INVALID_NAME', 'Nome do servico obrigatorio');
  }
  if (input.monthly_cost <= 0) {
    throw new ServiceError('INVALID_AMOUNT', 'Custo mensal deve ser > 0');
  }
  if (input.billing_day < 1 || input.billing_day > 31) {
    throw new ServiceError('INVALID_DAY', 'Dia de cobranca deve ser 1-31');
  }
}
