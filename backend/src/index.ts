import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDb, queryAll } from './db/database';

// Routes
import { documentsRouter } from './routes/documents';
import { aiRouter } from './routes/ai';
import { memoryRouter } from './routes/memory';
import { universityRouter } from './routes/university';
import { plannerRouter } from './routes/planner';
import { scrapeUniversity } from './services/scraperService';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));

// Serve static files
app.use('/vault', express.static(path.join(__dirname, '..', 'vault')));
app.use('/screenshots', express.static(path.join(__dirname, '..', 'screenshots')));

// Register Routes
app.use('/api/documents', documentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/university', universityRouter);
app.use('/api/planner', plannerRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Setup Cron Job: Check university website every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('[Cron] Checking university website for updates...');
    try {
        const result = queryAll("SELECT value FROM memory WHERE key = 'university_url'");
        const url = result[0]?.value as string;
        if (url) {
            await scrapeUniversity(url);
        }
    } catch (e) {
        console.error('[Cron] Error running scheduled scrape:', e);
    }
});

// Initialize DB and Start Server
async function startServer() {
  await initDb();
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`SourceLock Backend running on port ${PORT} (0.0.0.0)`);
    console.log(`===========================================`);
  });
}

startServer();
