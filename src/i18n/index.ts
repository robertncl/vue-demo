import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { en } from './messages.en'
import { es } from './messages.es'
import { fr } from './messages.fr'
import { de } from './messages.de'
import { ja } from './messages.ja'
import type { Messages } from './messages.en'
import type { LocaleCode, MonthKey } from '@/types/travel'

export const messages: Record<LocaleCode, Messages> = { en, es, fr, de, ja }

export const monthKeys: MonthKey[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function monthKeyFor(date: Date): MonthKey {
  return monthKeys[date.getMonth()]
}

/** Walks a dotted key path, e.g. "home.title". */
function lookup(source: Messages, path: string): string | undefined {
  const value = path
    .split('.')
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], source)
  return typeof value === 'string' ? value : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}

export function useI18n() {
  const settings = useSettingsStore()

  const bundle = computed(() => messages[settings.locale] ?? en)

  /**
   * Translates a dotted key. Falls back to English, then to the key itself, so a
   * missing string is visible rather than blank.
   */
  function t(key: string, params?: Record<string, string | number>): string {
    const template = lookup(bundle.value, key) ?? lookup(en, key) ?? key
    return interpolate(template, params)
  }

  /** Formats a USD amount in the active currency and locale. */
  function money(usd: number): string {
    const { code, decimals } = settings.activeCurrency
    const value = settings.fromBase(usd)
    try {
      return new Intl.NumberFormat(settings.activeLocale.intl, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
    } catch {
      return `${settings.activeCurrency.symbol}${Math.round(value)}`
    }
  }

  function number(value: number): string {
    try {
      return new Intl.NumberFormat(settings.activeLocale.intl).format(value)
    } catch {
      return String(value)
    }
  }

  function month(key: MonthKey, short = false): string {
    return t(`${short ? 'monthsShort' : 'months'}.${key}`)
  }

  function region(value: string): string {
    return t(`regions.${value}`)
  }

  function tag(value: string): string {
    return t(`tags.${value}`)
  }

  return {
    t,
    money,
    number,
    month,
    region,
    tag,
    locale: computed(() => settings.locale),
    currency: computed(() => settings.currency),
  }
}
