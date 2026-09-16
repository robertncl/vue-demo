import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ActivityDraft, Trip, TripDraft } from '@/types/travel'

const STORAGE_KEY = 'vue-demo-travel-trips'

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Trip[]) : []
  } catch {
    return []
  }
}

function createId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const useTravelStore = defineStore('travel', () => {
  const trips = ref<Trip[]>(loadTrips())
  const selectedTripId = ref<string | null>(trips.value[0]?.id ?? null)

  const selectedTrip = computed(
    () => trips.value.find((trip) => trip.id === selectedTripId.value) ?? null,
  )

  const tripDurationDays = computed(() => durationOf(selectedTrip.value))

  const spentAmount = computed(
    () => selectedTrip.value?.activities.reduce((sum, activity) => sum + activity.cost, 0) ?? 0,
  )

  const remainingBudget = computed(() => (selectedTrip.value?.budget ?? 0) - spentAmount.value)

  const budgetUsedPercent = computed(() => {
    const budget = selectedTrip.value?.budget ?? 0
    if (budget <= 0) return 0
    return Math.min(100, Math.round((spentAmount.value / budget) * 100))
  })

  /** Trips that have not finished yet, soonest departure first. */
  const upcomingTrips = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return [...trips.value]
      .filter((trip) => trip.endDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  })

  const nextTrip = computed(() => upcomingTrips.value[0] ?? null)

  const totalPlannedSpend = computed(() =>
    trips.value.reduce(
      (sum, trip) => sum + trip.activities.reduce((tripSum, a) => tripSum + a.cost, 0),
      0,
    ),
  )

  watch(
    trips,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  function durationOf(trip: Trip | null): number {
    if (!trip || !trip.startDate || !trip.endDate) return 0
    const diff = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) + 1 : 0
  }

  function addTrip(payload: TripDraft) {
    const trip: Trip = { id: createId(), activities: [], ...payload }
    trips.value.push(trip)
    selectedTripId.value = trip.id
    return trip
  }

  function removeTrip(id: string) {
    trips.value = trips.value.filter((trip) => trip.id !== id)
    if (selectedTripId.value === id) {
      selectedTripId.value = trips.value[0]?.id ?? null
    }
  }

  function selectTrip(id: string) {
    selectedTripId.value = id
  }

  function addActivity(payload: ActivityDraft) {
    const trip = selectedTrip.value
    if (!trip) return
    trip.activities.push({ id: createId(), ...payload })
    trip.activities.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
  }

  function removeActivity(activityId: string) {
    const trip = selectedTrip.value
    if (!trip) return
    trip.activities = trip.activities.filter((activity) => activity.id !== activityId)
  }

  function spentOnDay(day: number) {
    return (
      selectedTrip.value?.activities
        .filter((activity) => activity.day === day)
        .reduce((sum, activity) => sum + activity.cost, 0) ?? 0
    )
  }

  return {
    trips,
    selectedTripId,
    selectedTrip,
    tripDurationDays,
    spentAmount,
    remainingBudget,
    budgetUsedPercent,
    upcomingTrips,
    nextTrip,
    totalPlannedSpend,
    durationOf,
    addTrip,
    removeTrip,
    selectTrip,
    addActivity,
    removeActivity,
    spentOnDay,
  }
})
