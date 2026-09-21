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

export const locales: Record<LocaleCode, Locale> = {
  en: { code: 'en', label: 'English', intl: 'en-US' },
  es: { code: 'es', label: 'Español', intl: 'es-ES' },
  fr: { code: 'fr', label: 'Français', intl: 'fr-FR' },
  de: { code: 'de', label: 'Deutsch', intl: 'de-DE' },
  ja: { code: 'ja', label: '日本語', intl: 'ja-JP' },
}

export const localeList = Object.values(locales)

export const defaultLocale: LocaleCode = 'en'
export const defaultCurrency: CurrencyCode = 'USD'

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && value in locales
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && value in currencies
}

/** Picks the closest supported locale for a browser language tag, e.g. "fr-CA" -> "fr". */
export function resolveBrowserLocale(tag: string | undefined): LocaleCode {
  const base = (tag ?? '').split('-')[0]?.toLowerCase()
  return isLocaleCode(base) ? base : defaultLocale
}
