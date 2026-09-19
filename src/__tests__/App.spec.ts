import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '../router'
import App from '../App.vue'

describe('App', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/')
    await router.isReady()
  })

  it('renders the Wanderlog wordmark and primary navigation', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    })

    expect(wrapper.text()).toContain('Wanderlog')
    const links = wrapper.findAll('nav a').map((a) => a.text().replace(/\s+/g, ' ').trim())
    expect(links).toEqual(['Explore', 'Destinations', 'Shortlist', 'Trips', 'About'])
  })

  it('renders the about page after navigating to /about', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    })

    await router.push('/about')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('About Wanderlog')
  })
})
