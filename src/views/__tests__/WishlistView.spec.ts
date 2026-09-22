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
    expect(wrapper.text()).toContain('Nothing saved yet')
    expect(wrapper.findAll('.saved-row')).toHaveLength(0)
  })

  it('compares saved destinations in a table and removes them again', async () => {
    const wrapper = mountView()
    const store = useDestinationsStore()

    store.toggleWishlist('bali')
    store.toggleWishlist('kyoto')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('.saved-row')
    expect(rows).toHaveLength(2)
    expect(wrapper.text()).toContain('Bali')
    // Daily and weekly budgets sit side by side for comparison.
    expect(rows[0].text()).toContain('$70')
    expect(rows[0].text()).toContain('$490')

    await wrapper.find('.saved-row .wish').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.saved-row')).toHaveLength(1)
  })
})
