// src/data/situations.js
export const SITUATIONS = {
  einzelperson: { label: 'Einzelperson' },
  'familie-paar': { label: 'Familie / Paar' },
  student: { label: 'Student / Auszubildende' },
  getrennt: { label: 'Getrennt / Geschieden' },
  rentner: { label: 'Rentner / Pensionierte' },
};

export const situationList = Object.entries(SITUATIONS).map(([slug, v]) => ({ slug, ...v }));
