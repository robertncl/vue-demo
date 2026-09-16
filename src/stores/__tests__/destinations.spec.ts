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

  describe('top pick for the month', () => {
    it('picks a destination that is in season', () => {
      const store = useDestinationsStore()
      store.today = new Date('2026-11-15T12:00:00')

      expect(store.currentMonth).toBe('Nov')
      expect(store.hasSeasonalPick).toBe(true)
      expect(store.topPick).not.toBeNull()
      expect(store.topPick!.bestMonths).toContain('Nov')
    })

    it('changes the pick when the month changes', () => {
      const store = useDestinationsStore()

      store.today = new Date('2026-01-15T12:00:00')
      const january = store.topPick!.slug

      store.today = new Date('2026-07-15T12:00:00')
      const july = store.topPick!.slug

      expect(january).not.toBe(july)
    })

    it('prefers the cheapest option among those in season', () => {
      const store = useDestinationsStore()
      store.today = new Date('2026-10-15T12:00:00')

      const inSeason = store.catalog.filter((d) => d.bestMonths.includes('Oct'))
      const cheapest = Math.min(...inSeason.map((d) => d.dailyBudget))

      expect(store.topPick!.dailyBudget).toBe(cheapest)
    })

    it('ranks in-season destinations ahead of out-of-season ones', () => {
      const store = useDestinationsStore()
      store.today = new Date('2026-04-15T12:00:00')

      const inSeasonFlags = store.rankedForMonth.map((d) => d.bestMonths.includes('Apr'))
      const firstOutOfSeason = inSeasonFlags.indexOf(false)

      // every in-season destination sorts before the first out-of-season one
      expect(firstOutOfSeason).toBeGreaterThan(0)
      expect(inSeasonFlags.slice(firstOutOfSeason)).not.toContain(true)
    })

    it('offers three runners-up that exclude the headline pick', () => {
      const store = useDestinationsStore()
      store.today = new Date('2026-05-15T12:00:00')

      expect(store.topPickRunnersUp).toHaveLength(3)
      expect(store.topPickRunnersUp.map((d) => d.slug)).not.toContain(store.topPick!.slug)
    })

    it('always returns a pick, even in a month nothing is peaking in', () => {
      const store = useDestinationsStore()
      // August is in no destination's bestMonths
      store.today = new Date('2026-08-15T12:00:00')

      expect(store.hasSeasonalPick).toBe(false)
      expect(store.topPick).not.toBeNull()
      // falls back to the best value in the catalog
      expect(store.topPick!.dailyBudget).toBe(Math.min(...store.catalog.map((d) => d.dailyBudget)))
    })

    it('reports whether a destination is in season', () => {
      const store = useDestinationsStore()
      store.today = new Date('2026-11-15T12:00:00')

      const capeTown = store.bySlug('cape-town')!
      const kyoto = store.bySlug('kyoto')!

      expect(store.inSeason(capeTown)).toBe(true)
      expect(store.inSeason(kyoto)).toBe(true)
      expect(store.inSeason(kyoto, 'Jul')).toBe(false)
    })

    it('uses the month note when there is one, and the tagline otherwise', () => {
      const store = useDestinationsStore()
      const kyoto = store.bySlug('kyoto')!

      expect(store.noteForMonth(kyoto, 'Apr')).toBe(kyoto.monthlyNote.Apr)
      expect(store.noteForMonth(kyoto, 'Jul')).toBe(kyoto.tagline)
    })
  })

  describe('guide content', () => {
    it('gives every destination a complete guide', () => {
      const store = useDestinationsStore()

      for (const destination of store.catalog) {
        expect(destination.overview.length).toBeGreaterThanOrEqual(2)
        expect(destination.neighbourhoods.length).toBeGreaterThanOrEqual(3)
        expect(destination.sampleItinerary).toHaveLength(3)
        expect(destination.foodPicks.length).toBeGreaterThanOrEqual(3)
        expect(destination.dayTrips.length).toBeGreaterThanOrEqual(3)
        expect(destination.seasons.length).toBeGreaterThanOrEqual(3)
        expect(Object.keys(destination.monthlyNote).length).toBeGreaterThanOrEqual(1)
      }
    })

    it('numbers each sample itinerary day in order', () => {
      const store = useDestinationsStore()

      for (const destination of store.catalog) {
        expect(destination.sampleItinerary.map((d) => d.day)).toEqual([1, 2, 3])
      }
    })

    it('fills in every practical field', () => {
      const store = useDestinationsStore()

      for (const destination of store.catalog) {
        for (const value of Object.values(destination.practical)) {
          expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    })

    it('breaks the daily budget down into parts that sum to the total', () => {
      const store = useDestinationsStore()

      for (const destination of store.catalog) {
        const { stay, food, transport, activities } = destination.budgetBreakdown
        expect(stay + food + transport + activities).toBe(destination.dailyBudget)
      }
    })

    it('writes a monthly note for every month it claims as a best month', () => {
      const store = useDestinationsStore()

      for (const destination of store.catalog) {
        for (const month of destination.bestMonths) {
          expect(destination.monthlyNote[month]).toBeTruthy()
        }
      }
    })
  })
})
