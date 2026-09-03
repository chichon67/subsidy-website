// src/i18n/locales.js
export const LOCALES = ['de', 'en', 'es'];
export const DEFAULT_LOCALE = 'de';

const HTML_LANG = { de: 'de-CH', en: 'en-CH', es: 'es-CH' };
export function htmlLang(lang) {
  return HTML_LANG[lang] || HTML_LANG[DEFAULT_LOCALE];
}
