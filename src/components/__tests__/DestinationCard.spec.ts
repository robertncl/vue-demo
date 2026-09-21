import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DestinationCard from '../destinations/DestinationCard.vue'
import { destinations } from '@/data/destinations'
import { useSettingsStore } from '@/stores/settings'

const destination = destinations[0]

function mountCard(props: Record<string, unknown> = {}) {
  return mount(DestinationCard, {
    props: { destination, ...props },
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('DestinationCard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders the destination summary details', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain(destination.name)
    expect(wrapper.text()).toContain(destination.country)
    expect(wrapper.text()).toContain(destination.tagline)
    expect(wrapper.text()).toContain(`$${destination.dailyBudget}`)
  })

  it('links to the destination detail route', () => {
    const wrapper = mountCard()
    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links.some((l) => l.props().to === `/destinations/${destination.slug}`)).toBe(true)
  })

  it('emits toggleWishlist with the slug when saved', async () => {
    const wrapper = mountCard()

    await wrapper.find('.wish').trigger('click')

    expect(wrapper.emitted('toggleWishlist')).toEqual([[destination.slug]])
  })

  it('labels the save button with the current state', () => {
    expect(mountCard({ wishlisted: true }).find('.wish').text()).toBe('Saved')
    expect(mountCard({ wishlisted: false }).find('.wish').text()).toBe('Save')
  })

  it('shows an in-season badge only when flagged', () => {
    expect(mountCard({ inSeason: true }).find('.season').exists()).toBe(true)
    expect(mountCard({ inSeason: false }).find('.season').exists()).toBe(false)
  })

  it('converts the price into the selected currency', async () => {
    const wrapper = mountCard()
    const settings = useSettingsStore()

    settings.setCurrency('EUR')
    await wrapper.vm.$nextTick()

    // 145 USD at the fixed 0.92 reference rate
    expect(wrapper.find('.price').text()).toContain('133')
    expect(wrapper.find('.price').text()).toContain('€')
  })

  it('translates region and tag labels with the selected language', async () => {
    const wrapper = mountCard()
    const settings = useSettingsStore()

    expect(wrapper.find('.region').text()).toBe('Asia')

    settings.setLocale('fr')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.region').text()).toBe('Asie')
    expect(wrapper.find('.tags').text()).toContain('gastronomie')
  })
})
