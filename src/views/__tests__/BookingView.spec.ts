import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BookingView from '../BookingView.vue'
import { useFlightsStore } from '@/stores/flights'
import { useTravelStore } from '@/stores/travel'
import { fareBreakdown, flightsOn } from '@/lib/flights'
import { findDestination } from '@/data/destinations'

const TODAY = '2026-10-17'
const out = flightsOn('LHR', 'KIX', '2026-11-10', 'economy', TODAY)[0]!
const ret = flightsOn('KIX', 'LHR', '2026-11-17', 'economy', TODAY)[1]!
const query = {
  trip: 'round',
  from: 'LHR',
  to: 'KIX',
  depart: '2026-11-10',
  return: '2026-11-17',
  adults: '2',
  children: '1',
  cabin: 'economy',
  out: out.id,
  ret: ret.id,
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/flights/booking', component: BookingView },
    { path: '/trips', component: { template: '<div />' } },
  ],
})

async function mountView(q: Record<string, string>) {
  await router.push({ path: '/flights/booking', query: q })
  await router.isReady()
  const pinia = createPinia()
  setActivePinia(pinia)
  useFlightsStore().today = TODAY
  const wrapper = mount(BookingView, {
    global: { plugins: [router, pinia], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  return wrapper
}

describe('BookingView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('itemises the fare for each kind of traveller', async () => {
    const wrapper = await mountView(query)
    const breakdown = fareBreakdown([out.fare, ret.fare], { adults: 2, children: 1, infants: 0 })

    const rows = wrapper.findAll('.fares tbody tr').map((row) => row.text())
    expect(rows).toHaveLength(2)
    expect(rows[0]).toContain('2 adults')
    expect(rows[1]).toContain('1 child')
    expect(wrapper.find('.fares .total').text()).toBe(`$${breakdown.total.toLocaleString('en-US')}`)
    expect(wrapper.findAll('.flight-row .details')).toHaveLength(2)
  })

  it('turns the booking into a trip with the flights on the itinerary', async () => {
    const wrapper = await mountView(query)
    await wrapper.find('.actions .acme-btn--primary').trigger('click')
    await flushPromises()

    const travel = useTravelStore()
    const trip = travel.selectedTrip!
    const kyoto = findDestination('kyoto')!
    const total = fareBreakdown([out.fare, ret.fare], { adults: 2, children: 1, infants: 0 }).total

    expect(trip).toMatchObject({
      destination: 'Kyoto, Japan',
      startDate: '2026-11-10',
      endDate: '2026-11-17',
      budget: total + kyoto.dailyBudget * 7 * 3,
    })
    expect(trip.activities.map((a) => a.day)).toEqual([1, 8])
    expect(trip.activities[0]!.title).toContain('LHR → KIX')
    expect(trip.activities.reduce((sum, a) => sum + a.cost, 0)).toBe(total)
    expect(router.currentRoute.value.path).toBe('/trips')
  })

  it('says so when a link points at a flight that no longer exists', async () => {
    const wrapper = await mountView({ ...query, out: 'XX1+XX2' })
    expect(wrapper.text()).toContain('That flight is no longer available')
    expect(wrapper.find('.fares').exists()).toBe(false)
  })
})
