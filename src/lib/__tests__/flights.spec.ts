import { describe, it, expect } from 'vitest'
import { airports } from '@/data/airports'
import { findAirline } from '@/data/airlines'
import {
  bookingFactor,
  cheapestTotal,
  dateGrid,
  fareBreakdown,
  findFlight,
  flightsOn,
  legMinutes,
  priceCalendar,
  priceHistory,
  priceInsight,
  routesBetween,
  sortOptions,
  tripTotal,
} from '../flights'
import { addDays } from '../dates'
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

describe('route network', () => {
  it('reaches every catalog destination from every hub', () => {
    const hubs = airports.filter((a) => a.hub)
    const destinations = airports.filter((a) => a.destination)
    for (const hub of hubs) {
      for (const destination of destinations) {
        if (hub.code === destination.code) continue
        expect(`${hub.code}-${destination.code}: ${routesBetween(hub.code, destination.code).length > 0}`).toBe(
          `${hub.code}-${destination.code}: true`,
        )
      }
    }
  })

  it('connects only at hubs and only through airlines that fly each leg', () => {
    for (const route of routesBetween('JFK', 'ZQN')) {
      route.legs.forEach((leg, i) => {
        const airline = findAirline(leg.airline)!
        expect(airline.hubs.includes(leg.from) || airline.hubs.includes(leg.to)).toBe(true)
        if (i > 0) expect(airports.find((a) => a.code === leg.from)!.hub).toBe(true)
      })
    }
  })

  it('offers a nonstop on short routes with a hub at one end', () => {
    const options = flightsOn('MAD', 'RAK', '2026-11-10', 'economy', TODAY)
    expect(options.some((o) => o.stops === 0)).toBe(true)
  })
})

describe('flightsOn', () => {
  it('is deterministic: the same search returns the same flights', () => {
    const a = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)
    const b = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)
    expect(a.length).toBeGreaterThan(3)
    expect(a.map((o) => [o.id, o.fare])).toEqual(b.map((o) => [o.id, o.fare]))
  })

  it('keeps a schedule’s id and departure time from one day to the next', () => {
    const monday = flightsOn('JFK', 'LIS', '2026-11-09', 'economy', TODAY)
    const tuesday = flightsOn('JFK', 'LIS', '2026-11-10', 'economy', TODAY)
    const shared = monday.find((o) => tuesday.some((t) => t.id === o.id))!
    const next = tuesday.find((t) => t.id === shared.id)!
    expect(next.departs - shared.departs).toBe(1440)
  })

  it('builds consistent itineraries', () => {
    for (const option of flightsOn('LHR', 'ZQN', '2026-11-10', 'business', TODAY)) {
      expect(option.segments[0]!.from).toBe('LHR')
      expect(option.segments[option.segments.length - 1]!.to).toBe('ZQN')
      expect(option.stops).toBe(option.segments.length - 1)
      expect(option.layovers).toHaveLength(option.stops)
      option.segments.forEach((segment, i) => {
        expect(segment.durationMin).toBe(legMinutes(segment.distanceKm))
        if (i > 0) expect(segment.from).toBe(option.segments[i - 1]!.to)
      })
      const flying = option.segments.reduce((sum, s) => sum + s.durationMin, 0)
      const waiting = option.layovers.reduce((sum, l) => sum + l.durationMin, 0)
      expect(option.durationMin).toBe(flying + waiting)
      expect(option.layovers.every((l) => l.durationMin >= 55)).toBe(true)
    }
  })

  it('sells nothing before the day you are looking', () => {
    expect(flightsOn('LHR', 'KIX', '2026-10-16', 'economy', TODAY)).toEqual([])
  })

  it('returns nothing for unknown or identical airports', () => {
    expect(flightsOn('LHR', 'LHR', '2026-11-10', 'economy', TODAY)).toEqual([])
    expect(flightsOn('LHR', 'ZZZ', '2026-11-10', 'economy', TODAY)).toEqual([])
  })

  it('prices premium cabins above economy', () => {
    const cheapest = (cabin: 'economy' | 'business' | 'first') =>
      Math.min(...flightsOn('LHR', 'KIX', '2026-11-10', cabin, TODAY).map((o) => o.fare))
    expect(cheapest('business')).toBeGreaterThan(cheapest('economy') * 3)
    expect(cheapest('first')).toBeGreaterThan(cheapest('business'))
  })

  it('finds a flight again by its id', () => {
    const option = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)[2]!
    expect(findFlight('LHR', 'KIX', '2026-11-10', 'economy', TODAY, option.id)).toEqual(option)
    expect(findFlight('LHR', 'KIX', '2026-11-10', 'economy', TODAY, 'nope')).toBeUndefined()
  })
})

describe('fares', () => {
  it('follows the booking curve: dear at the last minute, flat in the sweet spot', () => {
    expect(bookingFactor(0)).toBeGreaterThan(bookingFactor(14))
    expect(bookingFactor(14)).toBeGreaterThan(bookingFactor(30))
    expect(bookingFactor(30)).toBe(bookingFactor(90))
    expect(bookingFactor(200)).toBeGreaterThan(bookingFactor(90))
  })

  it('itemises every kind of traveller and adds up exactly', () => {
    const breakdown = fareBreakdown([500, 400], { adults: 2, children: 1, infants: 1 })
    const adultFare = 900 * 0.94
    expect(breakdown.adults).toBe(Math.round(adultFare * 2))
    expect(breakdown.children).toBe(Math.round(adultFare * 0.75))
    expect(breakdown.infants).toBe(Math.round(adultFare * 0.1))
    expect(breakdown.total).toBe(breakdown.adults + breakdown.children + breakdown.infants)
    expect(tripTotal([500, 400], { adults: 2, children: 1, infants: 1 })).toBe(breakdown.total)
  })

  it('discounts round trips only', () => {
    expect(tripTotal([500], { adults: 1, children: 0, infants: 0 })).toBe(500)
    expect(tripTotal([500, 500], { adults: 1, children: 0, infants: 0 })).toBe(940)
  })

  it('totals a round trip from the cheapest flight each way', () => {
    const out = Math.min(...flightsOn('LHR', 'KIX', search.depart, 'economy', TODAY).map((o) => o.fare))
    const back = Math.min(...flightsOn('KIX', 'LHR', search.return!, 'economy', TODAY).map((o) => o.fare))
    expect(cheapestTotal(search, TODAY)).toBe(tripTotal([out, back], search))
    expect(cheapestTotal({ ...search, trip: 'oneway', return: undefined }, TODAY)).toBe(out)
  })
})

describe('date tools', () => {
  it('prices a calendar of departures at a fixed trip length', () => {
    const dates = [search.depart, addDays(search.depart, 1)]
    const calendar = priceCalendar(search, dates, TODAY)
    expect(calendar[1]!.total).toBe(
      cheapestTotal(search, TODAY, dates[1], addDays(search.return!, 1)),
    )
  })

  it('lays out a 7 × 7 date grid with no returns before departure', () => {
    const grid = dateGrid({ ...search, return: '2026-11-12' }, TODAY)
    expect(grid).toHaveLength(7)
    expect(grid.every((row) => row.length === 7)).toBe(true)
    for (const cell of grid.flat()) {
      if (cell.ret < cell.depart) expect(cell.total).toBeNull()
      else expect(cell.total).toBeGreaterThan(0)
    }
    expect(grid[3]![3]).toMatchObject({ depart: '2026-11-10', ret: '2026-11-12' })
  })

  it('judges today’s price against the typical range', () => {
    const insight = priceInsight(search, TODAY)!
    expect(insight.low).toBeLessThanOrEqual(insight.high)
    expect(insight.current).toBe(cheapestTotal(search, TODAY))
    const expected =
      insight.current < insight.low ? 'low' : insight.current > insight.high ? 'high' : 'typical'
    expect(insight.level).toBe(expected)
  })

  it('reconstructs the last 30 days of prices, ending today', () => {
    const history = priceHistory(search, TODAY)
    expect(history).toHaveLength(30)
    expect(history[history.length - 1]).toEqual({ date: TODAY, total: cheapestTotal(search, TODAY) })
    expect(history[0]!.date).toBe(addDays(TODAY, -29))
  })
})

describe('sortOptions', () => {
  const options = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)

  it('sorts cheapest and fastest', () => {
    const cheapest = sortOptions(options, 'cheapest').map((o) => o.fare)
    expect(cheapest).toEqual([...cheapest].sort((a, b) => a - b))
    const fastest = sortOptions(options, 'fastest').map((o) => o.durationMin)
    expect(fastest).toEqual([...fastest].sort((a, b) => a - b))
  })

  it('puts a flight that is both cheapest and fastest first for "best"', () => {
    const [a, b] = options
    const dominant = { ...a!, fare: 1, durationMin: 60, stops: 0 }
    const best = sortOptions([b!, dominant], 'best')
    expect(best[0]).toBe(dominant)
  })

  it('does not reorder its input', () => {
    const before = options.map((o) => o.id)
    sortOptions(options, 'cheapest')
    expect(options.map((o) => o.id)).toEqual(before)
  })
})
