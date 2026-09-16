import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import DestinationDetailView from '../DestinationDetailView.vue'
import { useDestinationsStore } from '@/stores/destinations'
import { findDestination } from '@/data/destinations'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/destinations/:slug', name: 'destination', component: DestinationDetailView },
    { path: '/trips', name: 'trips', component: { template: '<div />' } },
  ],
})

async function mountView(slug: string) {
  await router.push(`/destinations/${slug}`)
  await router.isReady()
  return mount(DestinationDetailView, {
    global: { plugins: [router, createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('DestinationDetailView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders the destination with costs and highlights', async () => {
    const wrapper = await mountView('kyoto')
    const kyoto = findDestination('kyoto')!

    expect(wrapper.find('h1').text()).toBe('Kyoto')
    expect(wrapper.text()).toContain(kyoto.summary)
    kyoto.highlights.forEach((h) => expect(wrapper.text()).toContain(h))
    expect(wrapper.text()).toContain(`$${kyoto.dailyBudget}`)
    // one week at the daily rate
    expect(wrapper.text()).toContain(`$${kyoto.dailyBudget * 7}`)
  })

  it('toggles the wishlist from the detail panel', async () => {
    const wrapper = await mountView('bali')
    const store = useDestinationsStore()

    expect(wrapper.text()).toContain('Save to wishlist')
    await wrapper.findAll('.panel button')[1].trigger('click')

    expect(store.isWishlisted('bali')).toBe(true)
    expect(wrapper.text()).toContain('★ Saved')
  })

  it('sends a pre-filled trip to the planner', async () => {
    const wrapper = await mountView('lisbon')
    const lisbon = findDestination('lisbon')!

    await wrapper.findAll('.panel button')[0].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/trips')
    expect(router.currentRoute.value.query).toEqual({
      destination: 'Lisbon, Portugal',
      budget: String(lisbon.dailyBudget * 7),
    })
  })

  it('shows related destinations from the same region', async () => {
    const wrapper = await mountView('kyoto')
    const related = wrapper.findAll('.related-item')

    expect(related.length).toBeGreaterThan(0)
    related.forEach((item) => expect(item.text()).not.toContain('Kyoto'))
  })

  it('shows a not-found message for an unknown slug', async () => {
    const wrapper = await mountView('atlantis')
    expect(wrapper.text()).toContain('Destination not found')
  })
})
