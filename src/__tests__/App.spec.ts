import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'

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
    expect(links).toEqual(['Explore', 'Destinations', 'Wishlist', 'My trips', 'About'])
  })

  it('renders the travel home page at the root route', () => {
    const wrapper = mountApp()

    expect(wrapper.text()).toContain('Find somewhere worth the flight.')
    expect(wrapper.text()).not.toContain('You did it!')
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
})
