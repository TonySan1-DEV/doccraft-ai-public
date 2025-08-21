import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import { isI18nEnabled } from '@/config/flags';
import type { I18nKey } from './keys';
import { format } from './format';

export type Dict = Record<string, string>;
const dictionaries: Record<string, Dict> = { en, es, fr };

const LS_KEY = 'doccraft.locale';
let current: 'en' | 'es' | 'fr' =
  (isI18nEnabled() && (localStorage.getItem(LS_KEY) as any)) || 'en';

export function setLocale(loc: 'en' | 'es' | 'fr') {
  if (!isI18nEnabled()) return; // ignore when flag OFF
  current = loc;
  try {
    localStorage.setItem(LS_KEY, loc);
  } catch {}
}

export function t(
  key: I18nKey,
  vars?: Record<string, string | number>
): string {
  // prefer selected locale, fall back to EN, then raw key
  const dict = dictionaries[current] ?? dictionaries.en;
  const s = dict[key] ?? dictionaries.en[key] ?? key;
  return format(s, vars);
}
