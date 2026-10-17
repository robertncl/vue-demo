export type TripType = 'round' | 'oneway'

export type Cabin = 'economy' | 'premium' | 'business' | 'first'

export type StopsFilter = 'any' | '0' | '1'

export type SortMode = 'best' | 'cheapest' | 'fastest'

export interface Airport {
  /** IATA code, e.g. "LHR". */
  code: string
  city: string
  name: string
  country: string
  lat: number
  lon: number
  /** Standard-time offset from UTC in minutes. Daylight saving is ignored. */
  utcOffset: number
  /** Hubs are the airports where itineraries may connect. */
  hub: boolean
  /** The catalog destination this airport serves, if any. */
  destination?: string
  /** Hubs that fly here nonstop despite the distance (leisure long-haul). */
  longHaulFrom?: string[]
}

export interface Airline {
  code: string
  name: string
  hubs: string[]
  /** Short-haul only carriers never fly a leg longer than 3,500 km. */
  lowCost?: boolean
  /** Multiplies every fare this airline sells. */
  priceFactor: number
  /** Economy seat pitch in inches. */
  legroom: number
}

/**
 * Times are "wall minutes": minutes since 1970-01-01 00:00 on the local clock
 * of the airport in question. Formatting one as UTC prints that local time.
 */
export interface FlightSegment {
  flightNumber: string
  airline: string
  from: string
  to: string
  departs: number
  arrives: number
  durationMin: number
  distanceKm: number
  aircraft: string
}

export interface Layover {
  airport: string
  durationMin: number
  /** True when the connection spans local midnight. */
  overnight: boolean
}

export interface FlightOption {
  /** Stable across dates: the same schedule keeps the same id every day. */
  id: string
  segments: FlightSegment[]
  layovers: Layover[]
  airlines: string[]
  stops: number
  departs: number
  arrives: number
  durationMin: number
  /** One-way fare for one adult in the searched cabin, in USD. */
  fare: number
  emissionsKg: number
}

export interface Passengers {
  adults: number
  children: number
  /** Infants travel on an adult's lap. */
  infants: number
}

export interface FlightSearch extends Passengers {
  trip: TripType
  from: string
  to: string
  depart: string
  /** Only set for round trips. */
  return?: string
  cabin: Cabin
}

export interface TrackedSearch {
  id: string
  search: FlightSearch
  /** ISO date the tracking started. */
  trackedOn: string
  /** Cheapest total, in USD, on the day tracking started. */
  priceAtTrack: number
}

export type PriceLevel = 'low' | 'typical' | 'high'

export interface PriceInsight {
  level: PriceLevel
  current: number
  low: number
  high: number
}
