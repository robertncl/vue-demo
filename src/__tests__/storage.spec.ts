import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'

/**
 * Whatever is in localStorage — an older version's data, a hand edit, another
 * script on the origin — the app must still start.
 */
const corrupt: [string, string][] = [
  ['null', 'null'],
  ['an object', '{"length":2}'],
  ['a number', '42'],
  ['broken JSON', '{not json'],
]

describe('corrupted storage', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  for (const [label, raw] of corrupt) {
    it(`still renders every page when saved trips and shortlist are ${label}`, async () => {
      localStorage.setItem('vue-demo-travel-trips', raw)
      localStorage.setItem('wanderlog-wishlist', raw)
      localStorage.setItem('wanderlog-tracked-flights', raw)

      const pinia = createPinia()
      setActivePinia(pinia)
      const wrapper = mount(App, { global: { plugins: [router, pinia] } })
      for (const path of ['/', '/trips', '/wishlist', '/tracked']) {
        await router.push(path)
        await flushPromises()
        expect(wrapper.find('.site-header').exists()).toBe(true)
        expect(wrapper.find('main').exists()).toBe(true)
      }
      wrapper.unmount()
    })
  }
})
