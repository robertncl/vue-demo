import { airportForDestination } from '@/data/airports'
import { destinations } from '@/data/destinations'
import { addDays, daysInMonth, startOfMonth, weekday } from './dates'
import { cheapestTotal, flightsOn } from './flights'
import type { FlightOption, FlightSearch } from '@/types/flights'
import type { Destination } from '@/types/travel'

export interface Deal {
  destination: Destination
  search: FlightSearch
  total: number
  /** The cheapest outbound flight on the deal's dates, for its stops and duration. */
  outbound: FlightOption
}

function roundTrip(from: string, to: string, depart: string, nights: number): FlightSearch {
  return {
    trip: 'round',
    from,
    to,
    depart,
    return: addDays(depart, nights),
    adults: 1,
    children: 0,
    infants: 0,
    cabin: 'economy',
  }
}

/** The cheapest economy round trip for one adult among the given departure dates. */
export function cheapestTrip(
  destination: Destination,
  from: string,
  departs: string[],
  nights: number,
  observed: string,
): Deal | null {
  const airport = airportForDestination(destination.slug)
  if (!airport || airport.code === from) return null

  let best: { search: FlightSearch; total: number } | null = null
  for (const depart of departs) {
    if (depart <= observed) continue
    const search = roundTrip(from, airport.code, depart, nights)
    const total = cheapestTotal(search, observed)
    if (total !== null && (!best || total < best.total)) best = { search, total }
  }
  if (!best) return null

  const outbound = flightsOn(from, airport.code, best.search.depart, 'economy', observed).reduce(
    (cheapest, option) => (option.fare < cheapest.fare ? option : cheapest),
  )
  return { destination, ...best, outbound }
}

/** Every catalog destination's best deal, cheapest first. */
export function dealsFrom(
  from: string,
  departs: string[],
  nights: number,
  observed: string,
): Deal[] {
  return destinations
    .map((destination) => cheapestTrip(destination, from, departs, nights, observed))
    .filter((deal): deal is Deal => deal !== null)
    .sort((a, b) => a.total - b.total)
}

/** Departures every `step` days between `from` and `from + days`. */
export function departureWindow(from: string, days: number, step: number): string[] {
  return Array.from({ length: Math.floor(days / step) + 1 }, (_, i) => addDays(from, i * step))
}

export type TripLength = 'weekend' | 'week' | 'fortnight'

export const tripLengths: TripLength[] = ['weekend', 'week', 'fortnight']

export const NIGHTS: Record<TripLength, number> = { weekend: 2, week: 7, fortnight: 14 }

/**
 * Candidate departures in a month: every Friday for a weekend away, every
 * other day otherwise.
 */
export function departuresInMonth(monthStart: string, length: TripLength): string[] {
  const days = Array.from({ length: daysInMonth(monthStart) }, (_, i) => addDays(monthStart, i))
  return length === 'weekend' ? days.filter((day) => weekday(day) === 5) : days.filter((_, i) => i % 2 === 0)
}

/** The first day of each of the next `count` months, starting with this one. */
export function upcomingMonths(today: string, count = 6): string[] {
  return Array.from({ length: count }, (_, i) => startOfMonth(today, i))
}
