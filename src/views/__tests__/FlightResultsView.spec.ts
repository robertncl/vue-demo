import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import FlightResultsView from '../FlightResultsView.vue'
import { useFlightsStore } from '@/stores/flights'
import { flightsOn } from '@/lib/flights'

const TODAY = '2026-10-17'
const base = {
  trip: 'round',
  from: 'JFK',
  to: 'LIS',
  depart: '2026-11-10',
  return: '2026-11-17',
  adults: '1',
  cabin: 'economy',
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/flights', name: 'flights', component: FlightResultsView },
    { path: '/flights/booking', name: 'booking', component: { template: '<div />' } },
  ],
})

async function mountView(query: Record<string, string>) {
  await router.push({ path: '/flights', query })
  await router.isReady()
  const pinia = createPinia()
  setActivePinia(pinia)
  useFlightsStore().today = TODAY
  const wrapper = mount(FlightResultsView, {
    global: { plugins: [router, pinia], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  return wrapper
}

describe('FlightResultsView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('lists departing flights for the searched route, top flights first', async () => {
    const wrapper = await mountView(base)
    const options = flightsOn('JFK', 'LIS', '2026-11-10', 'economy', TODAY)

    expect(wrapper.find('h1').text()).toBe('New York to Lisbon')
    expect(wrapper.text()).toContain('Top departing flights')
    expect(wrapper.text()).toContain('round trip')

    // Three top flights and the first ten others; the rest wait behind "show more".
    expect(options.length).toBeGreaterThan(13)
    expect(wrapper.findAll('.flight-row')).toHaveLength(13)
    const more = wrapper.find('.list-section .show-more')
    expect(more.text()).toBe(`Show ${options.length - 13} more flight${options.length - 13 > 1 ? 's' : ''}`)
    await more.trigger('click')
    expect(wrapper.findAll('.flight-row')).toHaveLength(options.length)
  })

  it('narrows the list with a filter and can clear it', async () => {
    const wrapper = await mountView(base)
    await wrapper.find('.list-section .show-more').trigger('click')
    const all = wrapper.findAll('.flight-row').length

    await wrapper.find('input[type="radio"][value="0"]').setValue(true)
    const nonstop = wrapper.findAll('.flight-row').length
    expect(nonstop).toBeGreaterThan(0)
    expect(nonstop).toBeLessThan(all)
    expect(wrapper.text()).toContain('Nonstop only')

    await wrapper.find('.filter-bar .clear').trigger('click')
    expect(wrapper.findAll('.flight-row')).toHaveLength(all)
  })

  it('re-sorts cheapest first', async () => {
    const wrapper = await mountView(base)
    await wrapper.find('input[name="sort"][value="cheapest"]').setValue(true)

    expect(wrapper.text()).toContain('Cheapest first')
    const prices = wrapper
      .findAll('.flight-row .price .amount')
      .map((el) => Number(el.text().replace(/[^\d]/g, '')))
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('moves to the returning step after a departing flight is selected', async () => {
    const wrapper = await mountView(base)
    await wrapper.find('.flight-row button.summary').trigger('click')
    await wrapper.find('.flight-row .select').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.out).toBeTruthy()
    expect(wrapper.text()).toContain('Your departing flight')
    expect(wrapper.text()).toContain('Top returning flights')
    expect(wrapper.find('.steps [aria-current="step"]').text()).toContain('Returning flight')
  })

  it('sends a one-way selection straight to booking', async () => {
    const wrapper = await mountView({ ...base, trip: 'oneway' })
    await wrapper.find('.flight-row button.summary').trigger('click')
    await wrapper.find('.flight-row .select').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/flights/booking')
    expect(wrapper.text()).not.toContain('Returning flight')
  })

  it('re-dates the search from the date strip, keeping the trip length', async () => {
    const wrapper = await mountView(base)
    const days = wrapper.findAll('.date-strip .day')
    expect(days).toHaveLength(7)
    expect(days[3]!.attributes('aria-current')).toBe('date')

    await days[4]!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toMatchObject({ depart: '2026-11-11', return: '2026-11-18' })
  })

  it('tracks the search from the switch', async () => {
    const wrapper = await mountView(base)
    await wrapper.find('.track input[type="checkbox"]').setValue(true)
    expect(useFlightsStore().tracked).toHaveLength(1)
    expect(wrapper.text()).toContain('You’re tracking this search.')
  })

  it('opens the date grid and price graph in dialogs', async () => {
    const wrapper = await mountView(base)
    const [grid, graph] = wrapper.findAll('.tool-buttons button')

    await grid!.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.date-grid tbody tr')).toHaveLength(7)

    await graph!.trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.price-graph .slot')).toHaveLength(60)
  })

  it('explains what is wrong with a bad link instead of showing results', async () => {
    const wrapper = await mountView({ ...base, to: 'ZZZ', adults: '12' })
    expect(wrapper.find('.flight-row').exists()).toBe(false)
    const alert = wrapper.find('[role="alert"]').text()
    expect(alert).toContain('Choose where you’re flying to.')
    expect(alert).toContain('Check the travellers')
  })
})
