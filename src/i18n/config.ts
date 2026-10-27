import type { Currency, CurrencyCode, Locale, LocaleCode } from '@/types/travel'

/**
 * Indicative rates against USD, the base currency everything is stored in.
 * There is no backend, so these are fixed reference rates rather than live ones.
 */
export const currencies: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1, decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92, decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79, decimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', label: 'Japanese Yen', rate: 156, decimals: 0 },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.52, decimals: 0 },
  CAD: { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', rate: 1.37, decimals: 0 },
}

export const currencyList = Object.values(currencies)

/**
 * The original five, then the rest of the world's ten most-spoken languages
 * in order of total speakers. Chinese is Simplified; Arabic is Modern Standard
 * Arabic with Western digits; Portuguese is Brazilian.
 */
export const locales: Record<LocaleCode, Locale> = {
  en: { code: 'en', label: 'English', intl: 'en-US', dir: 'ltr' },
  es: { code: 'es', label: 'Español', intl: 'es-ES', dir: 'ltr' },
  fr: { code: 'fr', label: 'Français', intl: 'fr-FR', dir: 'ltr' },
  de: { code: 'de', label: 'Deutsch', intl: 'de-DE', dir: 'ltr' },
  ja: { code: 'ja', label: '日本語', intl: 'ja-JP', dir: 'ltr' },
  zh: { code: 'zh', label: '中文（简体）', intl: 'zh-CN', dir: 'ltr' },
  hi: { code: 'hi', label: 'हिन्दी', intl: 'hi-IN', dir: 'ltr' },
  ar: { code: 'ar', label: 'العربية', intl: 'ar', dir: 'rtl' },
  bn: { code: 'bn', label: 'বাংলা', intl: 'bn-BD', dir: 'ltr' },
  pt: { code: 'pt', label: 'Português (Brasil)', intl: 'pt-BR', dir: 'ltr' },
  ru: { code: 'ru', label: 'Русский', intl: 'ru-RU', dir: 'ltr' },
  ur: { code: 'ur', label: 'اردو', intl: 'ur-PK', dir: 'rtl' },
}

export const localeList = Object.values(locales)

export const defaultLocale: LocaleCode = 'en'
export const defaultCurrency: CurrencyCode = 'USD'

// Own keys only: `in` would also accept inherited names such as "constructor"
// or "toString", and a stored value like that would resolve to a function.
export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(locales, value)
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(currencies, value)
}

/** Picks the closest supported locale for a browser language tag, e.g. "fr-CA" -> "fr". */
export function resolveBrowserLocale(tag: string | undefined): LocaleCode {
  const base = (tag ?? '').split('-')[0]?.toLowerCase()
  return isLocaleCode(base) ? base : defaultLocale
}
