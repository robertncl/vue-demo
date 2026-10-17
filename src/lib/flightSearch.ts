/**
 * A flight search lives in the URL, so results can be shared, bookmarked and
 * navigated with Back. Everything read from a query string is untrusted and is
 * validated here before the engine sees it.
 */
import { isAirportCode } from '@/data/airports'
import { addDays, daysBetween, isIsoDate } from './dates'
import type { Cabin, FlightSearch, Passengers, TripType } from '@/types/flights'

export const cabins: Cabin[] = ['economy', 'premium', 'business', 'first']
export const tripTypes: TripType[] = ['round', 'oneway']

/** Most airlines cap a single booking at nine seated travellers. */
export const MAX_PASSENGERS = 9

/** Schedules are loaded roughly eleven months ahead. */
export const BOOKING_HORIZON_DAYS = 330

export function isCabin(value: unknown): value is Cabin {
  return typeof value === 'string' && (cabins as string[]).includes(value)
}

export function isTripType(value: unknown): value is TripType {
  return typeof value === 'string' && (tripTypes as string[]).includes(value)
}

/** At least one adult, no more than nine people, and a lap for every infant. */
export function passengersValid({ adults, children, infants }: Passengers): boolean {
  return (
    [adults, children, infants].every((n) => Number.isInteger(n) && n >= 0) &&
    adults >= 1 &&
    adults + children + infants <= MAX_PASSENGERS &&
    infants <= adults
  )
}

export function travellerCount({ adults, children, infants }: Passengers): number {
  return adults + children + infants
}

export function defaultSearch(from: string, to: string, today: string): FlightSearch {
  return {
    trip: 'round',
    from,
    to,
    depart: addDays(today, 21),
    return: addDays(today, 28),
    adults: 1,
    children: 0,
    infants: 0,
    cabin: 'economy',
  }
}

export type SearchProblem = 'from' | 'to' | 'same' | 'depart' | 'return' | 'passengers'

/** Everything wrong with a search, in the order the form shows the fields. */
export function searchProblems(search: Partial<FlightSearch>, today: string): SearchProblem[] {
  const problems: SearchProblem[] = []
  if (!isAirportCode(search.from)) problems.push('from')
  if (!isAirportCode(search.to)) problems.push('to')
  if (search.from && search.from === search.to) problems.push('same')

  const inWindow = (date: unknown): date is string =>
    isIsoDate(date) &&
    daysBetween(today, date) >= 0 &&
    daysBetween(today, date) <= BOOKING_HORIZON_DAYS
  if (!inWindow(search.depart)) problems.push('depart')
  if (
    search.trip === 'round' &&
    (!inWindow(search.return) || (isIsoDate(search.depart) && search.return! < search.depart))
  ) {
    problems.push('return')
  }

  const passengers = {
    adults: search.adults ?? NaN,
    children: search.children ?? NaN,
    infants: search.infants ?? NaN,
  }
  if (!passengersValid(passengers)) problems.push('passengers')
  return problems
}

/** Serialises a search into the query string the results page reads. */
export function toQuery(search: FlightSearch): Record<string, string> {
  const query: Record<string, string> = {
    trip: search.trip,
    from: search.from,
    to: search.to,
    depart: search.depart,
    adults: String(search.adults),
    cabin: search.cabin,
  }
  if (search.trip === 'round' && search.return) query.return = search.return
  if (search.children) query.children = String(search.children)
  if (search.infants) query.infants = String(search.infants)
  return query
}

type QueryValue = string | null | (string | null)[] | undefined

function single(value: QueryValue): string | undefined {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first : undefined
}

/** Only plain digit strings count; "1e3", "0x9" and " 2" are rejected. */
function count(value: QueryValue, fallback: number): number {
  const text = single(value)
  if (text === undefined) return fallback
  return /^\d{1,2}$/.test(text) ? Number(text) : NaN
}

export interface ParsedSearch {
  /** Every field that could be read, valid or not — enough to refill the form. */
  draft: Partial<FlightSearch>
  /** Present only when the whole search is valid. */
  search: FlightSearch | null
  problems: SearchProblem[]
}

export function fromQuery(query: Record<string, QueryValue>, today: string): ParsedSearch {
  const trip = single(query.trip)
  const cabin = single(query.cabin)
  const from = single(query.from)?.toUpperCase()
  const to = single(query.to)?.toUpperCase()
  const draft: Partial<FlightSearch> = {
    trip: isTripType(trip) ? trip : 'round',
    from: isAirportCode(from) ? from : undefined,
    to: isAirportCode(to) ? to : undefined,
    depart: isIsoDate(single(query.depart)) ? single(query.depart) : undefined,
    return: isIsoDate(single(query.return)) ? single(query.return) : undefined,
    adults: count(query.adults, 1),
    children: count(query.children, 0),
    infants: count(query.infants, 0),
    cabin: isCabin(cabin) ? cabin : 'economy',
  }
  if (draft.trip === 'oneway') delete draft.return

  const problems = searchProblems(draft, today)
  return { draft, problems, search: problems.length ? null : (draft as FlightSearch) }
}

/** A stable identity for a search, used to tell tracked searches apart. */
export function searchKey(search: FlightSearch): string {
  return [
    search.trip,
    search.from,
    search.to,
    search.depart,
    search.trip === 'round' ? search.return : '',
    search.adults,
    search.children,
    search.infants,
    search.cabin,
  ].join('|')
}

/** Shape check for a search read back from storage, which may be stale or edited. */
export function isFlightSearch(value: unknown): value is FlightSearch {
  if (typeof value !== 'object' || value === null) return false
  const search = value as Record<string, unknown>
  return (
    isTripType(search.trip) &&
    isCabin(search.cabin) &&
    isAirportCode(search.from) &&
    isAirportCode(search.to) &&
    search.from !== search.to &&
    isIsoDate(search.depart) &&
    (search.trip === 'oneway' || (isIsoDate(search.return) && search.return >= search.depart)) &&
    passengersValid({
      adults: search.adults as number,
      children: search.children as number,
      infants: search.infants as number,
    })
  )
}
