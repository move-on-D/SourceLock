import { initDb, execute, queryOne } from './db/database';
import { processDocument } from './services/documentProcessor';
import path from 'path';

async function seed() {
  await initDb();
  const existing = queryOne("SELECT id FROM documents WHERE id = 'sample-dbms'");
  if (!existing) {
    const filePath = path.join(__dirname, '..', 'vault', 'sample-dbms-unit2.txt');
    execute(
      "INSERT INTO documents (id, filename, originalName, mimeType, size, status) VALUES (?, ?, ?, ?, ?, ?)",
      ['sample-dbms', 'sample-dbms-unit2.txt', 'DBMS Unit 2 - Transactions & Normalization.txt', 'text/plain', 2400, 'ready']
    );
    await processDocument(filePath, 'sample-dbms', 'DBMS Unit 2 - Transactions & Normalization.txt', 'text/plain');
    console.log('Seeded sample DBMS document successfully!');
  } else {
    console.log('Sample DBMS document already exists');
  }
}

seed();
