import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import TripsView from '../TripsView.vue'
import { useTravelStore } from '@/stores/travel'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/trips', name: 'trips', component: TripsView }],
})

async function mountView(query: Record<string, string> = {}) {
  await router.push({ path: '/trips', query })
  await router.isReady()
  return mount(TripsView, {
    global: { plugins: [router, createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('TripsView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('shows the empty state when no trip is selected', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Select or create a trip to start planning the itinerary.')
    expect(wrapper.find('.itinerary').exists()).toBe(false)
  })

  it('pre-fills the form from destination query params', async () => {
    const wrapper = await mountView({ destination: 'Kyoto, Japan', budget: '1015' })

    expect((wrapper.find('#destination').element as HTMLInputElement).value).toBe('Kyoto, Japan')
    expect((wrapper.find('#budget').element as HTMLInputElement).value).toBe('1015')
  })

  it('ignores an invalid budget query param', async () => {
    const wrapper = await mountView({ destination: 'Oslo', budget: 'abc' })
    expect((wrapper.find('#budget').element as HTMLInputElement).value).toBe('500')
  })

  it('creates a trip and shows its itinerary with a costed activity', async () => {
    const wrapper = await mountView()
    const travel = useTravelStore()

    await wrapper.find('#destination').setValue('Lisbon, Portugal')
    await wrapper.find('#startDate').setValue('2026-05-01')
    await wrapper.find('#endDate').setValue('2026-05-03')
    await wrapper.find('#budget').setValue(300)
    await wrapper.find('.trip-form').trigger('submit')

    expect(travel.trips).toHaveLength(1)
    expect(wrapper.find('.trip-card').classes()).toContain('active')
    expect(wrapper.find('.itinerary').text()).toContain('Lisbon, Portugal')
    expect(wrapper.find('.itinerary').text()).toContain('3 day trip')

    await wrapper.find('.activity-form input[type="text"]').setValue('Tram 28')
    await wrapper.findAll('.activity-form input[type="number"]')[1].setValue(20)
    await wrapper.find('.activity-form').trigger('submit')

    expect(travel.spentAmount).toBe(20)
    expect(wrapper.find('.budget').text()).toContain('$280')
    expect(wrapper.find('.day-group').text()).toContain('Tram 28')
  })

  it('removes a trip and returns to the empty state', async () => {
    const wrapper = await mountView()
    const travel = useTravelStore()
    travel.addTrip({
      destination: 'Oslo',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      budget: 100,
    })
    await wrapper.vm.$nextTick()

    await wrapper.find('.trip-card .remove').trigger('click')

    expect(travel.trips).toHaveLength(0)
    expect(wrapper.text()).toContain('Select or create a trip')
  })
})
