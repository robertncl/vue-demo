import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('serves the travel home page at /', () => {
    const home = router.getRoutes().find((r) => r.name === 'home')
    expect(home?.path).toBe('/')
  })

  it('registers every travel route', () => {
    const paths = router.getRoutes().map((r) => r.path)
    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/destinations',
        '/destinations/:slug',
        '/wishlist',
        '/trips',
        '/about',
      ]),
    )
  })

  it('lazy-loads the destinations route', async () => {
    const route = router.getRoutes().find((r) => r.name === 'destinations')
    expect(route).toBeDefined()

    const loadComponent = route!.components!.default as () => Promise<{ default: unknown }>
    const loaded = await loadComponent()
    expect(loaded.default).toBeTruthy()
  })

  it('matches a destination slug to the detail route', async () => {
    await router.push('/destinations/kyoto')
    expect(router.currentRoute.value.name).toBe('destination')
    expect(router.currentRoute.value.params.slug).toBe('kyoto')
  })

  it('falls back to the not-found route for unknown paths', async () => {
    await router.push('/nope')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('sets the document title from route meta', async () => {
    await router.push('/trips')
    expect(document.title).toBe('My trips · Wanderlog')
  })
})
