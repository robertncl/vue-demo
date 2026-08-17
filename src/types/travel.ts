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
