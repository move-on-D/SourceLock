import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, execute } from '../db/database';

export const memoryRouter = Router();
const vaultDir = path.join(__dirname, '..', '..', 'vault');

// GET all memory
memoryRouter.get('/', (req, res) => {
  try {
    const memories = queryAll('SELECT key, value, updatedAt FROM memory');
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// POST update a memory key
memoryRouter.post('/', (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    execute(
      `INSERT INTO memory (key, value, updatedAt) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`,
      [key, value]
    );

    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Memory update error:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE a memory key (e.g. remove attached image)
memoryRouter.delete('/:key', (req, res) => {
  try {
    const { key } = req.params;
    execute('DELETE FROM memory WHERE key = ?', [key]);
    res.json({ success: true, key });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete key' });
  }
});

// POST upload file (PDF, Doc, or Photo) to ANY Academic Lock section
memoryRouter.post('/upload', async (req, res) => {
  try {
    if (!req.files || (!req.files.file && !req.files.syllabus)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const section = (req.body && req.body.section) ? String(req.body.section).trim() : 'syllabus';
    const file: any = req.files.file || req.files.syllabus;
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    const ext = path.extname(uploadedFile.name).toLowerCase();
    const id = uuidv4();
    const savedFilename = `${section}-${id}${ext}`;
    const filePath = path.join(vaultDir, savedFilename);

    if (!fs.existsSync(vaultDir)) {
      fs.mkdirSync(vaultDir, { recursive: true });
    }

    await uploadedFile.mv(filePath);

    let extractedText = '';
    let isImage = false;

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      extractedText = parsed.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      isImage = true;
      extractedText = `[Official Photo Attached: ${uploadedFile.name}]`;
      
      // Save image reference in memory
      const imageKey = `${section}_image`;
      execute(
        `INSERT INTO memory (key, value, updatedAt) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`,
        [imageKey, savedFilename]
      );
    } else {
      return res.status(400).json({ error: `Unsupported file format ${ext}` });
    }

    const cleanText = extractedText.trim();
    if (cleanText) {
      // Fetch existing text for section to see if we should append or set
      const existing = queryAll('SELECT value FROM memory WHERE key = ?', [section]);
      let updatedValue = cleanText;

      if (isImage && existing && existing[0]?.value) {
        // Don't overwrite existing typed text when attaching a photo, just append notice
        const currentText = String(existing[0].value);
        if (!currentText.includes(savedFilename)) {
          updatedValue = `${currentText}\n\n[Photo: ${uploadedFile.name}]`;
        } else {
          updatedValue = currentText;
        }
      }

      execute(
        `INSERT INTO memory (key, value, updatedAt) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`,
        [section, updatedValue]
      );
    }

    res.json({
      success: true,
      section,
      filename: uploadedFile.name,
      savedFilename: isImage ? savedFilename : undefined,
      isImage,
      extractedText: cleanText.slice(0, 500)
    });

  } catch (error: any) {
    console.error('Academic upload error:', error);
    res.status(500).json({ error: 'Failed to process file: ' + error.message });
  }
});
