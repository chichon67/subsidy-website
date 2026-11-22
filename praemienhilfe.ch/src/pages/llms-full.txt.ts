import { buildLlmsFullTxt } from '../seo/llms.js';

export const prerender = true;

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
