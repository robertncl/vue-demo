import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FlightSearchForm from '../flights/FlightSearchForm.vue'
import { useFlightsStore } from '@/stores/flights'
import type { FlightSearch } from '@/types/flights'

const TODAY = '2026-10-17'

function mountForm(initial: Partial<FlightSearch> | null = null) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useFlightsStore().today = TODAY
  return mount(FlightSearchForm, { props: { initial }, global: { plugins: [pinia] }, attachTo: document.body })
}

const field = (wrapper: ReturnType<typeof mountForm>, name: string) =>
  wrapper.find(`input[name="${name}"]`)

describe('FlightSearchForm', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('starts from the home airport with dates three and four weeks out', () => {
    const wrapper = mountForm()
    expect((field(wrapper, 'from').element as HTMLInputElement).value).toBe('New York (JFK)')
    expect((field(wrapper, 'depart').element as HTMLInputElement).value).toBe('2026-11-07')
    expect((field(wrapper, 'return').element as HTMLInputElement).value).toBe('2026-11-14')
  })

  it('emits a complete search and remembers it', async () => {
    const wrapper = mountForm({ from: 'LHR' })
    await field(wrapper, 'to').setValue('kix')
    await wrapper.find('form').trigger('submit')

    const [[search]] = wrapper.emitted('search') as [[FlightSearch]]
    expect(search).toEqual({
      trip: 'round',
      from: 'LHR',
      to: 'KIX',
      depart: '2026-11-07',
      return: '2026-11-14',
      adults: 1,
      children: 0,
      infants: 0,
      cabin: 'economy',
    })
    expect(useFlightsStore().lastSearch).toEqual(search)
  })

  it('keeps what you type while it passes through names that do and don’t resolve', async () => {
    const wrapper = mountForm()
    const from = field(wrapper, 'from')
    // "London" resolves to LHR; "London (" doesn't; "London (LHR)" does again.
    for (const text of ['L', 'London', 'London (', 'London (LH', 'London (LHR)']) {
      await from.setValue(text)
      expect((from.element as HTMLInputElement).value).toBe(text)
    }
    await field(wrapper, 'to').setValue('KIX')
    await wrapper.find('form').trigger('submit')
    const [[search]] = wrapper.emitted('search') as [[FlightSearch]]
    expect(search.from).toBe('LHR')
  })

  it('still follows outside changes after you have typed', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX' })
    await field(wrapper, 'from').setValue('Paris')
    await wrapper.find('.swap').trigger('click')
    expect((field(wrapper, 'from').element as HTMLInputElement).value).toBe('Osaka (KIX)')
    expect((field(wrapper, 'to').element as HTMLInputElement).value).toBe('Paris (CDG)')
  })

  it('accepts a city name and normalises it to the airport label on blur', async () => {
    const wrapper = mountForm()
    const to = field(wrapper, 'to')
    await to.setValue('Reykjavík')
    await to.trigger('blur')
    expect((to.element as HTMLInputElement).value).toBe('Reykjavík (KEF)')
  })

  it('flags an unknown airport once you leave the field', async () => {
    const wrapper = mountForm()
    const to = field(wrapper, 'to')
    await to.setValue('Atlantis')
    expect(to.attributes('aria-invalid')).toBe('false')
    await to.trigger('blur')
    expect(to.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('We don’t fly there yet')
  })

  it('lists problems, focuses the first and does not emit', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'LHR' })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('search')).toBeUndefined()
    expect(wrapper.find('[role="alert"]').text()).toContain('must be different')
    expect(document.activeElement).toBe(field(wrapper, 'to').element)
  })

  it('swaps origin and destination', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX' })
    await wrapper.find('.swap').trigger('click')
    expect((field(wrapper, 'from').element as HTMLInputElement).value).toBe('Osaka (KIX)')
    expect((field(wrapper, 'to').element as HTMLInputElement).value).toBe('London (LHR)')
  })

  it('moves the return with the departure, keeping the trip length', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX', depart: '2026-11-10', return: '2026-11-17' })
    const depart = field(wrapper, 'depart')
    await depart.setValue('2026-11-20')
    await depart.trigger('change')
    expect((field(wrapper, 'return').element as HTMLInputElement).value).toBe('2026-11-27')
  })

  it('hides the return date for one-way trips and leaves it out of the search', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX' })
    await wrapper.find('input[type="radio"][value="oneway"]').setValue(true)
    expect(field(wrapper, 'return').exists()).toBe(false)

    await wrapper.find('form').trigger('submit')
    const [[search]] = wrapper.emitted('search') as [[FlightSearch]]
    expect(search.trip).toBe('oneway')
    expect(search).not.toHaveProperty('return')
  })

  it('replaces stale dates from a remembered search with fresh ones', () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX', depart: '2026-01-01', return: '2026-01-08' })
    expect((field(wrapper, 'depart').element as HTMLInputElement).value).toBe('2026-11-07')
  })

  it('steps travellers within the booking rules', async () => {
    const wrapper = mountForm({ from: 'LHR', to: 'KIX' })
    const add = (kind: string) => wrapper.find(`[aria-label="Add ${kind}"]`)
    const remove = (kind: string) => wrapper.find(`[aria-label="Remove ${kind}"]`)

    // One adult can't be removed, and can't hold two infants.
    expect(remove('an adult').attributes('disabled')).toBeDefined()
    await add('an infant').trigger('click')
    expect(add('an infant').attributes('disabled')).toBeDefined()

    await add('a child').trigger('click')
    expect(wrapper.find('.popover-trigger').text()).toContain('3 travellers')

    await wrapper.find('form').trigger('submit')
    const [[search]] = wrapper.emitted('search') as [[FlightSearch]]
    expect(search).toMatchObject({ adults: 1, children: 1, infants: 1 })
  })
})
