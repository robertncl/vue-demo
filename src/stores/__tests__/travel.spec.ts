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
    travel.addTrip({ destination: 'Lisbon', startDate: '2026-06-01', endDate: '2026-06-03', budget: 200 })

    travel.addActivity({ day: 1, time: '10:00', title: 'Tram tour', cost: 50 })
    travel.addActivity({ day: 1, time: '09:00', title: 'Pastel de nata tasting', cost: 20 })

    expect(travel.spentAmount).toBe(70)
    expect(travel.remainingBudget).toBe(130)
    // activities are sorted by day then time
    expect(travel.selectedTrip?.activities[0].title).toBe('Pastel de nata tasting')
  })

  it('removes an activity', () => {
    const travel = useTravelStore()
    travel.addTrip({ destination: 'Oslo', startDate: '2026-07-01', endDate: '2026-07-02', budget: 100 })
    travel.addActivity({ day: 1, time: '08:00', title: 'Fjord cruise', cost: 40 })
    const activityId = travel.selectedTrip!.activities[0].id

    travel.removeActivity(activityId)

    expect(travel.selectedTrip?.activities).toHaveLength(0)
    expect(travel.spentAmount).toBe(0)
  })

  it('removes a trip and clears selection when it was selected', () => {
    const travel = useTravelStore()
    const trip = travel.addTrip({ destination: 'Cairo', startDate: '2026-08-01', endDate: '2026-08-04', budget: 300 })

    travel.removeTrip(trip.id)

    expect(travel.trips).toHaveLength(0)
    expect(travel.selectedTripId).toBeNull()
  })
})
