import * as React from 'react';
import { isI18nEnabled } from '@/config/flags';
import { setLocale } from '@/i18n';

export function LanguageSwitch() {
  if (!isI18nEnabled()) return null;

  return (
    <select
      className="select select-bordered h-9"
      defaultValue="en"
      onChange={e => setLocale(e.target.value as 'en' | 'es' | 'fr')}
      aria-label="Language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
    </select>
  );
}
