import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '../router'
import App from '../App.vue'

describe('App', () => {
  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  it('renders the welcome message and navigation links', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('You did it!')
    const links = wrapper.findAll('nav a').map((a) => a.text())
    expect(links).toEqual(['Home', 'About'])
  })

  it('renders the about page after navigating to /about', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.push('/about')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This is an about page')
  })
})
