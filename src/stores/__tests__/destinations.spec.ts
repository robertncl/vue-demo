import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDestinationsStore } from '../destinations'

describe('Destinations Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('exposes the full catalog with no filters applied', () => {
    const store = useDestinationsStore()
    expect(store.catalog.length).toBeGreaterThan(0)
    expect(store.filtered).toHaveLength(store.catalog.length)
    expect(store.hasActiveFilters).toBe(false)
  })

  it('filters by search query across name, country and tags', () => {
    const store = useDestinationsStore()

    store.query = 'japan'
    expect(store.filtered.map((d) => d.slug)).toEqual(['kyoto'])

    store.query = 'hiking'
    expect(store.filtered.map((d) => d.slug).sort()).toEqual(['patagonia', 'queenstown'])
  })

  it('filters by region, tag and daily budget together', () => {
    const store = useDestinationsStore()

    store.region = 'Europe'
    expect(store.filtered.every((d) => d.region === 'Europe')).toBe(true)

    store.tag = 'budget'
    expect(store.filtered.every((d) => d.tags.includes('budget'))).toBe(true)

    store.maxDailyBudget = 76
    expect(store.filtered.map((d) => d.slug)).toEqual(['istanbul'])
    expect(store.hasActiveFilters).toBe(true)
  })

  it('resets filters back to the full catalog', () => {
    const store = useDestinationsStore()
    store.query = 'kyoto'
    store.region = 'Asia'
    store.maxDailyBudget = 60

    store.resetFilters()

    expect(store.filtered).toHaveLength(store.catalog.length)
    expect(store.hasActiveFilters).toBe(false)
  })

  it('toggles wishlist entries and persists them', () => {
    const store = useDestinationsStore()

    store.toggleWishlist('lisbon')
    expect(store.isWishlisted('lisbon')).toBe(true)
    expect(store.wishlistDestinations.map((d) => d.name)).toEqual(['Lisbon'])

    store.toggleWishlist('lisbon')
    expect(store.isWishlisted('lisbon')).toBe(false)
    expect(store.wishlistDestinations).toHaveLength(0)
  })

  it('ignores unknown slugs in the wishlist', () => {
    const store = useDestinationsStore()
    store.toggleWishlist('atlantis')
    expect(store.wishlistDestinations).toHaveLength(0)
  })

  it('looks a destination up by slug', () => {
    const store = useDestinationsStore()
    expect(store.bySlug('bali')?.name).toBe('Bali')
    expect(store.bySlug('nowhere')).toBeNull()
  })

  it('features the three cheapest destinations', () => {
    const store = useDestinationsStore()
    expect(store.featured).toHaveLength(3)
    const budgets = store.featured.map((d) => d.dailyBudget)
    expect([...budgets].sort((a, b) => a - b)).toEqual(budgets)
    expect(Math.max(...budgets)).toBeLessThanOrEqual(
      Math.min(...store.catalog.map((d) => d.dailyBudget)) + 100,
    )
  })
})
