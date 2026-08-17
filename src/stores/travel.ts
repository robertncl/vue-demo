import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Trip } from '@/types/travel'

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

  const selectedTrip = computed(() => trips.value.find((trip) => trip.id === selectedTripId.value) ?? null)

  const tripDurationDays = computed(() => {
    const trip = selectedTrip.value
    if (!trip || !trip.startDate || !trip.endDate) return 0
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diff = end.getTime() - start.getTime()
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) + 1 : 0
  })

  const spentAmount = computed(
    () => selectedTrip.value?.activities.reduce((sum, activity) => sum + activity.cost, 0) ?? 0,
  )

  const remainingBudget = computed(() => (selectedTrip.value?.budget ?? 0) - spentAmount.value)

  watch(
    trips,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  function addTrip(payload: { destination: string; startDate: string; endDate: string; budget: number }) {
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

  function addActivity(payload: { day: number; time: string; title: string; cost: number }) {
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

  return {
    trips,
    selectedTripId,
    selectedTrip,
    tripDurationDays,
    spentAmount,
    remainingBudget,
    addTrip,
    removeTrip,
    selectTrip,
    addActivity,
    removeActivity,
  }
})
