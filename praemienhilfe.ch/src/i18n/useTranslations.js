// src/i18n/useTranslations.js
import { ui } from './ui.js';

const LOCALES = Object.keys(ui);

export function useTranslations(locale) {
  const dict = ui[locale] ?? ui.de;
  return function t(key, ...args) {
    if (import.meta.env.DEV) {
      for (const l of LOCALES) {
        if (!(key in ui[l])) {
          throw new Error(`[i18n] missing key "${key}" in locale "${l}"`);
        }
      }
    }
    const value = dict[key];
    return typeof value === 'function' ? value(...args) : value;
  };
}
