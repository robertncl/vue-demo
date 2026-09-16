import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { destinations, allTags, regions } from '@/data/destinations'
import type { Destination, Region } from '@/types/travel'

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
  const wishlist = ref<string[]>(loadWishlist())

  watch(
    wishlist,
    (value) => {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  const filtered = computed(() => {
    const needle = query.value.trim().toLowerCase()
    return catalog.value.filter((destination) => {
      const matchesQuery =
        !needle ||
        destination.name.toLowerCase().includes(needle) ||
        destination.country.toLowerCase().includes(needle) ||
        destination.tags.some((t) => t.includes(needle))
      const matchesRegion = region.value === 'all' || destination.region === region.value
      const matchesTag = tag.value === 'all' || destination.tags.includes(tag.value)
      const matchesBudget = destination.dailyBudget <= maxDailyBudget.value
      return matchesQuery && matchesRegion && matchesTag && matchesBudget
    })
  })

  const featured = computed(() =>
    [...catalog.value].sort((a, b) => a.dailyBudget - b.dailyBudget).slice(0, 3),
  )

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
      maxDailyBudget.value < 250,
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
  }

  return {
    catalog,
    query,
    region,
    tag,
    maxDailyBudget,
    wishlist,
    filtered,
    featured,
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
