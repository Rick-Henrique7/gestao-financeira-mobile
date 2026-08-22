import { getDB, generateId } from '../db/database';
import { ServiceError, type IRPFRecord, type NewIRPFRecord, type IRPFCategory } from '../types';

// ─── IRPF SERVICE ───────────────────────────────────────────────────────────

export async function listIRPF(): Promise<IRPFRecord[]> {
  const db = await getDB();
  return db.getAllAsync<IRPFRecord>('SELECT * FROM irpf_records ORDER BY fiscal_year DESC, created_at DESC');
}

export async function listIRPFByCategory(categoryId: string): Promise<IRPFRecord[]> {
  const db = await getDB();
  return db.getAllAsync<IRPFRecord>(
    'SELECT * FROM irpf_records WHERE category_id = ? ORDER BY fiscal_year DESC',
    categoryId
  );
}

export async function listCategories(): Promise<IRPFCategory[]> {
  const db = await getDB();
  return db.getAllAsync<IRPFCategory>('SELECT * FROM irpf_categories ORDER BY name ASC');
}

export async function createIRPF(input: NewIRPFRecord): Promise<IRPFRecord> {
  validate(input);
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO irpf_records
       (id, category_id, fiscal_year, title, cnpj_cpf, gross_value, deductible_value,
        irrf_tax, ticker, quantity, avg_price, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.category_id,
    input.fiscal_year,
    input.title.trim(),
    input.cnpj_cpf ?? null,
    input.gross_value ?? 0,
    input.deductible_value ?? 0,
    input.irrf_tax ?? 0,
    input.ticker ?? null,
    input.quantity ?? 0,
    input.avg_price ?? 0,
    input.description ?? null,
    input.status ?? 'PENDING'
  );
  return (await db.getFirstAsync<IRPFRecord>('SELECT * FROM irpf_records WHERE id = ?', id))!;
}

export async function markIRPFAttached(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE irpf_records SET status='ATTACHED', updated_at=datetime('now') WHERE id=?`,
    id
  );
}

export async function deleteIRPF(id: string): Promise<void> {
  const db = await getDB();
  const r = await db.runAsync('DELETE FROM irpf_records WHERE id = ?', id);
  if (r.changes === 0) throw new ServiceError('NOT_FOUND', `IRPF record ${id} not found`);
}

function validate(input: NewIRPFRecord): void {
  if (!input.title?.trim()) throw new ServiceError('INVALID_TITLE', 'Titulo obrigatorio');
  if (!input.category_id) throw new ServiceError('INVALID_CATEGORY', 'Categoria obrigatoria');
  if (!Number.isFinite(input.fiscal_year)) {
    throw new ServiceError('INVALID_YEAR', 'Ano fiscal obrigatorio');
  }
}
