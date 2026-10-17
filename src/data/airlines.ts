import type { Airline } from '@/types/flights'

/**
 * Fictional carriers. Each flies from its hubs only, so the hub list is the
 * whole route network: a leg exists when one end is a hub of the airline.
 */
export const airlines: Airline[] = [
  { code: 'NW', name: 'Northwind Airways', hubs: ['JFK', 'ORD'], priceFactor: 1.05, legroom: 31 },
  { code: 'PC', name: 'Pacific Crest', hubs: ['LAX', 'SFO'], priceFactor: 1, legroom: 31 },
  { code: 'MP', name: 'Maple Air', hubs: ['YYZ'], priceFactor: 0.98, legroom: 31 },
  { code: 'AX', name: 'Azteca Air', hubs: ['MEX'], priceFactor: 0.92, legroom: 30 },
  { code: 'AN', name: 'Andes Air', hubs: ['SCL', 'GRU', 'EZE', 'BOG'], priceFactor: 0.97, legroom: 31 },
  { code: 'TM', name: 'Thames Air', hubs: ['LHR'], priceFactor: 1.12, legroom: 31 },
  { code: 'MR', name: 'Meridian', hubs: ['CDG', 'AMS'], priceFactor: 1.06, legroom: 31 },
  { code: 'AP', name: 'Alpina', hubs: ['FRA'], priceFactor: 1.08, legroom: 31 },
  { code: 'SO', name: 'Solera', hubs: ['MAD', 'LIS'], priceFactor: 0.95, legroom: 30 },
  { code: 'SY', name: 'Skylark', hubs: ['FCO', 'AMS', 'MAD'], lowCost: true, priceFactor: 0.62, legroom: 29 },
  { code: 'NL', name: 'Nordlys', hubs: ['KEF'], priceFactor: 0.9, legroom: 31 },
  { code: 'BO', name: 'Bosphorus Air', hubs: ['IST'], priceFactor: 0.88, legroom: 31 },
  { code: 'GH', name: 'Gulf Horizon', hubs: ['DXB'], priceFactor: 1.1, legroom: 32 },
  { code: 'PR', name: 'Pearl Air', hubs: ['DOH'], priceFactor: 1.08, legroom: 32 },
  { code: 'GT', name: 'Ganges Air', hubs: ['DEL'], priceFactor: 0.9, legroom: 31 },
  { code: 'LO', name: 'Lotus Pacific', hubs: ['SIN', 'BKK'], priceFactor: 1.02, legroom: 32 },
  { code: 'JD', name: 'Jade Harbour', hubs: ['HKG'], priceFactor: 1.04, legroom: 32 },
  { code: 'KM', name: 'Kumo Air', hubs: ['HND'], priceFactor: 1.1, legroom: 33 },
  { code: 'HB', name: 'Hanbit Air', hubs: ['ICN'], priceFactor: 1, legroom: 32 },
  { code: 'SX', name: 'Southern Cross', hubs: ['SYD', 'AKL'], priceFactor: 1.06, legroom: 31 },
  { code: 'SV', name: 'Savanna Airways', hubs: ['JNB'], priceFactor: 0.96, legroom: 31 },
]

const byCode = new Map(airlines.map((airline) => [airline.code, airline]))

export function findAirline(code: string): Airline | undefined {
  return byCode.get(code)
}
