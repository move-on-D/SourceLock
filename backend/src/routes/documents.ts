import { Router } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getDb, queryAll, execute } from '../db/database';
import { processDocument } from '../services/documentProcessor';

export const documentsRouter = Router();
const vaultDir = path.join(__dirname, '..', '..', 'vault');

// GET all documents
documentsRouter.get('/', (req, res) => {
  try {
    const docs = queryAll('SELECT * FROM documents ORDER BY uploadDate DESC');
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST upload a document
documentsRouter.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file: any = Array.isArray(req.files.document)
      ? req.files.document[0]
      : req.files.document;

    const id = uuidv4();
    const ext = path.extname(file.name);
    const filename = `${id}${ext}`;
    const filePath = path.join(vaultDir, filename);

    await file.mv(filePath);

    execute(
      `INSERT INTO documents (id, filename, originalName, mimeType, size, status) VALUES (?, ?, ?, ?, ?, 'processing')`,
      [id, filename, file.name, file.mimetype, file.size]
    );

    // Process asynchronously
    processDocument(filePath, id, file.name, file.mimetype)
      .then(() => {
        execute(`UPDATE documents SET status = 'ready' WHERE id = ?`, [id]);
        console.log(`[Documents] ${file.name} ready`);
      })
      .catch((err) => {
        execute(`UPDATE documents SET status = 'error' WHERE id = ?`, [id]);
        console.error(`[Documents] Error:`, err);
      });

    res.json({ success: true, id, filename: file.name, status: 'processing' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
