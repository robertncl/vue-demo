import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WishlistView from '../WishlistView.vue'
import { useDestinationsStore } from '@/stores/destinations'

function mountView() {
  return mount(WishlistView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('WishlistView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('shows an empty state when nothing is saved', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('No saved destinations yet')
    expect(wrapper.findAll('.destination-card')).toHaveLength(0)
  })

  it('lists saved destinations and removes them when unstarred', async () => {
    const wrapper = mountView()
    const store = useDestinationsStore()

    store.toggleWishlist('bali')
    store.toggleWishlist('kyoto')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.destination-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Bali')

    await wrapper.find('.destination-card .wish').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.destination-card')).toHaveLength(1)
  })
})
