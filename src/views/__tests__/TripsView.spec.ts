import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
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
    expect(wrapper.text()).toContain(
      'Pick a trip on the left, or start one from a flight or a destination guide.',
    )
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
    expect(wrapper.find('.itinerary').text()).toContain('3 days')

    await wrapper.find('.activity-form input[type="text"]').setValue('Tram 28')
    await wrapper.findAll('.activity-form input[type="number"]')[1].setValue(20)
    await wrapper.find('.activity-form').trigger('submit')

    expect(travel.spentAmount).toBe(20)
    expect(wrapper.find('.budget').text()).toContain('$280')
    expect(wrapper.find('.day-group').text()).toContain('Tram 28')
  })

  it('asks before deleting a trip, then returns to the empty state', async () => {
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
    await flushPromises()

    // Nothing is deleted until the confirmation, which names the trip.
    expect(travel.trips).toHaveLength(1)
    const confirm = wrapper.find('dialog .acme-btn--danger')
    expect(confirm.text()).toBe('Delete the trip to Oslo')

    await confirm.trigger('click')
    await flushPromises()

    expect(travel.trips).toHaveLength(0)
    expect(wrapper.text()).toContain('No trip selected')
  })

  it('keeps the trip when the deletion is cancelled', async () => {
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
    await flushPromises()
    await wrapper.find('dialog .acme-btn--secondary').trigger('click')
    await flushPromises()

    expect(travel.trips).toHaveLength(1)
    expect(wrapper.find('dialog .acme-btn--danger').exists()).toBe(false)
  })

  describe('over-budget warning and status badges', () => {
    const draft = (destination: string, budget: number) => ({
      destination,
      startDate: '2099-03-01',
      endDate: '2099-03-05',
      budget,
    })
    const activity = (cost: number) => ({ day: 1, time: '10:00', title: 'Dinner', cost })

    it('shows no warning while every trip fits its budget', async () => {
      const wrapper = await mountView()
      const travel = useTravelStore()
      travel.addTrip(draft('Lisbon', 300))
      travel.addActivity(activity(120))
      await flushPromises()

      expect(wrapper.find('.over-alert').exists()).toBe(false)
      expect(wrapper.find('.trip-card .acme-badge--success').text()).toBe('On budget')
    })

    it('warns about one over-budget trip with its figures and a way to open it', async () => {
      const wrapper = await mountView()
      const travel = useTravelStore()
      const kyoto = travel.addTrip(draft('Kyoto', 200))
      travel.addActivity(activity(250))
      travel.addTrip(draft('Lisbon', 300))
      await flushPromises()

      const alert = wrapper.find('.over-alert')
      expect(alert.classes()).toContain('acme-alert--warning')
      expect(alert.attributes('role')).toBe('status')
      expect(alert.text()).toContain('Kyoto is over budget')
      expect(alert.text()).toContain('$250')
      expect(alert.text()).toContain('$50')

      await alert.find('.over-open').trigger('click')
      expect(travel.selectedTripId).toBe(kyoto.id)
      expect(wrapper.find('.over-open').exists()).toBe(false)

      const badges = wrapper.findAll('.trip-card .acme-badge').map((b) => b.text())
      expect(badges).toEqual(['Over budget', 'Planning'])
      expect(wrapper.find('.trip-card .acme-badge--warning svg').exists()).toBe(true)
    })

    it('names every trip when several are over budget', async () => {
      const wrapper = await mountView()
      const travel = useTravelStore()
      travel.addTrip(draft('Kyoto', 100))
      travel.addActivity(activity(150))
      travel.addTrip(draft('Oslo', 100))
      travel.addActivity(activity(150))
      await flushPromises()

      const alert = wrapper.find('.over-alert')
      expect(alert.text()).toContain('2 trips are over budget')
      expect(alert.text()).toContain('Kyoto, Oslo')
      expect(alert.find('.over-open').exists()).toBe(false)
    })
  })
})
