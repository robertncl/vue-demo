import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import DestinationDetailView from '../DestinationDetailView.vue'
import { useDestinationsStore } from '@/stores/destinations'
import { useSettingsStore } from '@/stores/settings'
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
    // one week at the daily rate, formatted with a thousands separator
    expect(wrapper.text()).toContain((kyoto.dailyBudget * 7).toLocaleString('en-US'))
  })

  it('toggles the wishlist from the detail panel', async () => {
    const wrapper = await mountView('bali')
    const store = useDestinationsStore()

    expect(wrapper.text()).toContain('Save to shortlist')
    await wrapper.find('.panel button').trigger('click')

    expect(store.isWishlisted('bali')).toBe(true)
    expect(wrapper.text()).toContain('Saved to shortlist')
  })

  it('sends a pre-filled trip to the planner', async () => {
    const wrapper = await mountView('lisbon')
    const lisbon = findDestination('lisbon')!

    const planLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => (link.props().to as { path?: string })?.path === '/trips')

    expect(planLink!.props().to).toMatchObject({
      path: '/trips',
      query: {
        destination: 'Lisbon, Portugal',
        budget: String(lisbon.dailyBudget * 7),
      },
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

  it('renders the full guide: overview, areas, itinerary, food and day trips', async () => {
    const wrapper = await mountView('lisbon')
    const lisbon = findDestination('lisbon')!

    lisbon.overview.forEach((para) => expect(wrapper.text()).toContain(para))

    const areas = wrapper.findAll('.area')
    expect(areas).toHaveLength(lisbon.neighbourhoods.length)
    expect(areas[0].text()).toContain(lisbon.neighbourhoods[0].name)
    expect(areas[0].text()).toContain(lisbon.neighbourhoods[0].bestFor)

    const plans = wrapper.findAll('.plan')
    expect(plans).toHaveLength(3)
    expect(plans[0].text()).toContain(lisbon.sampleItinerary[0].title)
    expect(plans[0].text()).toContain(lisbon.sampleItinerary[0].morning)

    lisbon.foodPicks.forEach((item) => expect(wrapper.text()).toContain(item))
    lisbon.dayTrips.forEach((item) => expect(wrapper.text()).toContain(item))
  })

  it('renders the seasons and practical information', async () => {
    const wrapper = await mountView('hanoi')
    const hanoi = findDestination('hanoi')!

    expect(wrapper.findAll('.season')).toHaveLength(hanoi.seasons.length)
    expect(wrapper.text()).toContain(hanoi.seasons[0].note)

    const practical = wrapper.find('.practical').text()
    expect(practical).toContain(hanoi.practical.currency)
    expect(practical).toContain(hanoi.practical.plug)
    expect(practical).toContain(hanoi.practical.safety)
  })

  it('breaks the daily budget into four costed segments', async () => {
    const wrapper = await mountView('kyoto')
    const kyoto = findDestination('kyoto')!

    expect(wrapper.findAll('.bar .seg')).toHaveLength(4)

    // Only the largest line takes the Clay highlight; the rest stay neutral.
    expect(wrapper.findAll('.seg.leads')).toHaveLength(1)

    const legend = wrapper.findAll('.legend').map((row) => row.text())
    expect(legend[0]).toContain('Stay')
    expect(legend[0]).toContain(`$${kyoto.budgetBreakdown.stay}`)
    expect(legend[1]).toContain(`$${kyoto.budgetBreakdown.food}`)
    expect(legend[2]).toContain('Transport')
  })

  it('converts every price into the selected currency', async () => {
    const wrapper = await mountView('kyoto')
    const settings = useSettingsStore()

    settings.setCurrency('EUR')
    await wrapper.vm.$nextTick()

    // 145 USD daily at the fixed 0.92 rate
    expect(wrapper.find('.figures').text()).toContain('133')
    expect(wrapper.find('.figures').text()).toContain('€')
  })

  it('translates the section headings', async () => {
    const wrapper = await mountView('kyoto')
    const settings = useSettingsStore()

    expect(wrapper.text()).toContain('Where to base yourself')

    settings.setLocale('es')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Dónde alojarse')
    expect(wrapper.text()).toContain('Tres días perfectos')
  })

  it('flags the destination when it is in season', async () => {
    const wrapper = await mountView('kyoto')
    const store = useDestinationsStore()

    store.today = new Date('2026-11-15T12:00:00')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.season-flag').exists()).toBe(true)

    store.today = new Date('2026-07-15T12:00:00')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.season-flag').exists()).toBe(false)
  })
})
