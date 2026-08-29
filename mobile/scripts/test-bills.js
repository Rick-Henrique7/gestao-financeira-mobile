// Testa o fluxo de criar/listar bills igual ao service faz.
// Roda com: node scripts/test-bills.js
const path = require('path');
const fs = require('fs');

// Tenta carregar better-sqlite3 (já deve estar em algum projeto)
let Database;
try {
  Database = require('better-sqlite3');
} catch {
  // Fallback: usar sqlite3
  try {
    const sqlite3 = require('sqlite3').verbose();
    console.error('AVISO: usando sqlite3 (não better-sqlite3). Pode haver diferença sutil.');
  } catch (e) {
    console.error('Instale better-sqlite3 ou sqlite3 pra rodar este teste:');
    console.error('  npm i -g better-sqlite3');
    process.exit(1);
  }
}

const dbPath = path.join(__dirname, 'test-sgf.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// ── Migration 001 (copiado) ───────────────────────────────────────────────
db.exec(`
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
`);

const generateId = () =>
  Date.now().toString(36).padStart(8, '0') +
  Math.random().toString(36).slice(2, 10);

// ── Simula createBill ──────────────────────────────────────────────────────
function createBill(input) {
  if (!input.title?.trim()) throw new Error('Titulo obrigatorio');
  if (input.amount <= 0) throw new Error('Valor deve ser > 0');
  if (!input.due_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error('Data deve ser ISO YYYY-MM-DD');
  }
  const id = generateId();
  db.prepare(
    `INSERT INTO bills
       (id, title, amount, due_date, due_time, is_recurrent, frequency, status, category, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
  return id;
}

function listBills() {
  return db.prepare('SELECT * FROM bills ORDER BY due_date ASC').all();
}

function markBillPaid(id) {
  db.prepare(`UPDATE bills SET status='PAID', updated_at=datetime('now') WHERE id=?`).run(id);
}

// ── Teste 1: criar uma bill PENDING ────────────────────────────────────────
console.log('=== Teste 1: criar bill PENDING ===');
try {
  const id = createBill({
    title: 'Conta de luz',
    amount: 150.50,
    due_date: '2026-12-31',
    is_recurrent: 1,
    frequency: 'MONTHLY',
    category: 'Moradia',
    notes: 'Teste',
  });
  console.log('OK: bill criada com id =', id);
} catch (e) {
  console.error('ERRO ao criar:', e.message);
}

const all = listBills();
console.log('Bills listadas:', all.length);
all.forEach((b) => console.log('  -', b.id, b.status, b.title, b.due_date));

// ── Teste 2: marcar como PAID ──────────────────────────────────────────────
console.log('\n=== Teste 2: marcar como PAID ===');
if (all.length) {
  markBillPaid(all[0].id);
  const after = listBills();
  console.log('Bills listadas apos toggle:', after.length);
  after.forEach((b) => console.log('  -', b.id, b.status, b.title));
}

db.close();
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
console.log('\n=== OK ===');
