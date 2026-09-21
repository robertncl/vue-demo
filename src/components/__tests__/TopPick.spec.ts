import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TopPick from '../destinations/TopPick.vue'
import { useDestinationsStore } from '@/stores/destinations'
import { useSettingsStore } from '@/stores/settings'

function mountPick() {
  return mount(TopPick, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('TopPick', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('names the current month in the kicker', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()

    store.today = new Date('2026-11-15T12:00:00')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Top pick for November')
  })

  it('shows the headline pick with its reason for the month', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()

    store.today = new Date('2026-11-15T12:00:00')
    await wrapper.vm.$nextTick()

    const pick = store.topPick!
    expect(wrapper.find('.detail h2').text()).toBe(pick.name)
    expect(wrapper.text()).toContain(store.noteForMonth(pick))
    expect(wrapper.find('.season-flag').exists()).toBe(true)
  })

  it('links to the guide and to a pre-filled trip', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()

    store.today = new Date('2026-11-15T12:00:00')
    await wrapper.vm.$nextTick()

    const pick = store.topPick!
    const links = wrapper.findAllComponents(RouterLinkStub)
    const guideLink = links.find((l) => l.props().to === `/destinations/${pick.slug}`)
    const planLink = links.find(
      (l) =>
        typeof l.props().to === 'object' && (l.props().to as { path: string }).path === '/trips',
    )

    expect(guideLink).toBeDefined()
    expect(planLink!.props().to).toMatchObject({
      path: '/trips',
      query: {
        destination: `${pick.name}, ${pick.country}`,
        budget: String(pick.dailyBudget * 7),
      },
    })
  })

  it('lists three runners-up', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()

    store.today = new Date('2026-05-15T12:00:00')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.runner')).toHaveLength(3)
  })

  it('drops the season badge when the pick is not peaking', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()

    store.today = new Date('2026-08-15T12:00:00')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.season-flag').exists()).toBe(false)
  })

  it('translates and converts with the active settings', async () => {
    const wrapper = mountPick()
    const store = useDestinationsStore()
    const settings = useSettingsStore()

    store.today = new Date('2026-11-15T12:00:00')
    settings.setLocale('fr')
    settings.setCurrency('EUR')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Choix du mois de novembre')
    expect(wrapper.find('.figures').text()).toContain('€')
  })
})
