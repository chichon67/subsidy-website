// src/data/situations.js
const LABELS = {
  de: {
    einzelperson: 'Einzelperson',
    'familie-paar': 'Familie / Paar',
    student: 'Student / Auszubildende',
    getrennt: 'Getrennt / Geschieden',
    rentner: 'Rentner / Pensionierte',
  },
  en: {
    einzelperson: 'Single person',
    'familie-paar': 'Family / Couple',
    student: 'Student / Apprentice',
    getrennt: 'Separated / Divorced',
    rentner: 'Retiree / Pensioner',
  },
  es: {
    einzelperson: 'Persona sola',
    'familie-paar': 'Familia / Pareja',
    student: 'Estudiante / Aprendiz',
    getrennt: 'Separado(a) / Divorciado(a)',
    rentner: 'Jubilado(a) / Pensionista',
  },
};

export function SITUATIONS(locale) {
  const labels = LABELS[locale] ?? LABELS.de;
  return Object.fromEntries(Object.keys(LABELS.de).map((slug) => [slug, { label: labels[slug] }]));
}

export function situationList(locale) {
  const situations = SITUATIONS(locale);
  return Object.entries(situations).map(([slug, v]) => ({ slug, ...v }));
}
