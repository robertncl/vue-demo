import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18n, bundleFor, loadLocale, monthKeyFor, monthKeys } from '../index'
import { useSettingsStore } from '@/stores/settings'
import { en } from '../messages.en'
import { isCurrencyCode, isLocaleCode, localeList, resolveBrowserLocale } from '../config'

const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])

/** A plural message: an object keyed only by plural categories, with `other`. */
function isPlural(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'other' in value &&
    Object.keys(value).every((key) => PLURAL_CATEGORIES.has(key))
  )
}

/**
 * Every message in a bundle as [dotted path, strings]. A plural message is one
 * entry holding all its forms, because languages legitimately differ in which
 * forms they need.
 */
function messagesOf(source: object, prefix = ''): [string, string[]][] {
  return Object.entries(source).flatMap(([key, value]): [string, string[]][] => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') return [[path, [value]]]
    if (isPlural(value)) return [[path, Object.values(value)]]
    return messagesOf(value as object, path)
  })
}

const placeholders = (text: string) => new Set(text.match(/\{\w+\}/g) ?? [])

/** Every bundle, keyed by language. The test setup has loaded them all. */
const messages = Object.fromEntries(localeList.map((l) => [l.code, bundleFor(l.code)!]))

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('translates a key in the active language', () => {
    const { t } = useI18n()
    const settings = useSettingsStore()

    expect(t('nav.trips')).toBe('Trips')

    settings.setLocale('es')
    expect(t('nav.trips')).toBe('Viajes')

    settings.setLocale('ja')
    expect(t('nav.trips')).toBe('旅程')
  })

  it('interpolates named parameters', () => {
    const { t } = useI18n()
    expect(t('planner.dayLabel', { n: 3 })).toBe('Day 3')
    expect(t('topPick.eyebrow', { month: 'May' })).toBe('Top pick for May')
  })

  it('leaves unknown placeholders untouched', () => {
    const { t } = useI18n()
    expect(t('planner.dayLabel', { wrong: 1 })).toBe('Day {n}')
  })

  it('returns the key itself when the string is missing', () => {
    const { t } = useI18n()
    expect(t('nope.not.here')).toBe('nope.not.here')
  })

  it('formats money in the active currency and locale', () => {
    const { money } = useI18n()
    const settings = useSettingsStore()

    expect(money(145)).toBe('$145')

    settings.setCurrency('EUR')
    expect(money(145)).toBe('€133')

    settings.setCurrency('JPY')
    expect(money(10)).toBe('¥1,560')
  })

  it('formats money with locale-appropriate separators', () => {
    const { money } = useI18n()
    const settings = useSettingsStore()
    settings.setLocale('de')
    settings.setCurrency('EUR')

    // German formatting puts the symbol last
    expect(money(1000)).toMatch(/€$/)
  })

  it('translates months, regions and tags', () => {
    const { month, region, tag } = useI18n()
    const settings = useSettingsStore()

    expect(month('Sep')).toBe('September')
    expect(month('Sep', true)).toBe('Sep')

    settings.setLocale('fr')
    expect(month('Sep')).toBe('septembre')
    expect(region('Asia')).toBe('Asie')
    expect(tag('food')).toBe('gastronomie')
  })

  it('picks plural forms by each language’s rules', () => {
    const { plural } = useI18n()
    const settings = useSettingsStore()

    expect(plural('search.travellers', 1)).toBe('1 traveller')
    expect(plural('search.travellers', 2)).toBe('2 travellers')

    // French treats zero as singular.
    settings.setLocale('fr')
    expect(plural('flights.stops', 0)).toBe('0 escale')
    expect(plural('flights.stops', 2)).toBe('2 escales')

    settings.setLocale('ja')
    expect(plural('flights.stops', 1)).toBe('乗継1回')
  })

  it('formats local flight times, dates and durations', () => {
    const { time, date, duration } = useI18n()
    const settings = useSettingsStore()
    // 2026-11-10 at 23:05 on the local clock.
    const wall = Date.UTC(2026, 10, 10) / 60_000 + 23 * 60 + 5

    expect(time(wall)).toBe('11:05 PM')
    expect(date('2026-11-10')).toBe('Tue, Nov 10')
    expect(date('2026-11-10', 'month')).toBe('November 2026')
    expect(duration(785)).toBe('13 hr, 5 min')
    expect(duration(120)).toBe('2 hr')

    settings.setLocale('de')
    expect(time(wall)).toBe('23:05')
    expect(duration(785)).toMatch(/^13 Std\.,? 5 Min\.$/)
  })

  it('maps a date to the right month key', () => {
    expect(monthKeyFor(new Date('2026-01-15T12:00:00'))).toBe('Jan')
    expect(monthKeyFor(new Date('2026-09-15T12:00:00'))).toBe('Sep')
    expect(monthKeyFor(new Date('2026-12-31T12:00:00'))).toBe('Dec')
    expect(monthKeys).toHaveLength(12)
  })

  it('ships every English key in all twelve languages', () => {
    const expected = messagesOf(en).map(([path]) => path).sort()
    expect(localeList).toHaveLength(12)

    for (const locale of localeList) {
      const actual = messagesOf(messages[locale.code]).map(([path]) => path).sort()
      expect({ locale: locale.code, keys: actual }).toEqual({
        locale: locale.code,
        keys: expected,
      })
    }
  })

  it('leaves no translated string empty', () => {
    for (const locale of localeList) {
      for (const [path, texts] of messagesOf(messages[locale.code])) {
        for (const text of texts) {
          expect(`${locale.code} ${path}: ${text.trim().length > 0}`).toBe(`${locale.code} ${path}: true`)
        }
      }
    }
  })

  it('keeps every placeholder a translation needs, and invents none', () => {
    const english = new Map(messagesOf(en))
    for (const locale of localeList) {
      for (const [path, texts] of messagesOf(messages[locale.code])) {
        const source = english.get(path)!
        // Plural forms may spell the count out ("one", "two"), so a form can drop
        // {count} but never add a placeholder; plain strings must match exactly.
        const sourceSet = placeholders(source[source.length - 1]!)
        for (const text of texts) {
          const found = [...placeholders(text)].sort()
          const wanted = [...sourceSet].sort()
          const plural = source.length > 1
          const ok = plural
            ? found.every((name) => sourceSet.has(name))
            : found.join() === wanted.join()
          expect(`${locale.code} ${path} ${found.join()}`).toBe(
            ok ? `${locale.code} ${path} ${found.join()}` : `${locale.code} ${path} ${wanted.join()}`,
          )
        }
      }
    }
  })

  it('uses every plural form a language needs', () => {
    const { plural } = useI18n()
    const settings = useSettingsStore()

    settings.setLocale('ru')
    expect([1, 2, 5, 21, 22, 25].map((n) => plural('flights.resultCount', n))).toEqual([
      '1 рейс',
      '2 рейса',
      '5 рейсов',
      '21 рейс',
      '22 рейса',
      '25 рейсов',
    ])

    settings.setLocale('ar')
    expect([0, 1, 2, 3, 11, 100].map((n) => plural('search.travellers', n))).toEqual([
      '0 مسافر',
      'مسافر واحد',
      'مسافران',
      '3 مسافرين',
      '11 مسافرًا',
      '100 مسافر',
    ])

    settings.setLocale('zh')
    expect(plural('search.travellers', 1)).toBe('1 位旅客')
  })

  it('loads each language once and hands back the same bundle', async () => {
    const first = await loadLocale('ur')
    const again = await Promise.all([loadLocale('ur'), loadLocale('ur')])
    expect(again.every((bundle) => bundle === first)).toBe(true)
    expect(bundleFor('ur')).toBe(first)
  })

  it('marks Arabic and Urdu as right to left', () => {
    expect(localeList.filter((l) => l.dir === 'rtl').map((l) => l.code)).toEqual(['ar', 'ur'])
  })

  it('formats with each language’s own digits and conventions', () => {
    const { money, number } = useI18n()
    const settings = useSettingsStore()

    settings.setLocale('bn')
    expect(number(1394)).toBe('১,৩৯৪')
    settings.setLocale('ru')
    // Russian groups thousands with a no-break space (U+00A0 or U+202F, by ICU version).
    expect(number(1394)).toMatch(/^1[\u00a0\u202f]394$/)
    settings.setLocale('hi')
    expect(money(1394)).toBe('$1,394')
  })

  it('keeps prices whole inside right-to-left text', () => {
    const { money } = useI18n()
    const settings = useSettingsStore()

    // Left-to-right languages get Intl's output untouched.
    expect(money(1394)).toBe('$1,394')

    // In Arabic the symbol is held together in a left-to-right isolate and the
    // amount isolated from the text around it, so "US$" can't become "$US".
    settings.setLocale('ar')
    const price = money(1394)
    expect(price.startsWith('\u2068')).toBe(true)
    expect(price.endsWith('\u2069')).toBe(true)
    expect(price).toContain('\u2066US$\u2069')
    expect(price.replace(/[\u200e\u200f\u2066-\u2069]/g, '')).toBe('1,394\u00a0US$')
  })

  it('accepts only its own locale and currency codes', () => {
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      expect(isLocaleCode(name)).toBe(false)
      expect(isCurrencyCode(name)).toBe(false)
    }
    expect(isLocaleCode('ur')).toBe(true)
  })

  it('picks the closest supported language for a browser tag', () => {
    expect(resolveBrowserLocale('pt-PT')).toBe('pt')
    expect(resolveBrowserLocale('zh-Hans-CN')).toBe('zh')
    expect(resolveBrowserLocale('ar-EG')).toBe('ar')
    expect(resolveBrowserLocale('sw-KE')).toBe('en')
  })
})
