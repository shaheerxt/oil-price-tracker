/** Calendar formatting from ISO strings only — avoids SSR/client timezone drift. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** @param {string} ym — `YYYY-MM` */
export function formatYearMonth(ym) {
  const parts = ym.split('-');
  if (parts.length < 2) return ym;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m || m < 1 || m > 12) return ym;
  return `${MONTHS[m - 1]} ${y}`;
}

/** @param {string} ymd — `YYYY-MM-DD` */
export function formatYearMonthDay(ymd) {
  const parts = ymd.split('-');
  if (parts.length < 3) return ymd;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || m < 1 || m > 12 || !d) return ymd;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
