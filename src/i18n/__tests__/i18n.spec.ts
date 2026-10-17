import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18n, messages, monthKeyFor, monthKeys } from '../index'
import { useSettingsStore } from '@/stores/settings'
import { en } from '../messages.en'
import { localeList } from '../config'

/** Collects every dotted leaf path in a message bundle. */
function leafPaths(source: object, prefix = ''): string[] {
  return Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [path] : leafPaths(value as object, path)
  })
}

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

  it('ships every English key in all five languages', () => {
    const expected = leafPaths(en).sort()

    for (const locale of localeList) {
      const actual = leafPaths(messages[locale.code]).sort()
      expect({ locale: locale.code, keys: actual }).toEqual({
        locale: locale.code,
        keys: expected,
      })
    }
  })

  it('leaves no translated string empty', () => {
    for (const locale of localeList) {
      const bundle = messages[locale.code]
      for (const path of leafPaths(bundle)) {
        const value = path
          .split('.')
          .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)[part], bundle)
        expect(String(value).trim().length).toBeGreaterThan(0)
      }
    }
  })
})
