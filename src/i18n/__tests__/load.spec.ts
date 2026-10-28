import { describe, it, expect, vi, afterEach } from 'vitest'

describe('loadLocale', () => {
  afterEach(() => {
    vi.doUnmock('../messages.es')
    vi.resetModules()
  })

  it('retries a bundle whose first request failed', async () => {
    // A fresh copy of the loader, so the bundles the test setup preloaded are not cached.
    vi.resetModules()
    let attempts = 0
    vi.doMock('../messages.es', async (importOriginal) => {
      attempts += 1
      if (attempts === 1) throw new Error('chunk failed to load')
      return importOriginal()
    })
    const { loadLocale, bundleFor } = await import('../load')

    await expect(loadLocale('es')).rejects.toThrow()
    expect(bundleFor('es')).toBeUndefined()

    const bundle = await loadLocale('es')
    expect(attempts).toBe(2)
    expect(bundleFor('es')).toBe(bundle)
  })
})
