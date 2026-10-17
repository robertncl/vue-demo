/**
 * The flight engine. There is no backend, so schedules and fares are
 * generated — deterministically, from seeded randomness — out of the airline
 * network in src/data. The same search always returns the same flights, and a
 * fare depends on the route, the day, the cabin and how far ahead you look, so
 * the date grid, price graph and price history all tell a consistent story.
 */
import { airports, findAirport } from '@/data/airports'
import { airlines, findAirline } from '@/data/airlines'
import { destinations } from '@/data/destinations'
import { addDays, daysBetween, monthOf, toEpochDay, weekday } from './dates'
import { between, seeded } from './random'
import type {
  Airport,
  Cabin,
  FlightOption,
  FlightSearch,
  FlightSegment,
  Layover,
  Passengers,
  PriceInsight,
  SortMode,
} from '@/types/flights'
import type { MonthKey } from '@/types/travel'

/* --------------------------------------------------------------------------
   Geography and the route network
   -------------------------------------------------------------------------- */

const EARTH_RADIUS_KM = 6371

export function distanceKm(a: Airport, b: Airport): number {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

function airport(code: string): Airport {
  const found = findAirport(code)
  if (!found) throw new Error(`Unknown airport ${code}`)
  return found
}

const distanceCache = new Map<string, number>()

/** Memoised: the route search asks for the same pairs thousands of times. */
function distanceBetween(from: string, to: string): number {
  const key = from < to ? `${from}${to}` : `${to}${from}`
  let distance = distanceCache.get(key)
  if (distance === undefined) {
    distance = distanceKm(airport(from), airport(to))
    distanceCache.set(key, distance)
  }
  return distance
}

interface Leg {
  airline: string
  from: string
  to: string
  distanceKm: number
}

/** Can `airlineCode` fly between its hub and `other`? */
function serves(airlineCode: string, hub: string, other: string): boolean {
  const airline = findAirline(airlineCode)!
  if (hub === other) return false
  const distance = distanceBetween(hub, other)
  if (airline.lowCost) return distance <= 3500
  if (distance > 15500) return false
  const target = airport(other)
  return distance <= 5000 || target.hub || (target.longHaulFrom?.includes(hub) ?? false)
}

let network: Map<string, Leg[]> | null = null
let pairs: Map<string, Leg[]> | null = null

/** Every leg any airline flies, keyed by departure airport. Built once. */
function legsFrom(code: string): Leg[] {
  if (!network) {
    network = new Map()
    pairs = new Map()
    const seen = new Set<string>()
    const add = (leg: Leg) => {
      const key = `${leg.airline}${leg.from}${leg.to}`
      if (seen.has(key)) return
      seen.add(key)
      network!.set(leg.from, [...(network!.get(leg.from) ?? []), leg])
      const pair = `${leg.from}-${leg.to}`
      pairs!.set(pair, [...(pairs!.get(pair) ?? []), leg])
    }
    for (const airline of airlines) {
      for (const hub of airline.hubs) {
        for (const other of airports) {
          if (!serves(airline.code, hub, other.code)) continue
          const distance = distanceBetween(hub, other.code)
          add({ airline: airline.code, from: hub, to: other.code, distanceKm: distance })
          add({ airline: airline.code, from: other.code, to: hub, distanceKm: distance })
        }
      }
    }
  }
  return network.get(code) ?? []
}

/** Every leg between two airports, by any airline. */
function legsBetween(from: string, to: string): Leg[] {
  legsFrom(from)
  return pairs!.get(`${from}-${to}`) ?? []
}

/** How much longer than the great-circle distance an itinerary may fly, by stops. */
const MAX_DETOUR = [Infinity, 1.45, 1.75]

interface Route {
  key: string
  legs: Leg[]
  /** Which of a nonstop's daily departures this is, from 0. */
  slot: number
  slots: number
}

const routeCache = new Map<string, Route[]>()

/**
 * The itineraries between two airports: every nonstop, the sensible one-stop
 * connections through hubs, and two-stop ones only when little else exists.
 */
export function routesBetween(from: string, to: string): Route[] {
  const cacheKey = `${from}-${to}`
  const cached = routeCache.get(cacheKey)
  if (cached) return cached

  const direct = distanceBetween(from, to)
  const found: Leg[][] = []

  const visited = new Set([from])

  function walk(at: string, path: Leg[], travelled: number) {
    // The last leg must land at the destination, so only those legs are worth looking at.
    const candidates = path.length === 2 ? legsBetween(at, to) : legsFrom(at)
    for (const leg of candidates) {
      if (visited.has(leg.to)) continue
      // Low-cost carriers sell point to point only.
      if (findAirline(leg.airline)!.lowCost && (path.length > 0 || leg.to !== to)) continue
      const next = travelled + leg.distanceKm
      if (leg.to === to) {
        if (next <= direct * MAX_DETOUR[path.length]!) found.push([...path, leg])
        continue
      }
      if (!airport(leg.to).hub) continue
      if (next + distanceBetween(leg.to, to) > direct * MAX_DETOUR[2]!) continue
      visited.add(leg.to)
      walk(leg.to, [...path, leg], next)
      visited.delete(leg.to)
    }
  }
  walk(from, [], 0)

  // Keep at most two airline combinations per airport sequence, preferring
  // single-airline itineraries, then cheaper carriers.
  const airlineChanges = (legs: Leg[]) =>
    legs.filter((leg, i) => i > 0 && leg.airline !== legs[i - 1]!.airline).length
  const meanFactor = (legs: Leg[]) =>
    legs.reduce((sum, leg) => sum + findAirline(leg.airline)!.priceFactor, 0) / legs.length
  const byPath = new Map<string, Leg[][]>()
  for (const legs of found) {
    const path = [from, ...legs.map((leg) => leg.to)].join('-')
    byPath.set(path, [...(byPath.get(path) ?? []), legs])
  }
  const distinct = [...byPath.values()].flatMap((group) =>
    group
      .sort((a, b) => airlineChanges(a) - airlineChanges(b) || meanFactor(a) - meanFactor(b))
      .slice(0, 2),
  )

  const length = (legs: Leg[]) => legs.reduce((sum, leg) => sum + leg.distanceKm, 0)
  distinct.sort((a, b) => a.length - b.length || length(a) - length(b))
  const nonstop = distinct.filter((legs) => legs.length === 1)
  const oneStop = distinct.filter((legs) => legs.length === 2).slice(0, 12)
  const twoStop =
    nonstop.length + oneStop.length < 6
      ? distinct.filter((legs) => legs.length === 3).slice(0, 8)
      : []

  const routes: Route[] = []
  for (const legs of [...nonstop, ...oneStop, ...twoStop]) {
    const base = legs.map((leg) => `${leg.airline}${leg.from}${leg.to}`).join('-')
    // Short nonstops fly several times a day; everything else once.
    const slots = legs.length > 1 ? 1 : direct < 2500 ? 3 : direct < 6000 ? 2 : 1
    for (let slot = 0; slot < slots; slot++) {
      routes.push({ key: `${base}#${slot}`, legs, slot, slots })
    }
  }

  routeCache.set(cacheKey, routes)
  return routes
}

/* --------------------------------------------------------------------------
   Schedules
   -------------------------------------------------------------------------- */

const round5 = (minutes: number) => Math.round(minutes / 5) * 5

const AIRCRAFT = {
  short: ['A220-300', 'E195-E2', 'A320neo'],
  medium: ['A321neo', '737 MAX 8', 'A320neo'],
  long: ['787-9', 'A350-900', '777-300ER', 'A330-900'],
}

function aircraftFor(distance: number, random: () => number): string {
  const fleet = distance < 1500 ? AIRCRAFT.short : distance < 4500 ? AIRCRAFT.medium : AIRCRAFT.long
  return fleet[Math.floor(random() * fleet.length)]!
}

/** Block time for a leg: cruise at about 750 km/h, plus taxi and climb. */
export function legMinutes(distance: number): number {
  return round5(distance / 12.5 + 35)
}

interface Schedule {
  id: string
  segments: FlightSegment[]
  layovers: Layover[]
  /** Local minute of the day the first leg leaves. */
  departMinute: number
}

/** Lays a route out on a given day. Times stay the same every day it flies. */
function schedule(route: Route, date: string): Schedule {
  const random = seeded('schedule', route.key)
  // Spread a nonstop's daily departures across 06:00–23:00.
  const window = (17 * 60) / route.slots
  const departMinute = round5(between(random, 6 * 60 + route.slot * window, 6 * 60 + (route.slot + 1) * window))

  const segments: FlightSegment[] = []
  const layovers: Layover[] = []
  let utc = toEpochDay(date) * 1440 + departMinute - airport(route.legs[0]!.from).utcOffset

  route.legs.forEach((leg, index) => {
    const durationMin = legMinutes(leg.distanceKm)
    const departs = utc + airport(leg.from).utcOffset
    const arrives = utc + durationMin + airport(leg.to).utcOffset
    const number = 10 + Math.floor(seeded('number', route.key, index)() * 1990)
    segments.push({
      flightNumber: `${leg.airline} ${number}`,
      airline: leg.airline,
      from: leg.from,
      to: leg.to,
      departs,
      arrives,
      durationMin,
      distanceKm: Math.round(leg.distanceKm),
      aircraft: aircraftFor(leg.distanceKm, random),
    })
    utc += durationMin
    if (index < route.legs.length - 1) {
      const durationMin = round5(between(random, 55, 300))
      layovers.push({
        airport: leg.to,
        durationMin,
        overnight: Math.floor(arrives / 1440) !== Math.floor((arrives + durationMin) / 1440),
      })
      utc += durationMin
    }
  })

  return {
    id: segments.map((segment) => segment.flightNumber.replace(' ', '')).join('+'),
    segments,
    layovers,
    departMinute,
  }
}

/** Does this route fly on that day of the week? Most do; about one in seven doesn't. */
function operates(route: Route, date: string): boolean {
  return seeded('operates', route.key, weekday(date))() >= 0.15
}

/* --------------------------------------------------------------------------
   Fares
   -------------------------------------------------------------------------- */

export const CABIN_MULTIPLIER: Record<Cabin, number> = {
  economy: 1,
  premium: 1.7,
  business: 3.8,
  first: 6.5,
}

const CABIN_EMISSIONS: Record<Cabin, number> = {
  economy: 1,
  premium: 1.5,
  business: 2.9,
  first: 3.6,
}

const STOPS_FACTOR = [1.15, 1, 0.88]

/** Sunday … Saturday. Weekends and Fridays cost more; midweek less. */
const WEEKDAY_FACTOR = [1.12, 1, 0.9, 0.92, 1.04, 1.1, 0.97]

const MONTH_KEYS: MonthKey[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Arriving at a catalog destination in its best season costs more. */
function inSeasonAt(code: string, date: string): boolean {
  const slug = findAirport(code)?.destination
  if (!slug) return false
  const destination = destinations.find((d) => d.slug === slug)
  return destination?.bestMonths.includes(MONTH_KEYS[monthOf(date) - 1]!) ?? false
}

function isHolidayPeak(date: string): boolean {
  const md = date.slice(5)
  return md >= '12-18' || md <= '01-04'
}

/**
 * The booking curve: fares climb steeply inside three weeks, sit flat between
 * three weeks and three months out, and creep up again beyond that.
 */
export function bookingFactor(daysOut: number): number {
  if (daysOut < 21) return 1 + (21 - daysOut) * 0.028
  if (daysOut <= 90) return 1
  return 1 + (daysOut - 90) * 0.0008
}

/** What everything on a route costs more or less that day, before the booking curve. */
function dayFactor(from: string, to: string, date: string): number {
  return (
    WEEKDAY_FACTOR[weekday(date)]! *
    (inSeasonAt(to, date) ? 1.15 : 1) *
    (isHolidayPeak(date) ? 1.25 : 1) *
    between(seeded('day', from, to, date), 0.88, 1.12)
  )
}

/* --------------------------------------------------------------------------
   Search
   -------------------------------------------------------------------------- */

const optionCache = new Map<string, FlightOption[]>()
const MAX_CACHED = 4000

/**
 * Every flight from `from` to `to` on `date` in `cabin`, priced as seen on
 * `observed` (normally today). Nothing is sold for dates before `observed`.
 */
export function flightsOn(
  from: string,
  to: string,
  date: string,
  cabin: Cabin,
  observed: string,
): FlightOption[] {
  if (from === to || !findAirport(from) || !findAirport(to)) return []
  const daysOut = daysBetween(observed, date)
  if (daysOut < 0) return []

  const cacheKey = `${from}|${to}|${date}|${cabin}|${observed}`
  const cached = optionCache.get(cacheKey)
  if (cached) return cached

  const routes = routesBetween(from, to)
  let flying = routes.filter((route) => operates(route, date))
  if (flying.length === 0 && routes.length > 0) flying = [routes[0]!]

  const direct = distanceBetween(from, to)
  const base = 35 + 0.075 * direct
  const sharedFactor =
    dayFactor(from, to, date) *
    bookingFactor(daysOut) *
    between(seeded('observed', from, to, date, observed), 0.96, 1.04) *
    CABIN_MULTIPLIER[cabin]

  const seen = new Set<string>()
  const options = flying.flatMap((route): FlightOption[] => {
    const { id, segments, layovers, departMinute } = schedule(route, date)
    if (seen.has(id)) return []
    seen.add(id)

    const first = segments[0]!
    const last = segments[segments.length - 1]!
    const stops = segments.length - 1
    const airlineCodes = [...new Set(segments.map((segment) => segment.airline))]
    const airlineFactor =
      segments.reduce((sum, segment) => sum + findAirline(segment.airline)!.priceFactor, 0) /
      segments.length
    const hour = departMinute / 60
    const redEye = hour < 7 || hour >= 21 ? 0.93 : 1
    const fare =
      base *
      STOPS_FACTOR[stops]! *
      airlineFactor *
      redEye *
      sharedFactor *
      between(seeded('fare', id, date), 0.92, 1.1)
    const flown = segments.reduce((sum, segment) => sum + segment.distanceKm, 0)

    return [
      {
        id,
        segments,
        layovers,
        airlines: airlineCodes,
        stops,
        departs: first.departs,
        // Elapsed time, independent of the clocks at either end.
        durationMin:
          segments.reduce((sum, segment) => sum + segment.durationMin, 0) +
          layovers.reduce((sum, layover) => sum + layover.durationMin, 0),
        arrives: last.arrives,
        fare: Math.max(29, Math.round(fare)),
        emissionsKg: Math.round(flown * 0.09 * CABIN_EMISSIONS[cabin] * (1 + 0.04 * stops)),
      },
    ]
  })

  options.sort((a, b) => a.departs - b.departs)
  if (optionCache.size > MAX_CACHED) optionCache.clear()
  optionCache.set(cacheKey, options)
  return options
}

/** Finds one flight again by its id, e.g. from a booking link. */
export function findFlight(
  from: string,
  to: string,
  date: string,
  cabin: Cabin,
  observed: string,
  id: string,
): FlightOption | undefined {
  return flightsOn(from, to, date, cabin, observed).find((option) => option.id === id)
}

export function cheapestFare(
  from: string,
  to: string,
  date: string,
  cabin: Cabin,
  observed: string,
): number | null {
  const options = flightsOn(from, to, date, cabin, observed)
  return options.length ? Math.min(...options.map((option) => option.fare)) : null
}

/* --------------------------------------------------------------------------
   Totals
   -------------------------------------------------------------------------- */

/** Each direction of a round trip is a little cheaper than a one-way. */
export const ROUND_TRIP_DISCOUNT = 0.94

/** Children pay 75% of the adult fare; lap infants pay 10%. */
export function passengerMultiplier({ adults, children, infants }: Passengers): number {
  return adults + children * 0.75 + infants * 0.1
}

export interface FareBreakdown {
  adults: number
  children: number
  infants: number
  total: number
}

/**
 * What a set of one-adult fares costs per kind of traveller, in USD. The
 * total is the sum of the rounded lines, so an itemised receipt always adds up.
 */
export function fareBreakdown(fares: number[], { adults, children, infants }: Passengers): FareBreakdown {
  const discount = fares.length > 1 ? ROUND_TRIP_DISCOUNT : 1
  const adultFare = fares.reduce((total, fare) => total + fare, 0) * discount
  const lines = {
    adults: Math.round(adultFare * adults),
    children: Math.round(adultFare * 0.75 * children),
    infants: Math.round(adultFare * 0.1 * infants),
  }
  return { ...lines, total: lines.adults + lines.children + lines.infants }
}

/** What a set of one-adult fares costs for everyone travelling, in USD. */
export function tripTotal(fares: number[], passengers: Passengers): number {
  return fareBreakdown(fares, passengers).total
}

/** The cheapest the whole search can be booked for, or null if nothing flies. */
export function cheapestTotal(
  search: FlightSearch,
  observed: string,
  depart = search.depart,
  ret = search.return,
): number | null {
  const out = cheapestFare(search.from, search.to, depart, search.cabin, observed)
  if (out === null) return null
  if (search.trip === 'oneway' || !ret) return tripTotal([out], search)
  if (ret < depart) return null
  const back = cheapestFare(search.to, search.from, ret, search.cabin, observed)
  return back === null ? null : tripTotal([out, back], search)
}

/** Trip length in days for a round trip, 0 for one-way. */
export function tripLength(search: FlightSearch): number {
  return search.trip === 'round' && search.return ? daysBetween(search.depart, search.return) : 0
}

/** The cheapest total for each departure date, keeping the trip the same length. */
export function priceCalendar(
  search: FlightSearch,
  departDates: string[],
  observed: string,
): { date: string; total: number | null }[] {
  const nights = tripLength(search)
  return departDates.map((date) => ({
    date,
    total: cheapestTotal(
      search,
      observed,
      date,
      search.trip === 'round' ? addDays(date, nights) : undefined,
    ),
  }))
}

export interface GridCell {
  depart: string
  ret: string
  total: number | null
}

/** Cheapest totals for departures and returns up to `radius` days either side. */
export function dateGrid(search: FlightSearch, observed: string, radius = 3): GridCell[][] {
  const offsets = Array.from({ length: radius * 2 + 1 }, (_, i) => i - radius)
  return offsets.map((d) => {
    const depart = addDays(search.depart, d)
    return offsets.map((r) => {
      const ret = addDays(search.return ?? search.depart, r)
      return {
        depart,
        ret,
        total: ret < depart ? null : cheapestTotal(search, observed, depart, ret),
      }
    })
  })
}

function quantile(sorted: number[], q: number): number {
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return Math.round(sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower))
}

/**
 * Is today's cheapest price low, typical or high? "Typical" is the middle half
 * of the cheapest prices for departures two weeks either side, same trip length.
 */
export function priceInsight(search: FlightSearch, observed: string): PriceInsight | null {
  const current = cheapestTotal(search, observed)
  if (current === null) return null
  const dates = Array.from({ length: 15 }, (_, i) => addDays(search.depart, (i - 7) * 2)).filter(
    (date) => date > observed,
  )
  const totals = priceCalendar(search, dates, observed)
    .map((day) => day.total)
    .filter((total): total is number => total !== null)
    .sort((a, b) => a - b)
  if (totals.length < 4) return null
  const low = quantile(totals, 0.25)
  const high = quantile(totals, 0.75)
  return { current, low, high, level: current < low ? 'low' : current > high ? 'high' : 'typical' }
}

/** The cheapest total as it would have been seen on each of the last `days` days. */
export function priceHistory(
  search: FlightSearch,
  today: string,
  days = 30,
): { date: string; total: number | null }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - days + 1)
    return { date, total: cheapestTotal(search, date) }
  })
}

/* --------------------------------------------------------------------------
   Ranking
   -------------------------------------------------------------------------- */

/**
 * "Best" trades price against time: each flight is scored relative to the
 * cheapest and the fastest in the set, with a nudge against extra stops.
 */
export function bestScore(option: FlightOption, minFare: number, minDuration: number): number {
  return option.fare / minFare + 0.5 * (option.durationMin / minDuration) + 0.15 * option.stops
}

export function sortOptions(options: FlightOption[], mode: SortMode): FlightOption[] {
  if (options.length === 0) return []
  const minFare = Math.min(...options.map((o) => o.fare))
  const minDuration = Math.min(...options.map((o) => o.durationMin))
  const sorted = [...options]
  if (mode === 'cheapest') sorted.sort((a, b) => a.fare - b.fare || a.durationMin - b.durationMin)
  else if (mode === 'fastest') sorted.sort((a, b) => a.durationMin - b.durationMin || a.fare - b.fare)
  else
    sorted.sort(
      (a, b) => bestScore(a, minFare, minDuration) - bestScore(b, minFare, minDuration),
    )
  return sorted
}

/** Median emissions of a result set, for the "lower emissions" comparison. */
export function medianEmissions(options: FlightOption[]): number {
  if (options.length === 0) return 0
  const sorted = options.map((o) => o.emissionsKg).sort((a, b) => a - b)
  return quantile(sorted, 0.5)
}
