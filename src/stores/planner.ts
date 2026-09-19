import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Trip, TripActivity } from '@/types/travel'

const WISHLIST_KEY = 'wanderlog-wishlist'
const TRIPS_KEY = 'vue-demo-travel-trips'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const usePlannerStore = defineStore('planner', () => {
  const wishlist = ref<string[]>(loadJson<string[]>(WISHLIST_KEY, []))
  const trips = ref<Trip[]>(loadJson<Trip[]>(TRIPS_KEY, []))
  const selectedTripId = ref<string | null>(trips.value[0]?.id ?? null)

  watch(
    wishlist,
    (value) => {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(value))
    },
    { deep: true },
  )
  watch(
    trips,
    (value) => {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  function isSaved(slug: string): boolean {
    return wishlist.value.includes(slug)
  }

  function toggleWish(slug: string) {
    wishlist.value = isSaved(slug)
      ? wishlist.value.filter((s) => s !== slug)
      : [...wishlist.value, slug]
  }

  function addTrip(input: {
    destination: string
    startDate: string
    endDate: string
    budgetUsd: number
  }): Trip {
    const trip: Trip = {
      id: randomId(),
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budgetUsd,
      activities: [],
    }
    trips.value = [...trips.value, trip]
    selectedTripId.value = trip.id
    return trip
  }

  function removeTrip(id: string) {
    trips.value = trips.value.filter((t) => t.id !== id)
    if (selectedTripId.value === id) {
      selectedTripId.value = trips.value[0]?.id ?? null
    }
  }

  function selectTrip(id: string) {
    selectedTripId.value = id
  }

  function addActivity(
    tripId: string,
    input: { day: number; time: string; title: string; costUsd: number },
  ) {
    trips.value = trips.value.map((t) => {
      if (t.id !== tripId) return t
      const activity: TripActivity = {
        id: randomId(),
        day: input.day,
        time: input.time,
        title: input.title,
        cost: input.costUsd,
      }
      const activities = [...t.activities, activity].sort(
        (a, b) => a.day - b.day || a.time.localeCompare(b.time),
      )
      return { ...t, activities }
    })
  }

  function removeActivity(tripId: string, activityId: string) {
    trips.value = trips.value.map((t) =>
      t.id !== tripId ? t : { ...t, activities: t.activities.filter((a) => a.id !== activityId) },
    )
  }

  function durationOf(trip: Trip): number {
    if (!trip.startDate || !trip.endDate) return 0
    const diff = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()
    return diff > 0 ? Math.round(diff / 86400000) + 1 : 0
  }

  function spendOf(trip: Trip): number {
    return trip.activities.reduce((sum, a) => sum + a.cost, 0)
  }

  return {
    wishlist,
    trips,
    selectedTripId,
    isSaved,
    toggleWish,
    addTrip,
    removeTrip,
    selectTrip,
    addActivity,
    removeActivity,
    durationOf,
    spendOf,
  }
})
