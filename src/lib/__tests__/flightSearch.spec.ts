import { describe, it, expect } from 'vitest'
import {
  fromQuery,
  isFlightSearch,
  passengersValid,
  searchKey,
  searchProblems,
  toQuery,
} from '../flightSearch'
import type { FlightSearch } from '@/types/flights'

const TODAY = '2026-10-17'

const search: FlightSearch = {
  trip: 'round',
  from: 'LHR',
  to: 'KIX',
  depart: '2026-11-10',
  return: '2026-11-17',
  adults: 2,
  children: 1,
  infants: 1,
  cabin: 'business',
}

describe('flight search URLs', () => {
  it('round-trips a search through the query string', () => {
    expect(fromQuery(toQuery(search), TODAY)).toEqual({ draft: search, search, problems: [] })
  })

  it('leaves default counts out of the URL and reads them back', () => {
    const query = toQuery({ ...search, children: 0, infants: 0 })
    expect(query).not.toHaveProperty('children')
    expect(fromQuery(query, TODAY).search).toMatchObject({ children: 0, infants: 0 })
  })

  it('drops the return date from a one-way search', () => {
    const parsed = fromQuery({ ...toQuery(search), trip: 'oneway' }, TODAY)
    expect(parsed.search?.return).toBeUndefined()
    expect(parsed.problems).toEqual([])
  })

  it('accepts lower-case airport codes', () => {
    expect(fromQuery({ ...toQuery(search), from: 'lhr' }, TODAY).search?.from).toBe('LHR')
  })

  it('takes the first of repeated parameters', () => {
    expect(fromQuery({ ...toQuery(search), to: ['HND', 'KIX'] }, TODAY).search?.to).toBe('HND')
  })
})

describe('validation of untrusted input', () => {
  const parse = (overrides: Record<string, string>) =>
    fromQuery({ ...toQuery(search), ...overrides }, TODAY)

  it('rejects unknown airports, including markup', () => {
    expect(parse({ from: 'ZZZ' }).problems).toContain('from')
    expect(parse({ to: '<img src=x onerror=alert(1)>' }).problems).toContain('to')
    expect(parse({ to: '<img src=x onerror=alert(1)>' }).draft.to).toBeUndefined()
  })

  it('rejects the same airport at both ends', () => {
    expect(parse({ to: 'LHR' }).problems).toContain('same')
  })

  it('rejects impossible, malformed and out-of-window dates', () => {
    expect(parse({ depart: '2026-02-30' }).problems).toContain('depart')
    expect(parse({ depart: '10/11/2026' }).problems).toContain('depart')
    expect(parse({ depart: '2026-10-16' }).problems).toContain('depart')
    expect(parse({ depart: '2028-01-01' }).problems).toContain('depart')
    expect(parse({ return: '2026-11-09' }).problems).toContain('return')
  })

  it('reads counts as plain digits only', () => {
    expect(parse({ adults: '1e3' }).problems).toContain('passengers')
    expect(parse({ adults: '0x2' }).problems).toContain('passengers')
    expect(parse({ adults: ' 2' }).problems).toContain('passengers')
    expect(parse({ adults: '-1' }).problems).toContain('passengers')
  })

  it('falls back to defaults for an unknown cabin or trip type', () => {
    const parsed = parse({ cabin: 'cargo', trip: 'multi' })
    expect(parsed.search).toMatchObject({ cabin: 'economy', trip: 'round' })
  })

  it('applies the passenger rules', () => {
    expect(passengersValid({ adults: 1, children: 0, infants: 0 })).toBe(true)
    expect(passengersValid({ adults: 0, children: 2, infants: 0 })).toBe(false)
    expect(passengersValid({ adults: 1, children: 0, infants: 2 })).toBe(false)
    expect(passengersValid({ adults: 5, children: 4, infants: 1 })).toBe(false)
    expect(passengersValid({ adults: 1.5, children: 0, infants: 0 })).toBe(false)
  })

  it('lists every problem with an empty search', () => {
    expect(searchProblems({ trip: 'round' }, TODAY)).toEqual([
      'from',
      'to',
      'depart',
      'return',
      'passengers',
    ])
  })
})

describe('stored searches', () => {
  it('accepts a well-formed search and rejects anything else', () => {
    expect(isFlightSearch(search)).toBe(true)
    expect(isFlightSearch(null)).toBe(false)
    expect(isFlightSearch('LHR')).toBe(false)
    expect(isFlightSearch({ ...search, from: 'ZZZ' })).toBe(false)
    expect(isFlightSearch({ ...search, return: '2026-11-01' })).toBe(false)
    expect(isFlightSearch({ ...search, adults: '2' })).toBe(false)
  })

  it('keys searches by everything that changes the price', () => {
    expect(searchKey(search)).toBe(searchKey({ ...search }))
    expect(searchKey(search)).not.toBe(searchKey({ ...search, cabin: 'economy' }))
    expect(searchKey(search)).not.toBe(searchKey({ ...search, children: 0 }))
  })
})
