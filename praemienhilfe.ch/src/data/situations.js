// src/data/situations.js
export const SITUATIONS = {
  einzelperson: { icon: '👤', label: 'Einzelperson' },
  familie: { icon: '👨‍👩‍👧', label: 'Familie mit Kindern' },
  paar: { icon: '💑', label: 'Paar ohne Kinder' },
  student: { icon: '🎓', label: 'Student / Auszubildende' },
  getrennt: { icon: '💔', label: 'Getrennt / Geschieden' },
  rentner: { icon: '👴', label: 'Rentner / Pensionierte' },
};

export const situationList = Object.entries(SITUATIONS).map(([slug, v]) => ({ slug, ...v }));
