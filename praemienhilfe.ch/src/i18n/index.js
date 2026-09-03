// src/i18n/index.js
import de from './dictionaries/de.json';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import { LOCALES, DEFAULT_LOCALE, htmlLang } from './locales.js';

const DICTS = { de, en, es };

export { LOCALES, DEFAULT_LOCALE, htmlLang };

export function getDictionary(lang) {
  return DICTS[lang] || DICTS[DEFAULT_LOCALE];
}

export function t(dict, path, vars) {
  const value = path.split('.').reduce((obj, key) => obj?.[key], dict);
  if (typeof value !== 'string') {
    throw new Error(`[i18n] missing translation key "${path}"`);
  }
  if (!vars) return value;
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), value);
}

export function localePath(lang, path) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}
