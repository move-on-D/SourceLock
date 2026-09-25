import { chromium } from 'playwright';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { execute } from '../db/database';

const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');

export async function scrapeUniversity(url: string) {
  if (!url || !url.startsWith('http')) return { error: 'Invalid URL' };

  const id = uuidv4();
  const screenshotName = `${id}.png`;
  const screenshotPath = path.join(screenshotsDir, screenshotName);

  try {
    console.log(`[Scraper] Starting scrape for ${url}...`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const extractedText = await page.evaluate(() => {
      return document.body ? document.body.innerText.substring(0, 2000) : 'No content found';
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();

    const hostname = new URL(url).hostname;
    const title = `Update from ${hostname} — ${new Date().toLocaleDateString('en-IN')}`;

    execute(
      `INSERT INTO university_updates (id, title, content, url, screenshotPath) VALUES (?, ?, ?, ?, ?)`,
      [id, title, extractedText, url, screenshotName]
    );

    console.log(`[Scraper] Done. Screenshot saved: ${screenshotName}`);
    return { success: true, id, title, screenshot: screenshotName };

  } catch (error: any) {
    console.error('[Scraper] Error:', error);
    return { error: error.message };
  }
}
