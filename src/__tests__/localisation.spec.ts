import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'
import { useSettingsStore } from '@/stores/settings'
import { localeList, currencyList } from '@/i18n/config'

const routes = ['/', '/destinations', '/destinations/kyoto', '/wishlist', '/trips', '/about']

/** Catches a dotted i18n key that reached the DOM because a string was missing. */
const RAW_KEY =
  /\b(?:nav|home|topPick|destinations|detail|wishlist|trips|planner|about|notFound|common|settings|card|footer|brand)\.[a-zA-Z]+\b/

describe('localisation', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders every route in every language without leaking raw keys', async () => {
    for (const locale of localeList) {
      const pinia = createPinia()
      setActivePinia(pinia)
      const settings = useSettingsStore()
      settings.setLocale(locale.code)

      const wrapper = mount(App, { global: { plugins: [router, pinia] } })

      for (const path of routes) {
        await router.push(path)
        await flushPromises()

        const text = wrapper.text()
        expect(text.length).toBeGreaterThan(50)
        expect(`${locale.code} ${path}: ${text.match(RAW_KEY)?.[0] ?? 'clean'}`).toContain('clean')
      }

      wrapper.unmount()
    }
  })

  it('renders prices in every currency on the destination list', async () => {
    for (const currency of currencyList) {
      const pinia = createPinia()
      setActivePinia(pinia)
      const settings = useSettingsStore()
      settings.setCurrency(currency.code)

      const wrapper = mount(App, { global: { plugins: [router, pinia] } })
      await router.push('/destinations')
      await flushPromises()

      const prices = wrapper.findAll('.price').map((p) => p.text())
      expect(prices).toHaveLength(12)
      prices.forEach((price) => expect(price).toMatch(/\d/))

      wrapper.unmount()
    }
  })

  it('keeps the top pick and its month name in sync with the language', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const settings = useSettingsStore()

    const wrapper = mount(App, { global: { plugins: [router, pinia] } })
    await router.push('/')
    await flushPromises()

    expect(wrapper.find('.top-pick').text()).toMatch(/Top pick for \w+/)

    settings.setLocale('de')
    await flushPromises()
    expect(wrapper.find('.top-pick').text()).toMatch(/Top-Tipp für \w+/)

    wrapper.unmount()
  })
})
