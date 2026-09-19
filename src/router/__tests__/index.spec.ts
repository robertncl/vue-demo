import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('registers the home route at /', () => {
    const home = router.getRoutes().find((r) => r.name === 'home')
    expect(home?.path).toBe('/')
  })

  it('registers the catalog, destination, shortlist, trips and about routes', () => {
    const names = router.getRoutes().map((r) => r.name)
    expect(names).toEqual(
      expect.arrayContaining([
        'home',
        'catalog',
        'destination',
        'shortlist',
        'trips',
        'about',
        'not-found',
      ]),
    )
  })

  it('registers the destination route with a lazy-loaded chunk', async () => {
    const destination = router.getRoutes().find((r) => r.name === 'destination')
    expect(destination).toBeDefined()
    expect(destination!.path).toBe('/destinations/:slug')

    const loadComponent = destination!.components!.default as () => Promise<{ default: unknown }>
    const loaded = await loadComponent()
    expect(loaded.default).toBeTruthy()
  })

  it('navigates to the about route', async () => {
    await router.push('/about')
    expect(router.currentRoute.value.name).toBe('about')
  })

  it('falls back to not-found for an unknown path', async () => {
    await router.push('/nope')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
