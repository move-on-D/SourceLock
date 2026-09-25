import { Router } from 'express';
import { queryAll, execute } from '../db/database';

export const memoryRouter = Router();

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
