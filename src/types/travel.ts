export type Region = 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania'

export type MonthKey =
  'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

/** A typical day's spend, broken down. All figures are in USD, the base currency. */
export interface BudgetBreakdown {
  stay: number
  food: number
  transport: number
  activities: number
}

export interface NeighbourhoodGuide {
  name: string
  bestFor: string
  description: string
}

export interface DayPlan {
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

export interface SeasonNote {
  months: MonthKey[]
  label: string
  note: string
}

export interface Destination {
  slug: string
  name: string
  country: string
  region: Region
  tagline: string
  summary: string
  /** Indicative cost of a day on the ground, in USD. */
  dailyBudget: number
  budgetBreakdown: BudgetBreakdown
  bestMonths: MonthKey[]
  tags: string[]
  highlights: string[]

  /* --- extended guide --- */
  /** Longer-form orientation, rendered as paragraphs under a translated heading. */
  overview: string[]
  neighbourhoods: NeighbourhoodGuide[]
  sampleItinerary: DayPlan[]
  foodPicks: string[]
  dayTrips: string[]
  practical: PracticalInfo
  seasons: SeasonNote[]
  /** Why this place is worth it in a given month; keyed by month. */
  monthlyNote: Partial<Record<MonthKey, string>>
}

export interface Activity {
  id: string
  day: number
  time: string
  title: string
  /** Stored in USD, the base currency. */
  cost: number
}

export interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  /** Stored in USD, the base currency. */
  budget: number
  activities: Activity[]
}

export interface TripDraft {
  destination: string
  startDate: string
  endDate: string
  budget: number
}

export interface ActivityDraft {
  day: number
  time: string
  title: string
  cost: number
}

/* --- settings --- */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD'

export interface Currency {
  code: CurrencyCode
  symbol: string
  label: string
  /** Units of this currency per 1 USD. */
  rate: number
  /** Decimal places to display. */
  decimals: number
}

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'ja'

export interface Locale {
  code: LocaleCode
  label: string
  /** BCP 47 tag used for Intl number and date formatting. */
  intl: string
}
