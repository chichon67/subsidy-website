// Crawlers named here must stay allowed even if a later rule narrows User-agent: *.
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-User',
  'Google-Extended',
  'Bingbot',
];

const SITEMAP = 'https://praemien-hilfe.ch/sitemap.xml';

export function buildRobotsTxt(sitemapUrl = SITEMAP) {
  const named = AI_CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n');
  return `${named}\n\nUser-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
}
