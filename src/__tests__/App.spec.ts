import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'
import { useSettingsStore } from '@/stores/settings'

function mountApp() {
  return mount(App, { global: { plugins: [router, createPinia()] } })
}

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    await router.push('/')
    await router.isReady()
  })

  it('renders the travel app shell with its navigation', () => {
    const wrapper = mountApp()

    expect(wrapper.text()).toContain('Wanderlog')
    const links = wrapper.findAll('.nav a').map((a) => a.text().replace(/\s+\d+$/, ''))
    expect(links).toEqual(['Flights', 'Explore', 'Tracked', 'Trips', 'Guides'])

    const footer = wrapper.findAll('.site-footer a').map((a) => a.text())
    expect(footer).toEqual(['Shortlist', 'About'])
  })

  it('renders the flight search home page at the root route', () => {
    const wrapper = mountApp()

    expect(wrapper.find('h1').text()).toBe('Find your flight')
    expect(wrapper.find('form[role="search"]').exists()).toBe(true)
    expect(wrapper.findAll('.deal-card').length).toBeGreaterThan(0)
    expect(wrapper.find('.nav [aria-current="page"]').text()).toBe('Flights')
  })

  it('marks Flights as current on the results page too', async () => {
    const wrapper = mountApp()

    await router.push('/flights')
    await flushPromises()

    expect(wrapper.find('.nav [aria-current="page"]').text()).toBe('Flights')
  })

  it('renders the about page after navigating to /about', async () => {
    const wrapper = mountApp()

    await router.push('/about')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('About Wanderlog')
  })

  it('renders the destinations catalog after navigating to /destinations', async () => {
    const wrapper = mountApp()

    await router.push('/destinations')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Kyoto')
  })

  it('offers every language and currency in the header', () => {
    const wrapper = mountApp()

    const selects = wrapper.findAll('.settings select')
    expect(selects).toHaveLength(2)
    expect(selects[0].findAll('option')).toHaveLength(5)
    expect(selects[1].findAll('option')).toHaveLength(6)
  })

  it('translates the whole shell when the language changes', async () => {
    const wrapper = mountApp()
    const settings = useSettingsStore()

    expect(wrapper.find('.nav').text()).toContain('Guides')

    settings.setLocale('ja')
    await wrapper.vm.$nextTick()

    const nav = wrapper.find('.nav').text()
    expect(nav).toContain('フライト')
    expect(nav).toContain('旅先')
    expect(nav).toContain('旅程')
    expect(wrapper.find('h1').text()).toBe('フライトを探す')
  })

  it('switching currency changes prices across the page', async () => {
    const wrapper = mountApp()
    const settings = useSettingsStore()

    expect(wrapper.text()).toContain('$')

    settings.setCurrency('JPY')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('¥')
  })

  it('shows the top pick for the current month on the home page', () => {
    const wrapper = mountApp()
    expect(wrapper.find('.top-pick').exists()).toBe(true)
    expect(wrapper.text()).toMatch(/Top pick for \w+/)
  })
})
