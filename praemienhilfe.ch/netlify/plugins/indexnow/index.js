import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notifyIndexNow } from './submit.js';

// Netlify treats every named export as a lifecycle event. Keep helpers in
// submit.js so this file only exports onSuccess.

export async function onSuccess({ constants } = {}) {
  try {
    const sitemapPath = path.join(constants.PUBLISH_DIR, 'sitemap.xml');
    const sitemapXml = await readFile(sitemapPath, 'utf8');
    await notifyIndexNow({ sitemapXml });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[indexnow] ${message}`);
  }
}
