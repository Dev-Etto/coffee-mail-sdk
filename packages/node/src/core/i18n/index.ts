import { enMessages } from './en.js';
import { ptBrMessages } from './pt-br.js';

import type { CoffeeMailLocale, I18nMessages } from './types.js';

export * from './types.js';

const messagesByLocale: Record<CoffeeMailLocale, I18nMessages> = {
  'pt-BR': ptBrMessages,
  en: enMessages,
};

export const getI18nMessage = (
  key: keyof I18nMessages,
  locale: CoffeeMailLocale = 'pt-BR',
  replacements: Record<string, string | number> = {}
): string => {
  const localeMap = messagesByLocale[locale] ?? ptBrMessages;
  let text = localeMap[key];

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
  }

  return text;
};
