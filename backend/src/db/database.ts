import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '..', '..', 'sourcelock.db');

let db: Database;

export async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploadDate TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'processing'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Default memory entries
  const defaults = [
    ['university_url', 'https://vtu.ac.in'],
    ['syllabus', 'Add your full syllabus here...'],
    ['timetable', 'Add your college timetable here...'],
    ['course_details', 'Add your course, semester and exam pattern here...']
  ];
  for (const [key, value] of defaults) {
    db.run(`INSERT OR IGNORE INTO memory (key, value) VALUES (?, ?)`, [key, value]);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS university_updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      url TEXT NOT NULL,
      screenshotPath TEXT,
      dateFound TEXT DEFAULT (datetime('now')),
      isRead INTEGER DEFAULT 0
    )
  `);

  saveDb();
  console.log('[DB] SQLite database initialized (sql.js WebAssembly)');
  return db;
}

export function getDb(): Database {
  return db;
}

export function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Helper: run a query and get all results as plain objects
export function queryAll(sql: string, params: any[] = []): Record<string, any>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, any>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, any>);
  }
  stmt.free();
  return rows;
}

// Helper: run a query and get first result
export function queryOne(sql: string, params: any[] = []): Record<string, any> | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run INSERT/UPDATE/DELETE
export function execute(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDb();
}
