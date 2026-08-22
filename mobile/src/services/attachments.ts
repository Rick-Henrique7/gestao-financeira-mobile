import { getDB, generateId } from '../db/database';
import { ServiceError, type DocumentAttachment, type NewDocumentAttachment } from '../types';

// ─── ATTACHMENTS SERVICE (anexos de documentos) ──────────────────────────────

export async function listAttachments(opts?: { irRecordId?: string; billId?: string }): Promise<DocumentAttachment[]> {
  const db = await getDB();
  if (opts?.irRecordId) {
    return db.getAllAsync<DocumentAttachment>(
      'SELECT * FROM document_attachments WHERE ir_record_id = ? ORDER BY created_at DESC',
      opts.irRecordId
    );
  }
  if (opts?.billId) {
    return db.getAllAsync<DocumentAttachment>(
      'SELECT * FROM document_attachments WHERE bill_id = ? ORDER BY created_at DESC',
      opts.billId
    );
  }
  return db.getAllAsync<DocumentAttachment>(
    'SELECT * FROM document_attachments ORDER BY created_at DESC'
  );
}

export async function createAttachment(input: NewDocumentAttachment): Promise<DocumentAttachment> {
  const db = await getDB();
  const id = generateId();
  await db.runAsync(
    `INSERT INTO document_attachments
       (id, ir_record_id, bill_id, file_name, file_path, file_type, file_size_kb, is_backed_up, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.ir_record_id ?? null,
    input.bill_id ?? null,
    input.file_name,
    input.file_path,
    input.file_type,
    input.file_size_kb,
    input.is_backed_up ?? 0,
    input.expires_at
  );
  return (await db.getFirstAsync<DocumentAttachment>(
    'SELECT * FROM document_attachments WHERE id = ?', id
  ))!;
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await getDB();
  const r = await db.runAsync('DELETE FROM document_attachments WHERE id = ?', id);
  if (r.changes === 0) {
    throw new ServiceError('NOT_FOUND', `Attachment ${id} not found`);
  }
}
