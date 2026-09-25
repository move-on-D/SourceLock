import { Router } from 'express';
import { queryAll, execute } from '../db/database';
import { scrapeUniversity } from '../services/scraperService';
import { v4 as uuidv4 } from 'uuid';

export const universityRouter = Router();

universityRouter.get('/updates', (req, res) => {
  try {
    const updates = queryAll('SELECT * FROM university_updates ORDER BY dateFound DESC');
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

universityRouter.post('/scrape', async (req, res) => {
  try {
    const result = queryAll("SELECT value FROM memory WHERE key = 'university_url'");
    const url = result[0]?.value as string;

    if (!url) {
      return res.status(400).json({ error: 'University URL not set in Memory.' });
    }

    const scrapeResult = await scrapeUniversity(url);
    if (scrapeResult.error) {
      return res.status(500).json({ error: scrapeResult.error });
    }

    res.json(scrapeResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

universityRouter.post('/updates/:id/read', (req, res) => {
  try {
    execute('UPDATE university_updates SET isRead = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});
