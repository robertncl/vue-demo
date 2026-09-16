import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTravelStore } from '../travel'

describe('Travel Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts with no trips', () => {
    const travel = useTravelStore()
    expect(travel.trips).toHaveLength(0)
    expect(travel.selectedTrip).toBeNull()
  })

  it('adds a trip and selects it automatically', () => {
    const travel = useTravelStore()
    const trip = travel.addTrip({
      destination: 'Kyoto',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      budget: 1000,
    })

    expect(travel.trips).toHaveLength(1)
    expect(travel.selectedTripId).toBe(trip.id)
    expect(travel.selectedTrip?.destination).toBe('Kyoto')
    expect(travel.tripDurationDays).toBe(5)
  })

  it('tracks spent amount and remaining budget from activities', () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Lisbon',
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      budget: 200,
    })

    travel.addActivity({ day: 1, time: '10:00', title: 'Tram tour', cost: 50 })
    travel.addActivity({ day: 1, time: '09:00', title: 'Pastel de nata tasting', cost: 20 })

    expect(travel.spentAmount).toBe(70)
    expect(travel.remainingBudget).toBe(130)
    // activities are sorted by day then time
    expect(travel.selectedTrip?.activities[0].title).toBe('Pastel de nata tasting')
  })

  it('removes an activity', () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Oslo',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      budget: 100,
    })
    travel.addActivity({ day: 1, time: '08:00', title: 'Fjord cruise', cost: 40 })
    const activityId = travel.selectedTrip!.activities[0].id

    travel.removeActivity(activityId)

    expect(travel.selectedTrip?.activities).toHaveLength(0)
    expect(travel.spentAmount).toBe(0)
  })

  it('removes a trip and clears selection when it was selected', () => {
    const travel = useTravelStore()
    const trip = travel.addTrip({
      destination: 'Cairo',
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      budget: 300,
    })

    travel.removeTrip(trip.id)

    expect(travel.trips).toHaveLength(0)
    expect(travel.selectedTripId).toBeNull()
  })

  it('tracks budget usage as a percentage, capped at 100', () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Bali',
      startDate: '2026-05-01',
      endDate: '2026-05-04',
      budget: 100,
    })

    travel.addActivity({ day: 1, time: '09:00', title: 'Surf lesson', cost: 25 })
    expect(travel.budgetUsedPercent).toBe(25)

    travel.addActivity({ day: 2, time: '09:00', title: 'Boat trip', cost: 200 })
    expect(travel.budgetUsedPercent).toBe(100)
    expect(travel.remainingBudget).toBe(-125)
  })

  it('sums the spend for a single day', () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Hanoi',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      budget: 300,
    })
    travel.addActivity({ day: 1, time: '09:00', title: 'Street food tour', cost: 30 })
    travel.addActivity({ day: 1, time: '19:00', title: 'Water puppets', cost: 10 })
    travel.addActivity({ day: 2, time: '09:00', title: 'Ninh Binh', cost: 60 })

    expect(travel.spentOnDay(1)).toBe(40)
    expect(travel.spentOnDay(2)).toBe(60)
    expect(travel.spentOnDay(3)).toBe(0)
  })

  it('lists upcoming trips soonest first and ignores finished ones', () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Past',
      startDate: '2020-01-01',
      endDate: '2020-01-05',
      budget: 100,
    })
    travel.addTrip({
      destination: 'Later',
      startDate: '2099-06-01',
      endDate: '2099-06-10',
      budget: 100,
    })
    travel.addTrip({
      destination: 'Sooner',
      startDate: '2099-02-01',
      endDate: '2099-02-10',
      budget: 100,
    })

    expect(travel.upcomingTrips.map((t) => t.destination)).toEqual(['Sooner', 'Later'])
    expect(travel.nextTrip?.destination).toBe('Sooner')
  })

  it('totals planned spend across every trip', () => {
    const travel = useTravelStore()
    const first = travel.addTrip({
      destination: 'Oslo',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      budget: 500,
    })
    travel.addActivity({ day: 1, time: '09:00', title: 'Fjord cruise', cost: 40 })

    travel.addTrip({
      destination: 'Rome',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      budget: 500,
    })
    travel.addActivity({ day: 1, time: '09:00', title: 'Colosseum', cost: 25 })

    expect(travel.totalPlannedSpend).toBe(65)

    travel.selectTrip(first.id)
    expect(travel.spentAmount).toBe(40)
  })

  it('computes the duration of any trip, not just the selected one', () => {
    const travel = useTravelStore()
    const trip = travel.addTrip({
      destination: 'Cairo',
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      budget: 300,
    })

    expect(travel.durationOf(trip)).toBe(4)
    expect(travel.durationOf(null)).toBe(0)
  })

  it('persists trips to localStorage', async () => {
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Porto',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      budget: 400,
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    const stored = JSON.parse(localStorage.getItem('vue-demo-travel-trips') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].destination).toBe('Porto')
  })
})
