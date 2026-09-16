import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'
import DestinationCard from '../destinations/DestinationCard.vue'
import { destinations } from '@/data/destinations'

const destination = destinations[0]

function mountCard(wishlisted = false) {
  return mount(DestinationCard, {
    props: { destination, wishlisted },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('DestinationCard', () => {
  it('renders the destination summary details', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain(destination.name)
    expect(wrapper.text()).toContain(destination.country)
    expect(wrapper.text()).toContain(destination.tagline)
    expect(wrapper.text()).toContain(`$${destination.dailyBudget}`)
    destination.tags.forEach((tag) => expect(wrapper.text()).toContain(tag))
  })

  it('links to the destination detail route', () => {
    const wrapper = mountCard()
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props().to).toBe(`/destinations/${destination.slug}`)
  })

  it('emits toggleWishlist with the slug when starred', async () => {
    const wrapper = mountCard()

    await wrapper.find('.wish').trigger('click')

    expect(wrapper.emitted('toggleWishlist')).toEqual([[destination.slug]])
  })

  it('shows a filled star when already wishlisted', () => {
    expect(mountCard(true).find('.wish').text()).toBe('★')
    expect(mountCard(false).find('.wish').text()).toBe('☆')
  })
})
