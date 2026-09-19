export interface BudgetBreakdown {
  stay: number
  food: number
  transport: number
  activities: number
}

export interface Neighbourhood {
  name: string
  bestFor: string
  description: string
}

export interface ItineraryDay {
  day: number
  title: string
  morning: string
  afternoon: string
  evening: string
}

export interface PracticalInfo {
  language: string
  currency: string
  timeZone: string
  plug: string
  visa: string
  gettingAround: string
  safety: string
}

export interface Season {
  months: string[]
  label: string
  note: string
}

export interface Destination {
  slug: string
  name: string
  country: string
  region: string
  emoji: string
  tagline: string
  summary: string
  dailyBudget: number
  budgetBreakdown: BudgetBreakdown
  bestMonths: string[]
  tags: string[]
  highlights: string[]
  gradient: [string, string]
  overview: string[]
  neighbourhoods: Neighbourhood[]
  sampleItinerary: ItineraryDay[]
  foodPicks: string[]
  dayTrips: string[]
  practical: PracticalInfo
  seasons: Season[]
  monthlyNote: Record<string, string>
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD'

export interface TripActivity {
  id: string
  day: number
  time: string
  title: string
  cost: number
}

export interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  activities: TripActivity[]
}
