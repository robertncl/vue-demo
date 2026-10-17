import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'
import { cheapestTotal } from '@/lib/flights'
import { isFlightSearch, searchKey } from '@/lib/flightSearch'
import { isIsoDate, localIsoDate } from '@/lib/dates'
import type { FlightSearch, TrackedSearch } from '@/types/flights'
import type { LocaleCode } from '@/types/travel'

const LAST_SEARCH_KEY = 'wanderlog-last-search'
const TRACKED_KEY = 'wanderlog-tracked-flights'

/** Where a first search starts from before you have made one: a guess from the language. */
const HOME_BY_LOCALE: Record<LocaleCode, string> = {
  en: 'JFK',
  es: 'MAD',
  fr: 'CDG',
  de: 'FRA',
  ja: 'HND',
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — the change just won't persist */
  }
}

/** Storage can hold anything (an old version, a hand edit), so check every entry. */
function isTrackedSearch(value: unknown): value is TrackedSearch {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    isFlightSearch(entry.search) &&
    isIsoDate(entry.trackedOn) &&
    typeof entry.priceAtTrack === 'number' &&
    Number.isFinite(entry.priceAtTrack)
  )
}

function loadTracked(): TrackedSearch[] {
  const stored = readJson(TRACKED_KEY)
  return Array.isArray(stored) ? stored.filter(isTrackedSearch) : []
}

function loadLastSearch(): FlightSearch | null {
  const stored = readJson(LAST_SEARCH_KEY)
  return isFlightSearch(stored) ? stored : null
}

export const useFlightsStore = defineStore('flights', () => {
  const settings = useSettingsStore()

  /** Overridable so date-dependent prices can be tested deterministically. */
  const today = ref(localIsoDate(new Date()))

  const lastSearch = ref<FlightSearch | null>(loadLastSearch())
  const tracked = ref<TrackedSearch[]>(loadTracked())

  watch(lastSearch, (value) => writeJson(LAST_SEARCH_KEY, value), { deep: true })
  watch(tracked, (value) => writeJson(TRACKED_KEY, value), { deep: true })

  /** The airport new searches and the explore page start from. */
  const homeAirport = computed(() => lastSearch.value?.from ?? HOME_BY_LOCALE[settings.locale])

  /** Tracked searches, soonest departure first. */
  const trackedByDeparture = computed(() =>
    [...tracked.value].sort((a, b) => a.search.depart.localeCompare(b.search.depart)),
  )

  function remember(search: FlightSearch) {
    lastSearch.value = { ...search }
  }

  function trackedFor(search: FlightSearch): TrackedSearch | undefined {
    const key = searchKey(search)
    return tracked.value.find((entry) => entry.id === key)
  }

  function isTracked(search: FlightSearch): boolean {
    return Boolean(trackedFor(search))
  }

  function track(search: FlightSearch) {
    if (isTracked(search)) return
    const price = cheapestTotal(search, today.value)
    if (price === null) return
    tracked.value = [
      ...tracked.value,
      { id: searchKey(search), search: { ...search }, trackedOn: today.value, priceAtTrack: price },
    ]
  }

  function untrack(id: string) {
    tracked.value = tracked.value.filter((entry) => entry.id !== id)
  }

  function toggleTracked(search: FlightSearch) {
    const existing = trackedFor(search)
    if (existing) untrack(existing.id)
    else track(search)
  }

  return {
    today,
    lastSearch,
    tracked,
    trackedByDeparture,
    homeAirport,
    remember,
    trackedFor,
    isTracked,
    track,
    untrack,
    toggleTracked,
  }
})
