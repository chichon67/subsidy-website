const KEY = 'disclaimer_shown';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function isDisclaimerDue() {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(KEY);
  if (!stored) return true;
  const ts = Number(stored);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > SEVEN_DAYS_MS;
}

export function markDisclaimerShown() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, String(Date.now()));
}
