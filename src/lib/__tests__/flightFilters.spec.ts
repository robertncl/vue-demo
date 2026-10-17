import { describe, it, expect } from 'vitest'
import { applyFilters, defaultFilters, filtersActive } from '../flightFilters'
import { flightsOn } from '../flights'
import { wallHour } from '../dates'

const options = flightsOn('JFK', 'LIS', '2026-11-10', 'economy', '2026-10-17')
const price = (o: { fare: number }) => o.fare

describe('flight filters', () => {
  it('passes everything by default', () => {
    expect(filtersActive(defaultFilters())).toBe(false)
    expect(applyFilters(options, defaultFilters(), price)).toEqual(options)
  })

  it('filters by stops', () => {
    const nonstop = applyFilters(options, { ...defaultFilters(), stops: '0' }, price)
    expect(nonstop.length).toBeGreaterThan(0)
    expect(nonstop.every((o) => o.stops === 0)).toBe(true)
    expect(nonstop.length).toBeLessThan(options.length)
  })

  it('leaves out excluded airlines, on any leg', () => {
    const airline = options[0]!.airlines[0]!
    const kept = applyFilters(options, { ...defaultFilters(), excludedAirlines: [airline] }, price)
    expect(kept.every((o) => !o.airlines.includes(airline))).toBe(true)
  })

  it('caps the price using the total the page shows', () => {
    const cap = [...options].sort((a, b) => a.fare - b.fare)[2]!.fare
    const kept = applyFilters(options, { ...defaultFilters(), maxPrice: cap }, price)
    expect(kept.every((o) => o.fare <= cap)).toBe(true)
    expect(kept.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps departures inside the time window', () => {
    const kept = applyFilters(options, { ...defaultFilters(), departAfter: 12, departBefore: 18 }, price)
    expect(kept.every((o) => wallHour(o.departs) >= 12 && wallHour(o.departs) <= 18)).toBe(true)
  })

  it('caps the journey time', () => {
    const shortest = Math.min(...options.map((o) => o.durationMin))
    const kept = applyFilters(options, { ...defaultFilters(), maxDuration: shortest }, price)
    expect(kept.every((o) => o.durationMin === shortest)).toBe(true)
  })
})
