export type Region = 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania'

export interface Destination {
  slug: string
  name: string
  country: string
  region: Region
  emoji: string
  tagline: string
  summary: string
  /** Indicative cost of a day on the ground, in USD. */
  dailyBudget: number
  bestMonths: string[]
  tags: string[]
  highlights: string[]
  gradient: [string, string]
}

export interface Activity {
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
