import { describe, it, expect } from 'vitest'
import {
  addDays,
  daysBetween,
  daysInMonth,
  isIsoDate,
  startOfMonth,
  wallClock,
  wallDate,
  weekday,
} from '../dates'
import { niceMax } from '../chart'

describe('dates', () => {
  it('validates ISO dates strictly', () => {
    expect(isIsoDate('2026-10-17')).toBe(true)
    expect(isIsoDate('2028-02-29')).toBe(true)
    expect(isIsoDate('2026-02-29')).toBe(false)
    expect(isIsoDate('2026-13-01')).toBe(false)
    expect(isIsoDate('2026-1-01')).toBe(false)
    expect(isIsoDate(20261017)).toBe(false)
  })

  it('does day arithmetic across month, year and DST boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
    expect(daysBetween('2026-10-17', '2026-11-17')).toBe(31)
    expect(daysBetween('2026-11-17', '2026-10-17')).toBe(-31)
  })

  it('knows weekdays and month lengths', () => {
    expect(weekday('2026-10-16')).toBe(5)
    expect(startOfMonth('2026-10-17', 3)).toBe('2027-01-01')
    expect(daysInMonth('2028-02-10')).toBe(29)
  })

  it('reads wall minutes as a local date and clock time', () => {
    const wall = (Date.UTC(2026, 10, 10) / 60_000) + 23 * 60 + 5
    expect(wallDate(wall)).toBe('2026-11-10')
    expect(wallClock(wall)).toBe('23:05')
  })
})

describe('niceMax', () => {
  it('rounds a maximum up to a clean value', () => {
    expect(niceMax(1394)).toBe(1500)
    expect(niceMax(1501)).toBe(2000)
    expect(niceMax(5100)).toBe(6000)
    expect(niceMax(87)).toBe(100)
    expect(niceMax(0)).toBe(1)
  })
})
