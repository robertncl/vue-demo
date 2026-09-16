import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../settings'

describe('Settings Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults to English and USD', () => {
    const settings = useSettingsStore()
    expect(settings.locale).toBe('en')
    expect(settings.currency).toBe('USD')
    expect(settings.activeCurrency.rate).toBe(1)
  })

  it('exposes the full list of languages and currencies', () => {
    const settings = useSettingsStore()
    expect(settings.locales.map((l) => l.code)).toEqual(['en', 'es', 'fr', 'de', 'ja'])
    expect(settings.currencies.map((c) => c.code)).toEqual([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'AUD',
      'CAD',
    ])
  })

  it('converts to and from the USD base currency', () => {
    const settings = useSettingsStore()

    settings.setCurrency('EUR')
    expect(settings.fromBase(100)).toBeCloseTo(92, 6)
    expect(settings.toBase(92)).toBeCloseTo(100, 6)

    settings.setCurrency('JPY')
    expect(settings.fromBase(10)).toBeCloseTo(1560, 6)
  })

  it('round-trips a value through a conversion without drift', () => {
    const settings = useSettingsStore()
    settings.setCurrency('GBP')
    expect(settings.toBase(settings.fromBase(1234))).toBeCloseTo(1234, 6)
  })

  it('persists the language and currency choice', () => {
    const settings = useSettingsStore()

    settings.setLocale('ja')
    settings.setCurrency('AUD')

    expect(localStorage.getItem('wanderlog-locale')).toBe('ja')
    expect(localStorage.getItem('wanderlog-currency')).toBe('AUD')
  })

  it('restores a persisted choice on the next session', () => {
    localStorage.setItem('wanderlog-locale', 'de')
    localStorage.setItem('wanderlog-currency', 'CAD')
    setActivePinia(createPinia())

    const settings = useSettingsStore()
    expect(settings.locale).toBe('de')
    expect(settings.currency).toBe('CAD')
  })

  it('ignores an unsupported stored value', () => {
    localStorage.setItem('wanderlog-locale', 'klingon')
    localStorage.setItem('wanderlog-currency', 'DOGE')
    setActivePinia(createPinia())

    const settings = useSettingsStore()
    expect(settings.locale).toBe('en')
    expect(settings.currency).toBe('USD')
  })

  it('sets the document language when the locale changes', () => {
    const settings = useSettingsStore()
    settings.setLocale('fr')
    expect(document.documentElement.lang).toBe('fr')
  })
})
