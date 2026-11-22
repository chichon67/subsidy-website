const HOST = 'praemien-hilfe.ch';
const KEY = 'dcf111e00c75171c97c5ab459cb08f8d';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export function urlsFromSitemap(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()).filter(Boolean);
}

// Submits the built sitemap to IndexNow. Never throws: a failed ping must
// not fail the Netlify deploy. Runs only when CONTEXT is production.
export async function notifyIndexNow({
  context = process.env.CONTEXT,
  sitemapXml = '',
  fetchImpl = globalThis.fetch,
  log = console,
} = {}) {
  if (context !== 'production') {
    log.log(`[indexnow] skip: CONTEXT is ${context || 'unset'}, not production`);
    return { submitted: false, reason: 'not-production' };
  }

  const urlList = urlsFromSitemap(sitemapXml);
  if (urlList.length === 0) {
    log.warn('[indexnow] sitemap has no URLs; skipping');
    return { submitted: false, reason: 'empty' };
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  try {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let detail = '';
      try {
        detail = (await response.text()) || '';
      } catch {
        detail = '';
      }
      log.warn(`[indexnow] IndexNow responded ${response.status}${detail ? ` ${detail}` : ''}`);
      return { submitted: false, reason: 'http', status: response.status };
    }
    log.log(`[indexnow] submitted ${urlList.length} URLs`);
    return { submitted: true, count: urlList.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn(`[indexnow] request failed: ${message}`);
    return { submitted: false, reason: 'network' };
  }
}
