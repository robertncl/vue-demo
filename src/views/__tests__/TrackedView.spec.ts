import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TrackedView from '../TrackedView.vue'
import ExploreView from '../ExploreView.vue'
import { useFlightsStore } from '@/stores/flights'
import type { FlightSearch } from '@/types/flights'

const TODAY = '2026-10-17'

const search: FlightSearch = {
  trip: 'round',
  from: 'LHR',
  to: 'KIX',
  depart: '2026-11-10',
  return: '2026-11-17',
  adults: 1,
  children: 0,
  infants: 0,
  cabin: 'economy',
}

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const flights = useFlightsStore()
  flights.today = TODAY
  return { pinia, flights }
}

const stubs = { RouterLink: RouterLinkStub }

describe('TrackedView', () => {
  beforeEach(() => localStorage.clear())

  it('invites you to track a search when there are none', () => {
    const { pinia } = setup()
    const wrapper = mount(TrackedView, { global: { plugins: [pinia], stubs } })
    expect(wrapper.text()).toContain('No tracked flights yet')
  })

  it('shows today’s price, the change and a 30-day history for each search', () => {
    const { pinia, flights } = setup()
    flights.track(search)
    flights.tracked[0]!.priceAtTrack += 50

    const wrapper = mount(TrackedView, { global: { plugins: [pinia], stubs } })
    expect(wrapper.find('h2').text()).toBe('London to Osaka')
    expect(wrapper.text()).toContain('Down $50')
    expect(wrapper.findAll('.history .table-view tbody tr')).toHaveLength(30)
  })

  it('stops tracking', async () => {
    const { pinia, flights } = setup()
    flights.track(search)
    const wrapper = mount(TrackedView, { global: { plugins: [pinia], stubs } })
    await wrapper.find('[aria-label="Stop tracking London to Osaka"]').trigger('click')
    expect(flights.tracked).toHaveLength(0)
  })

  it('marks searches whose trip has already left', () => {
    const { pinia, flights } = setup()
    flights.tracked = [{ id: 'old', search, trackedOn: '2026-10-01', priceAtTrack: 900 }]
    flights.today = '2026-11-20'
    const wrapper = mount(TrackedView, { global: { plugins: [pinia], stubs } })
    expect(wrapper.text()).toContain('This trip has departed')
  })
})

describe('ExploreView', () => {
  beforeEach(() => localStorage.clear())

  it('prices destinations from your airport, cheapest first', async () => {
    const { pinia, flights } = setup()
    flights.remember(search)
    const wrapper = mount(ExploreView, { global: { plugins: [pinia], stubs } })

    expect(wrapper.find('h1').text()).toBe('Where can you go from London?')
    const cards = wrapper.findAll('.deal-card')
    expect(cards.length).toBeGreaterThan(5)
    const prices = cards.map((card) => Number(card.find('.amount').text().replace(/[^\d]/g, '')))
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('filters by region and nonstop', async () => {
    const { pinia, flights } = setup()
    flights.remember(search)
    const wrapper = mount(ExploreView, { global: { plugins: [pinia], stubs } })
    const all = wrapper.findAll('.deal-card').length

    await wrapper.find('select[name="region"]').setValue('Europe')
    const europe = wrapper.findAll('.deal-card')
    expect(europe.length).toBeLessThan(all)
    expect(europe.every((card) => card.text().includes('Europe'))).toBe(true)

    await wrapper.find('input[name="nonstop"]').setValue(true)
    expect(wrapper.findAll('.deal-card').length).toBeLessThanOrEqual(europe.length)
  })
})
