import type { Lang } from '../constants/strings';

export function eur(n: number, lang: Lang): string {
  const locale = lang === 'el' ? 'el-GR' : 'en-IE';
  const s = Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (n < 0 ? '−' : '') + '€' + s;
}

export function eurDec(n: number, lang: Lang): string {
  const locale = lang === 'el' ? 'el-GR' : 'en-IE';
  const s = Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (n < 0 ? '−' : '') + '€' + s;
}
