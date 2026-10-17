import { wallHour } from './dates'
import type { FlightOption, StopsFilter } from '@/types/flights'

export interface FlightFilters {
  stops: StopsFilter
  /** Airlines to leave out. Empty means every airline. */
  excludedAirlines: string[]
  /** Highest total price to show, in USD; null for no limit. */
  maxPrice: number | null
  /** Local hours, 0–24, the first departure must fall between. */
  departAfter: number
  departBefore: number
  /** Local hours, 0–24, the final arrival must fall between. */
  arriveAfter: number
  arriveBefore: number
  /** Longest total journey to show, in minutes; null for no limit. */
  maxDuration: number | null
}

export function defaultFilters(): FlightFilters {
  return {
    stops: 'any',
    excludedAirlines: [],
    maxPrice: null,
    departAfter: 0,
    departBefore: 24,
    arriveAfter: 0,
    arriveBefore: 24,
    maxDuration: null,
  }
}

export function stopsActive(filters: FlightFilters): boolean {
  return filters.stops !== 'any'
}

export function airlinesActive(filters: FlightFilters): boolean {
  return filters.excludedAirlines.length > 0
}

export function priceActive(filters: FlightFilters): boolean {
  return filters.maxPrice !== null
}

export function timesActive(filters: FlightFilters): boolean {
  return (
    filters.departAfter > 0 ||
    filters.departBefore < 24 ||
    filters.arriveAfter > 0 ||
    filters.arriveBefore < 24
  )
}

export function durationActive(filters: FlightFilters): boolean {
  return filters.maxDuration !== null
}

export function filtersActive(filters: FlightFilters): boolean {
  return (
    stopsActive(filters) ||
    airlinesActive(filters) ||
    priceActive(filters) ||
    timesActive(filters) ||
    durationActive(filters)
  )
}

function withinHours(wallMinutes: number, after: number, before: number): boolean {
  const hour = wallHour(wallMinutes)
  return hour >= after && hour <= before
}

/** Keeps the options that pass every filter. `priceOf` gives the total shown for an option. */
export function applyFilters(
  options: FlightOption[],
  filters: FlightFilters,
  priceOf: (option: FlightOption) => number,
): FlightOption[] {
  const maxStops = filters.stops === 'any' ? Infinity : Number(filters.stops)
  const excluded = new Set(filters.excludedAirlines)
  return options.filter(
    (option) =>
      option.stops <= maxStops &&
      option.airlines.every((code) => !excluded.has(code)) &&
      (filters.maxPrice === null || priceOf(option) <= filters.maxPrice) &&
      withinHours(option.departs, filters.departAfter, filters.departBefore) &&
      withinHours(option.arrives, filters.arriveAfter, filters.arriveBefore) &&
      (filters.maxDuration === null || option.durationMin <= filters.maxDuration),
  )
}
