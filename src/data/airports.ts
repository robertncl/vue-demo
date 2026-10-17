import type { Airport } from '@/types/flights'

/**
 * The airports flights are generated between. Every catalog destination has
 * one (Kyoto flies into Osaka Kansai, Patagonia into El Calafate); the rest are
 * the hubs itineraries connect through. Offsets are standard time only.
 */
export const airports: Airport[] = [
  // North America
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'United States', lat: 40.64, lon: -73.78, utcOffset: -300, hub: true },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'United States', lat: 41.98, lon: -87.9, utcOffset: -360, hub: true },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'United States', lat: 33.94, lon: -118.41, utcOffset: -480, hub: true },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'United States', lat: 37.62, lon: -122.38, utcOffset: -480, hub: true },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson', country: 'Canada', lat: 43.68, lon: -79.63, utcOffset: -300, hub: true },
  { code: 'MEX', city: 'Mexico City', name: 'Benito Juárez International', country: 'Mexico', lat: 19.44, lon: -99.07, utcOffset: -360, hub: true, destination: 'mexico-city' },

  // South America
  { code: 'BOG', city: 'Bogotá', name: 'El Dorado International', country: 'Colombia', lat: 4.7, lon: -74.15, utcOffset: -300, hub: true },
  { code: 'GRU', city: 'São Paulo', name: 'Guarulhos International', country: 'Brazil', lat: -23.43, lon: -46.47, utcOffset: -180, hub: true },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez International', country: 'Chile', lat: -33.39, lon: -70.79, utcOffset: -240, hub: true },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ezeiza International', country: 'Argentina', lat: -34.82, lon: -58.54, utcOffset: -180, hub: true },
  { code: 'FTE', city: 'El Calafate', name: 'Comandante Armando Tola International', country: 'Argentina', lat: -50.28, lon: -72.05, utcOffset: -180, hub: false, destination: 'patagonia' },

  // Europe
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'United Kingdom', lat: 51.47, lon: -0.45, utcOffset: 0, hub: true },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France', lat: 49.01, lon: 2.55, utcOffset: 60, hub: true },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands', lat: 52.31, lon: 4.76, utcOffset: 60, hub: true },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt am Main', country: 'Germany', lat: 50.04, lon: 8.56, utcOffset: 60, hub: true },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain', lat: 40.49, lon: -3.57, utcOffset: 60, hub: true },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino', country: 'Italy', lat: 41.8, lon: 12.25, utcOffset: 60, hub: true },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal', lat: 38.77, lon: -9.13, utcOffset: 0, hub: true, destination: 'lisbon' },
  { code: 'KEF', city: 'Reykjavík', name: 'Keflavík International', country: 'Iceland', lat: 63.98, lon: -22.61, utcOffset: 0, hub: true, destination: 'reykjavik' },
  { code: 'FLR', city: 'Florence', name: 'Peretola', country: 'Italy', lat: 43.81, lon: 11.2, utcOffset: 60, hub: false, destination: 'florence' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Türkiye', lat: 41.26, lon: 28.74, utcOffset: 180, hub: true, destination: 'istanbul' },

  // Africa
  { code: 'RAK', city: 'Marrakech', name: 'Menara', country: 'Morocco', lat: 31.61, lon: -8.04, utcOffset: 60, hub: false, destination: 'marrakech' },
  { code: 'JNB', city: 'Johannesburg', name: 'O. R. Tambo International', country: 'South Africa', lat: -26.14, lon: 28.24, utcOffset: 120, hub: true },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa', lat: -33.97, lon: 18.6, utcOffset: 120, hub: false, destination: 'cape-town', longHaulFrom: ['LHR', 'AMS', 'FRA', 'DXB', 'DOH', 'IST'] },

  // Middle East & Asia
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'United Arab Emirates', lat: 25.25, lon: 55.36, utcOffset: 240, hub: true },
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar', lat: 25.27, lon: 51.61, utcOffset: 180, hub: true },
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International', country: 'India', lat: 28.56, lon: 77.1, utcOffset: 330, hub: true },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'Thailand', lat: 13.69, lon: 100.75, utcOffset: 420, hub: true },
  { code: 'SIN', city: 'Singapore', name: 'Changi', country: 'Singapore', lat: 1.36, lon: 103.99, utcOffset: 480, hub: true },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong', lat: 22.31, lon: 113.92, utcOffset: 480, hub: true },
  { code: 'HAN', city: 'Hanoi', name: 'Nội Bài International', country: 'Vietnam', lat: 21.22, lon: 105.81, utcOffset: 420, hub: false, destination: 'hanoi', longHaulFrom: ['CDG', 'FRA', 'DOH', 'DXB', 'ICN', 'HND'] },
  { code: 'DPS', city: 'Bali', name: 'Ngurah Rai International', country: 'Indonesia', lat: -8.75, lon: 115.17, utcOffset: 480, hub: false, destination: 'bali', longHaulFrom: ['DXB', 'DOH', 'ICN', 'HND', 'HKG'] },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'Japan', lat: 35.55, lon: 139.78, utcOffset: 540, hub: true },
  { code: 'KIX', city: 'Osaka', name: 'Kansai International', country: 'Japan', lat: 34.43, lon: 135.24, utcOffset: 540, hub: false, destination: 'kyoto', longHaulFrom: ['LAX', 'SFO', 'CDG', 'FRA', 'DOH', 'DXB', 'HKG', 'SIN', 'ICN'] },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea', lat: 37.46, lon: 126.44, utcOffset: 540, hub: true },

  // Oceania
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith', country: 'Australia', lat: -33.94, lon: 151.18, utcOffset: 600, hub: true },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand', lat: -37.01, lon: 174.79, utcOffset: 720, hub: true },
  { code: 'ZQN', city: 'Queenstown', name: 'Queenstown Airport', country: 'New Zealand', lat: -45.02, lon: 168.74, utcOffset: 720, hub: false, destination: 'queenstown' },
]

const byCode = new Map(airports.map((airport) => [airport.code, airport]))

export function findAirport(code: string): Airport | undefined {
  return byCode.get(code)
}

export function isAirportCode(value: unknown): value is string {
  return typeof value === 'string' && byCode.has(value)
}

/** The airport that serves a catalog destination. */
export function airportForDestination(slug: string): Airport | undefined {
  return airports.find((airport) => airport.destination === slug)
}

/** "London (LHR)" — the label the airport inputs show and accept. */
export function airportLabel(airport: Airport): string {
  return `${airport.city} (${airport.code})`
}

/**
 * Resolves what someone typed into an airport field: a bare code, the
 * "City (CODE)" label, or a city or airport name, case-insensitively.
 */
export function resolveAirport(input: string): Airport | undefined {
  const text = input.trim()
  if (!text) return undefined
  const code = text.match(/\(([A-Za-z]{3})\)\s*$/)?.[1] ?? text
  const exact = byCode.get(code.toUpperCase())
  if (exact) return exact
  const needle = text.toLowerCase()
  return airports.find(
    (airport) => airport.city.toLowerCase() === needle || airport.name.toLowerCase() === needle,
  )
}
