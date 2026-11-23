import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as plugin from '../netlify/plugins/indexnow/index.js';
import { notifyIndexNow, urlsFromSitemap } from '../netlify/plugins/indexnow/submit.js';

const { onSuccess } = plugin;

const KEY = 'dcf111e00c75171c97c5ab459cb08f8d';
const HOST = 'praemien-hilfe.ch';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
<url><loc>https://praemien-hilfe.ch/de/</loc></url>
<url><loc>https://praemien-hilfe.ch/en/faq</loc></url>
</urlset>`;

test('plugin entry exports only Netlify lifecycle hooks', () => {
  const allowed = new Set(['onPreBuild', 'onBuild', 'onPostBuild', 'onSuccess', 'onError', 'onEnd']);
  const names = Object.keys(plugin);
  assert.deepEqual(names.filter((name) => !allowed.has(name)), []);
  assert.equal(typeof plugin.onSuccess, 'function');
});

test('IndexNow key file is exactly the key and the canton catch-all cannot steal it', () => {
  const keyPath = path.join(import.meta.dirname, '..', 'public', `${KEY}.txt`);
  assert.equal(readFileSync(keyPath, 'utf8'), KEY);

  const toml = readFileSync(path.join(import.meta.dirname, '..', 'netlify.toml'), 'utf8');
  const pass = toml.indexOf(`from = "/${KEY}.txt"`);
  const catchAll = toml.indexOf('from = "/:canton"');
  assert.ok(pass !== -1, 'missing pass-through for the key file');
  assert.ok(catchAll !== -1);
  assert.ok(pass < catchAll, 'key file rule must come before /:canton');
  assert.match(toml, /package = "\.\/netlify\/plugins\/indexnow"/);
});

test('sitemap parser returns every loc', () => {
  assert.deepEqual(urlsFromSitemap(SITEMAP), [
    'https://praemien-hilfe.ch/de/',
    'https://praemien-hilfe.ch/en/faq',
  ]);
  assert.deepEqual(urlsFromSitemap(''), []);
});

test('production deploy posts the sitemap URLs to IndexNow', async () => {
  const calls = [];
  const result = await notifyIndexNow({
    context: 'production',
    sitemapXml: SITEMAP,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return { ok: true, status: 200, text: async () => '' };
    },
    log: silentLog(),
  });

  assert.equal(result.submitted, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.indexnow.org/indexnow');
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: ['https://praemien-hilfe.ch/de/', 'https://praemien-hilfe.ch/en/faq'],
  });
});

test('non-production deploys do not call IndexNow', async () => {
  let called = false;
  const result = await notifyIndexNow({
    context: 'deploy-preview',
    sitemapXml: SITEMAP,
    fetchImpl: async () => {
      called = true;
      return { ok: true, status: 200, text: async () => '' };
    },
    log: silentLog(),
  });
  assert.equal(result.submitted, false);
  assert.equal(called, false);
});

test('IndexNow failures warn and do not throw', async () => {
  const warnings = [];
  const http = await notifyIndexNow({
    context: 'production',
    sitemapXml: SITEMAP,
    fetchImpl: async () => ({ ok: false, status: 403, text: async () => 'forbidden' }),
    log: { log() {}, warn(message) { warnings.push(message); } },
  });
  assert.equal(http.submitted, false);
  assert.match(warnings.at(-1), /403/);

  const network = await notifyIndexNow({
    context: 'production',
    sitemapXml: SITEMAP,
    fetchImpl: async () => {
      throw new Error('network down');
    },
    log: { log() {}, warn(message) { warnings.push(message); } },
  });
  assert.equal(network.submitted, false);
  assert.match(warnings.at(-1), /network down/);
});

test('onSuccess reads the built sitemap and only submits in production', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'indexnow-'));
  writeFileSync(path.join(dir, 'sitemap.xml'), SITEMAP);
  const calls = [];
  const originalFetch = globalThis.fetch;
  const originalContext = process.env.CONTEXT;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 202, text: async () => '' };
  };

  try {
    process.env.CONTEXT = 'deploy-preview';
    await onSuccess({ constants: { PUBLISH_DIR: dir } });
    assert.equal(calls.length, 0);

    process.env.CONTEXT = 'production';
    await onSuccess({ constants: { PUBLISH_DIR: dir } });
    assert.equal(calls.length, 1);
    assert.equal(JSON.parse(calls[0].init.body).urlList.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = originalContext;
    rmSync(dir, { recursive: true, force: true });
  }
});

function silentLog() {
  return { log() {}, warn() {} };
}
