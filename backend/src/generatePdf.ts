import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { initDb, execute, queryOne } from './db/database';
import { processDocument } from './services/documentProcessor';

async function generateSamplePdf() {
  console.log('[PDF Gen] Launching Chromium to generate real textbook PDF...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DBMS Unit 2 - Transactions & Normalization</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
      @bottom-right {
        content: counter(page);
      }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #111827;
      line-height: 1.6;
      font-size: 14pt;
    }
    .header-box {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 22pt;
      font-weight: bold;
      color: #0369a1;
      margin: 0;
    }
    .subtitle {
      font-size: 13pt;
      color: #4b5563;
      margin-top: 4px;
    }
    h2 {
      font-size: 16pt;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 24px;
    }
    p {
      margin-bottom: 14px;
      text-align: justify;
    }
    .highlight-box {
      background-color: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 12px 16px;
      margin: 16px 0;
      font-size: 13pt;
    }
    .acid-list {
      margin-left: 20px;
    }
    .acid-list li {
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 12pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <div class="header-box">
    <div class="title">DATABASE MANAGEMENT SYSTEMS</div>
    <div class="subtitle">Unit 2: Transaction Management & Relational Database Design</div>
    <div style="font-size: 10pt; color: #64748b; margin-top: 4px;">Department of Computer Science & Engineering • Standard Textbook Reference</div>
  </div>

  <h2>1. Concept of Transaction and ACID Properties</h2>
  <p>
    A <strong>transaction</strong> is an executing program that forms a logical unit of database processing. A transaction includes one or more database access operations—these can include insertion, deletion, modification, or retrieval operations. The database operations that form a transaction can either be embedded within an application program or they can be specified interactively through a high-level query language such as SQL.
  </p>

  <div class="highlight-box">
    <strong>Fundamental Definition:</strong> A transaction is an atomic unit of work that either completes entirely or has no effect whatsoever on the database state.
  </div>

  <p>
    To preserve data integrity, consistency, and reliability during concurrent access and hardware or system crashes, a DBMS must enforce the famous <strong>ACID Properties</strong>:
  </p>

  <ul class="acid-list">
    <li><strong>Atomicity:</strong> A transaction is an all-or-nothing unit of operation. It must be performed in its entirety or not at all. If a transaction fails at any stage before completion, the DBMS must rollback all partial changes made by that transaction.</li>
    <li><strong>Consistency:</strong> The execution of a transaction must preserve the consistency of the database. It must transition the database from one valid consistent state (satisfying all integrity constraints, schema rules, and foreign keys) to another valid consistent state.</li>
    <li><strong>Isolation:</strong> Even though multiple transactions may execute concurrently in a multi-user environment, the execution of each transaction should appear completely independent of other concurrent operations. The intermediate state of a transaction remains invisible to concurrent transactions until it commits.</li>
    <li><strong>Durability:</strong> Once a transaction successfully executes and commits, its modifications are permanently recorded in non-volatile storage and must never be lost, even in the event of subsequent power outages, operating system crashes, or hardware failures.</li>
  </ul>

  <div class="page-break"></div>

  <h2>2. Relational Database Design & Normalization</h2>
  <p>
    <strong>Database Normalization</strong> is the formal, mathematical process of organizing attributes and relation schemas to eliminate data redundancy and avoid anomalies such as insertion anomalies, deletion anomalies, and update anomalies.
  </p>

  <table>
    <thead>
      <tr>
        <th>Normal Form</th>
        <th>Primary Condition</th>
        <th>Anomaly Prevented</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>First Normal Form (1NF)</strong></td>
        <td>All attribute values in each tuple must be indivisible, single atomic values. Prohibits multi-valued or composite attributes.</td>
        <td>Repeating groups & nested relations</td>
      </tr>
      <tr>
        <td><strong>Second Normal Form (2NF)</strong></td>
        <td>Must be in 1NF and every non-prime attribute must be fully functionally dependent on the entire primary key.</td>
        <td>Partial functional dependencies</td>
      </tr>
      <tr>
        <td><strong>Third Normal Form (3NF)</strong></td>
        <td>Must be in 2NF and no non-prime attribute may be transitively dependent on the primary key (No X &rarr; Y &rarr; Z).</td>
        <td>Transitive dependencies</td>
      </tr>
      <tr>
        <td><strong>Boyce-Codd (BCNF)</strong></td>
        <td>For every non-trivial functional dependency X &rarr; Y, the determinant X must be a superkey of the relation.</td>
        <td>All functional dependency redundancies</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Concurrency Control & Two-Phase Locking (2PL)</h2>
  <p>
    In multi-user database environments, concurrency control protocols prevent interference between concurrent transactions. The most widely adopted protocol is the <strong>Two-Phase Locking (2PL)</strong> protocol:
  </p>
  <ul class="acid-list">
    <li><strong>Growing Phase:</strong> The transaction can acquire any number of shared (read) or exclusive (write) locks on data items, but cannot release any lock.</li>
    <li><strong>Shrinking Phase:</strong> The transaction can release locks, but cannot acquire any new lock once the first lock is released.</li>
  </ul>
  <p>
    Two-Phase Locking guarantees conflict serializability, preventing dirty reads and lost update anomalies. Deadlocks occurring during 2PL are detected using a <em>Wait-For Graph (WFG)</em> cycle check.
  </p>

</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'load' });
  const pdfPath = path.join(__dirname, '..', 'vault', 'sample-dbms-unit2.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' }
  });

  await browser.close();
  console.log(`[PDF Gen] Successfully created real PDF at: ${pdfPath}`);

  // Now register and index this PDF into DB and VectorStore
  await initDb();
  execute(
    "INSERT OR REPLACE INTO documents (id, filename, originalName, mimeType, size, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      'sample-dbms-pdf',
      'sample-dbms-unit2.pdf',
      'DBMS Unit 2 - Transactions & Normalization (Textbook).pdf',
      'application/pdf',
      fs.statSync(pdfPath).size,
      'ready'
    ]
  );

  console.log('[PDF Gen] Indexing PDF chunks into VectorStore...');
  await processDocument(
    pdfPath,
    'sample-dbms-pdf',
    'DBMS Unit 2 - Transactions & Normalization (Textbook).pdf',
    'application/pdf'
  );
  console.log('[PDF Gen] Done! PDF is ready to view and search in Split-Screen Reader.');
}

generateSamplePdf().catch(err => {
  console.error('[PDF Gen] Error:', err);
});
