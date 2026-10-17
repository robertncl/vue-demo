import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'
import { useSettingsStore } from '@/stores/settings'
import { useFlightsStore } from '@/stores/flights'
import { localeList, currencyList } from '@/i18n/config'
import { flightsOn } from '@/lib/flights'

const TODAY = '2026-10-17'
const search = 'trip=round&from=LHR&to=KIX&depart=2026-11-10&return=2026-11-17&adults=2&children=1&infants=1&cabin=economy'

/** A booking link for real flights on the search above. */
function bookingPath() {
  const out = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)[0]!
  const ret = flightsOn('KIX', 'LHR', '2026-11-17', 'economy', TODAY)[0]!
  return `/flights/booking?${search}&out=${encodeURIComponent(out.id)}&ret=${encodeURIComponent(ret.id)}`
}

const routes = [
  '/',
  `/flights?${search}`,
  `/flights?${search}&out=${encodeURIComponent(flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)[0]!.id)}`,
  bookingPath(),
  '/flights?from=XXX&to=LHR&depart=2020-01-01',
  '/explore',
  '/tracked',
  '/destinations',
  '/destinations/kyoto',
  '/wishlist',
  '/trips',
  '/about',
]

/**
 * Catches a dotted i18n key that reached the DOM because a string was missing.
 * Keys always continue in lower case, which tells a leaked "trips.noTrips" from
 * two sentences that happen to meet at a full stop ("…your trips.No trip…").
 */
const RAW_KEY =
  /\b(?:nav|home|topPick|destinations|detail|wishlist|trips|planner|about|notFound|common|settings|card|footer|brand|search|flights|filters|dates|graph|insights|booking|explore|deals|tracked)\.[a-z][a-zA-Z0-9_]*\b/

describe('localisation', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders every route in every language without leaking raw keys', async () => {
    for (const locale of localeList) {
      const pinia = createPinia()
      setActivePinia(pinia)
      const settings = useSettingsStore()
      settings.setLocale(locale.code)
      const flights = useFlightsStore()
      flights.today = TODAY
      // Something to show on the tracked page.
      flights.track({
        trip: 'round',
        from: 'LHR',
        to: 'KIX',
        depart: '2026-11-10',
        return: '2026-11-17',
        adults: 1,
        children: 0,
        infants: 0,
        cabin: 'economy',
      })

      const wrapper = mount(App, { global: { plugins: [router, pinia] } })

      for (const path of routes) {
        await router.push(path)
        await flushPromises()

        const text = wrapper.text()
        expect(text.length).toBeGreaterThan(50)
        expect(`${locale.code} ${path}: ${text.match(RAW_KEY)?.[0] ?? 'clean'}`).toContain('clean')
      }

      wrapper.unmount()
    }
  })

  it('renders prices in every currency on the destination list', async () => {
    for (const currency of currencyList) {
      const pinia = createPinia()
      setActivePinia(pinia)
      const settings = useSettingsStore()
      settings.setCurrency(currency.code)

      const wrapper = mount(App, { global: { plugins: [router, pinia] } })
      await router.push('/destinations')
      await flushPromises()

      const prices = wrapper.findAll('.price').map((p) => p.text())
      expect(prices).toHaveLength(12)
      prices.forEach((price) => expect(price).toMatch(/\d/))

      wrapper.unmount()
    }
  })

  it('keeps the top pick and its month name in sync with the language', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const settings = useSettingsStore()

    const wrapper = mount(App, { global: { plugins: [router, pinia] } })
    await router.push('/')
    await flushPromises()

    expect(wrapper.find('.top-pick').text()).toMatch(/Top pick for \w+/)

    settings.setLocale('de')
    await flushPromises()
    expect(wrapper.find('.top-pick').text()).toMatch(/Top-Tipp für \w+/)

    wrapper.unmount()
  })
})
