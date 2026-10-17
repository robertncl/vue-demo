import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { useFlightsStore } from '../flights'
import { useSettingsStore } from '../settings'
import { cheapestTotal } from '@/lib/flights'
import type { FlightSearch } from '@/types/flights'

const TODAY = '2026-10-17'

const search: FlightSearch = {
  trip: 'round',
  from: 'LHR',
  to: 'KIX',
  depart: '2026-11-10',
  return: '2026-11-17',
  adults: 1,
  children: 0,
  infants: 0,
  cabin: 'economy',
}

function store() {
  const flights = useFlightsStore()
  flights.today = TODAY
  return flights
}

describe('Flights Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('guesses a home airport from the language until you search', () => {
    const flights = store()
    const settings = useSettingsStore()
    expect(flights.homeAirport).toBe('JFK')
    settings.setLocale('ja')
    expect(flights.homeAirport).toBe('HND')

    flights.remember(search)
    expect(flights.homeAirport).toBe('LHR')
  })

  it('tracks a search at today’s cheapest price, once', () => {
    const flights = store()
    flights.track(search)
    flights.track({ ...search })

    expect(flights.tracked).toHaveLength(1)
    expect(flights.tracked[0]).toMatchObject({
      trackedOn: TODAY,
      priceAtTrack: cheapestTotal(search, TODAY),
    })
    expect(flights.isTracked(search)).toBe(true)
    expect(flights.isTracked({ ...search, cabin: 'business' })).toBe(false)
  })

  it('toggles tracking off again', () => {
    const flights = store()
    flights.toggleTracked(search)
    flights.toggleTracked(search)
    expect(flights.tracked).toHaveLength(0)
  })

  it('orders tracked searches by departure', () => {
    const flights = store()
    flights.track({ ...search, depart: '2026-12-01', return: '2026-12-08' })
    flights.track(search)
    expect(flights.trackedByDeparture.map((t) => t.search.depart)).toEqual(['2026-11-10', '2026-12-01'])
  })

  it('persists tracked and last searches to localStorage', async () => {
    const flights = store()
    flights.track(search)
    flights.remember(search)
    await nextTick()

    setActivePinia(createPinia())
    const reloaded = store()
    expect(reloaded.tracked).toHaveLength(1)
    expect(reloaded.lastSearch).toEqual(search)
  })

  it('ignores malformed or tampered storage', () => {
    localStorage.setItem(
      'wanderlog-tracked-flights',
      JSON.stringify([
        { id: 'ok', search, trackedOn: TODAY, priceAtTrack: 900 },
        { id: 'bad-airport', search: { ...search, to: '<script>' }, trackedOn: TODAY, priceAtTrack: 1 },
        { id: 'bad-price', search, trackedOn: TODAY, priceAtTrack: 'free' },
        'junk',
      ]),
    )
    localStorage.setItem('wanderlog-last-search', '{not json')

    const flights = store()
    expect(flights.tracked.map((t) => t.id)).toEqual(['ok'])
    expect(flights.lastSearch).toBeNull()
  })

  it('ignores a non-array tracked list', () => {
    localStorage.setItem('wanderlog-tracked-flights', JSON.stringify({ length: 3 }))
    expect(store().tracked).toEqual([])
  })
})
