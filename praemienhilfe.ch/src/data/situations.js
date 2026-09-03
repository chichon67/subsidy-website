// src/data/situations.js
import { DEFAULT_LOCALE } from '../i18n/locales.js';

const SITUATIONS = {
  de: {
    einzelperson: { label: 'Einzelperson' },
    'familie-paar': { label: 'Familie / Paar' },
    student: { label: 'Student / Auszubildende' },
    getrennt: { label: 'Getrennt / Geschieden' },
    rentner: { label: 'Rentner / Pensionierte' },
  },
  en: {
    einzelperson: { label: 'Single' },
    'familie-paar': { label: 'Family / Couple' },
    student: { label: 'Student / Apprentice' },
    getrennt: { label: 'Separated / Divorced' },
    rentner: { label: 'Retiree / Pensioner' },
  },
  es: {
    einzelperson: { label: 'Persona sola' },
    'familie-paar': { label: 'Familia / Pareja' },
    student: { label: 'Estudiante / Aprendiz' },
    getrennt: { label: 'Separado/a / Divorciado/a' },
    rentner: { label: 'Jubilado/a / Pensionista' },
  },
};

export function getSituationLabel(slug, lang) {
  const dict = SITUATIONS[lang] || SITUATIONS[DEFAULT_LOCALE];
  const entry = dict[slug] || SITUATIONS[DEFAULT_LOCALE][slug];
  return entry ? entry.label : undefined;
}

export function getSituationList(lang) {
  const dict = SITUATIONS[lang] || SITUATIONS[DEFAULT_LOCALE];
  return Object.entries(dict).map(([slug, v]) => ({ slug, ...v }));
}
