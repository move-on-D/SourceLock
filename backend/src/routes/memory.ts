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

// POST upload syllabus document or image into Memory
memoryRouter.post('/upload', async (req, res) => {
  try {
    if (!req.files || (!req.files.syllabus && !req.files.file)) {
      return res.status(400).json({ error: 'No syllabus file uploaded' });
    }

    const file: any = req.files.syllabus || req.files.file;
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    const ext = path.extname(uploadedFile.name).toLowerCase();
    const id = uuidv4();
    const savedFilename = `syllabus-${id}${ext}`;
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
      extractedText = `[Syllabus Photo Attached: ${uploadedFile.name}]`;
      // Save image reference
      execute(
        `INSERT INTO memory (key, value, updatedAt) VALUES ('syllabus_image', ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`,
        [savedFilename]
      );
    } else {
      return res.status(400).json({ error: `Unsupported file format ${ext}` });
    }

    // Clean up extracted text
    const cleanText = extractedText.trim();
    if (cleanText) {
      // Update syllabus in memory
      execute(
        `INSERT INTO memory (key, value, updatedAt) VALUES ('syllabus', ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`,
        [cleanText]
      );
    }

    res.json({
      success: true,
      filename: uploadedFile.name,
      savedFilename: isImage ? savedFilename : undefined,
      isImage,
      extractedText: cleanText.slice(0, 500) // snippet preview
    });

  } catch (error: any) {
    console.error('Syllabus upload error:', error);
    res.status(500).json({ error: 'Failed to process syllabus file: ' + error.message });
  }
});
