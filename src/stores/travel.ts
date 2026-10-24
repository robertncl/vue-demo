import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { isIsoDate } from '@/lib/dates'
import type { Activity, ActivityDraft, Trip, TripDraft } from '@/types/travel'

const STORAGE_KEY = 'vue-demo-travel-trips'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

function isActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) return false
  const activity = value as Record<string, unknown>
  return (
    typeof activity.id === 'string' &&
    Number.isInteger(activity.day) &&
    (activity.day as number) >= 1 &&
    typeof activity.time === 'string' &&
    typeof activity.title === 'string' &&
    isFiniteNumber(activity.cost)
  )
}

function isTrip(value: unknown): value is Trip {
  if (typeof value !== 'object' || value === null) return false
  const trip = value as Record<string, unknown>
  return (
    typeof trip.id === 'string' &&
    typeof trip.destination === 'string' &&
    isIsoDate(trip.startDate) &&
    isIsoDate(trip.endDate) &&
    isFiniteNumber(trip.budget) &&
    Array.isArray(trip.activities)
  )
}

/**
 * Storage can hold anything — an older version's data, a hand edit — and the
 * header reads the trip count on every page, so a bad value must never reach
 * the store. Unreadable trips and activities are dropped; the rest survive.
 */
function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(stored)) return []
    return stored
      .filter(isTrip)
      .map((trip) => ({ ...trip, activities: trip.activities.filter(isActivity) }))
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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* storage unavailable — the change just won't persist */
      }
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
