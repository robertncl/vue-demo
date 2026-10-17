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

/** Intl.DurationFormat is newer than the ES2022 lib this project types against. */
type DurationFormatter = { format(duration: { hours?: number; minutes?: number }): string }
type DurationFormatConstructor = new (
  locale: string,
  options: { style: 'short' | 'long' | 'narrow' },
) => DurationFormatter
const DurationFormat = (Intl as unknown as { DurationFormat?: DurationFormatConstructor })
  .DurationFormat

export type DateStyle = 'short' | 'long' | 'day' | 'weekday' | 'month'

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { weekday: 'short', month: 'short', day: 'numeric' },
  long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  day: { month: 'short', day: 'numeric' },
  weekday: { weekday: 'short' },
  month: { month: 'long', year: 'numeric' },
}

/** Formatters are costly to build and a results page formats hundreds of times. */
const formatterCache = new Map<string, Intl.DateTimeFormat | DurationFormatter>()

function cachedFormatter<T extends Intl.DateTimeFormat | DurationFormatter>(
  key: string,
  build: () => T,
): T {
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = build()
    formatterCache.set(key, formatter)
  }
  return formatter as T
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

  /**
   * Picks the plural form of `key` for `count` using the language's own rules
   * (French treats 0 as singular, Japanese has one form), then interpolates
   * `{count}` and any other params. Bundles provide `.one` and `.other`.
   */
  function plural(key: string, count: number, params?: Record<string, string | number>): string {
    const rule = new Intl.PluralRules(settings.activeLocale.intl).select(count)
    const form = lookup(bundle.value, `${key}.${rule}`) ? rule : 'other'
    return t(`${key}.${form}`, { count, ...params })
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

  /**
   * Formats wall minutes (local clock time at an airport) as a time of day.
   * They are minutes since the epoch on that local clock, so formatting them
   * in UTC prints the local time unchanged.
   */
  function time(wallMinutes: number): string {
    const intl = settings.activeLocale.intl
    return cachedFormatter(
      `time|${intl}`,
      () => new Intl.DateTimeFormat(intl, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }),
    ).format(new Date(wallMinutes * 60_000))
  }

  /** Formats an ISO "YYYY-MM-DD" date. */
  function date(iso: string, style: DateStyle = 'short'): string {
    const intl = settings.activeLocale.intl
    return cachedFormatter(
      `date|${style}|${intl}`,
      () => new Intl.DateTimeFormat(intl, { ...DATE_OPTIONS[style], timeZone: 'UTC' }),
    ).format(new Date(`${iso}T00:00:00Z`))
  }

  /** "13 hr, 5 min" — localised and pluralised by Intl.DurationFormat where it exists. */
  function duration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (DurationFormat) {
      const intl = settings.activeLocale.intl
      const formatter = cachedFormatter(
        `duration|${intl}`,
        () => new DurationFormat(intl, { style: 'short' }),
      )
      return formatter.format(
        hours && minutes ? { hours, minutes } : hours ? { hours } : { minutes },
      )
    }
    if (!hours) return t('flights.durationM', { m: minutes })
    if (!minutes) return t('flights.durationH', { h: hours })
    return t('flights.durationHm', { h: hours, m: minutes })
  }

  return {
    t,
    plural,
    money,
    number,
    month,
    region,
    tag,
    time,
    date,
    duration,
    locale: computed(() => settings.locale),
    currency: computed(() => settings.currency),
  }
}
