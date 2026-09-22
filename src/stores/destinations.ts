import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { destinations, allTags, regions } from '@/data/destinations'
import { monthKeyFor } from '@/i18n'
import type { Destination, MonthKey, Region } from '@/types/travel'

const WISHLIST_KEY = 'wanderlog-wishlist'

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export const useDestinationsStore = defineStore('destinations', () => {
  const catalog = ref<Destination[]>(destinations)
  const query = ref('')
  const region = ref<Region | 'all'>('all')
  const tag = ref<string | 'all'>('all')
  const maxDailyBudget = ref(250)
  const inSeasonOnly = ref(false)
  const wishlist = ref<string[]>(loadWishlist())

  watch(
    wishlist,
    (value) => {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  /** Cheapest first, as the catalog's "A day \u2191" column header promises. */
  const filtered = computed(() => {
    const needle = query.value.trim().toLowerCase()
    return catalog.value
      .filter((destination) => {
        const matchesQuery =
          !needle ||
          destination.name.toLowerCase().includes(needle) ||
          destination.country.toLowerCase().includes(needle) ||
          destination.tags.some((t) => t.includes(needle))
        const matchesRegion = region.value === 'all' || destination.region === region.value
        const matchesTag = tag.value === 'all' || destination.tags.includes(tag.value)
        const matchesBudget = destination.dailyBudget <= maxDailyBudget.value
        const matchesSeason = !inSeasonOnly.value || inSeason(destination)
        return matchesQuery && matchesRegion && matchesTag && matchesBudget && matchesSeason
      })
      .sort((a, b) => a.dailyBudget - b.dailyBudget)
  })

  const featured = computed(() =>
    [...catalog.value].sort((a, b) => a.dailyBudget - b.dailyBudget).slice(0, 3),
  )

  /** Overridable so the month-dependent picks can be tested deterministically. */
  const today = ref<Date>(new Date())
  const currentMonth = computed<MonthKey>(() => monthKeyFor(today.value))

  /**
   * Scores a destination for a given month: being in season dominates, and a
   * lower daily budget breaks ties so the ranking favours value.
   */
  function scoreForMonth(destination: Destination, month: MonthKey): number {
    const inSeasonScore = destination.bestMonths.includes(month) ? 1000 : 0
    const noteScore = destination.monthlyNote[month] ? 100 : 0
    return inSeasonScore + noteScore - destination.dailyBudget
  }

  const rankedForMonth = computed(() =>
    [...catalog.value].sort(
      (a, b) => scoreForMonth(b, currentMonth.value) - scoreForMonth(a, currentMonth.value),
    ),
  )

  /** The single headline recommendation for the current month. */
  const topPick = computed<Destination | null>(() => rankedForMonth.value[0] ?? null)

  /** The next best few, shown alongside the headline pick. */
  const topPickRunnersUp = computed(() => rankedForMonth.value.slice(1, 4))

  /** True when at least one destination is genuinely in season this month. */
  const hasSeasonalPick = computed(() =>
    catalog.value.some((destination) => destination.bestMonths.includes(currentMonth.value)),
  )

  function inSeason(destination: Destination, month: MonthKey = currentMonth.value) {
    return destination.bestMonths.includes(month)
  }

  function noteForMonth(destination: Destination, month: MonthKey = currentMonth.value) {
    return destination.monthlyNote[month] ?? destination.tagline
  }

  const wishlistDestinations = computed(() =>
    wishlist.value
      .map((slug) => catalog.value.find((destination) => destination.slug === slug))
      .filter((destination): destination is Destination => Boolean(destination)),
  )

  const hasActiveFilters = computed(
    () =>
      query.value !== '' ||
      region.value !== 'all' ||
      tag.value !== 'all' ||
      maxDailyBudget.value < 250 ||
      inSeasonOnly.value,
  )

  function isWishlisted(slug: string) {
    return wishlist.value.includes(slug)
  }

  function toggleWishlist(slug: string) {
    if (isWishlisted(slug)) {
      wishlist.value = wishlist.value.filter((item) => item !== slug)
    } else {
      wishlist.value = [...wishlist.value, slug]
    }
  }

  function bySlug(slug: string) {
    return catalog.value.find((destination) => destination.slug === slug) ?? null
  }

  function resetFilters() {
    query.value = ''
    region.value = 'all'
    tag.value = 'all'
    maxDailyBudget.value = 250
    inSeasonOnly.value = false
  }

  return {
    catalog,
    query,
    region,
    tag,
    maxDailyBudget,
    inSeasonOnly,
    wishlist,
    filtered,
    featured,
    today,
    currentMonth,
    rankedForMonth,
    topPick,
    topPickRunnersUp,
    hasSeasonalPick,
    inSeason,
    noteForMonth,
    wishlistDestinations,
    hasActiveFilters,
    regions,
    allTags,
    isWishlisted,
    toggleWishlist,
    bySlug,
    resetFilters,
  }
})
