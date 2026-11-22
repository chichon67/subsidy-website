import { buildSitemapXml } from '../seo/sitemap.js';

export const prerender = true;

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
