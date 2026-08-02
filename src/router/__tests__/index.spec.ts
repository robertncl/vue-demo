import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router', () => {
  it('registers the home route at /', () => {
    const home = router.getRoutes().find((r) => r.name === 'home')
    expect(home?.path).toBe('/')
  })

  it('registers the about route as a lazy-loaded chunk', async () => {
    const about = router.getRoutes().find((r) => r.name === 'about')
    expect(about).toBeDefined()
    expect(about!.path).toBe('/about')

    const loadComponent = about!.components!.default as () => Promise<{ default: unknown }>
    const loaded = await loadComponent()
    expect(loaded.default).toBeTruthy()
  })

  it('navigates to the about route', async () => {
    await router.push('/about')
    expect(router.currentRoute.value.name).toBe('about')
  })
})
