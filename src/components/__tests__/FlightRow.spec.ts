import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FlightRow from '../flights/FlightRow.vue'
import { flightsOn } from '@/lib/flights'

const options = flightsOn('LHR', 'ZQN', '2026-11-10', 'economy', '2026-10-17')
const connecting = options.find((o) => o.stops >= 1)!

function mountRow(props: Partial<InstanceType<typeof FlightRow>['$props']> = {}) {
  return mount(FlightRow, {
    props: {
      option: connecting,
      total: 1234,
      priceNote: 'round trip',
      cabin: 'economy',
      actionLabel: 'Select flight',
      ...props,
    },
    global: { plugins: [createPinia()] },
  })
}

describe('FlightRow', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('summarises the flight in one accessible button', () => {
    const wrapper = mountRow()
    const summary = wrapper.find('button.summary')
    expect(summary.attributes('aria-expanded')).toBe('false')
    expect(summary.attributes('aria-label')).toMatch(/Leaves London at .+, arrives Queenstown at .+\$1,234 round trip/)
    expect(summary.text()).toContain('LHR–ZQN')
    expect(summary.text()).toContain(`${connecting.stops} stop`)
  })

  it('expands to show every leg and layover, then lets you select it', async () => {
    const wrapper = mountRow()
    expect(wrapper.find('.details').exists()).toBe(false)

    await wrapper.find('button.summary').trigger('click')
    expect(wrapper.find('button.summary').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.segment')).toHaveLength(connecting.segments.length)
    expect(wrapper.findAll('.layover')).toHaveLength(connecting.layovers.length)
    expect(wrapper.text()).toContain(connecting.segments[0]!.flightNumber)
    expect(wrapper.text()).toContain('Legroom')

    await wrapper.find('.select').trigger('click')
    expect(wrapper.emitted('select')).toEqual([[connecting]])
  })

  it('marks arrivals on a later local day', () => {
    const wrapper = mountRow()
    const offset = Math.floor(connecting.arrives / 1440) - Math.floor(connecting.departs / 1440)
    expect(offset).toBeGreaterThan(0)
    expect(wrapper.find('.when .offset').text()).toBe(`+${offset}`)
  })

  it('compares emissions with the median of the results', () => {
    const lower = mountRow({ medianEmissions: connecting.emissionsKg * 2 })
    expect(lower.text()).toContain('50% lower emissions')
    const typical = mountRow({ medianEmissions: connecting.emissionsKg })
    expect(typical.text()).toContain('Typical emissions')
  })

  it('can be shown open and without a select button', () => {
    const wrapper = mountRow({ open: true, actionLabel: undefined })
    expect(wrapper.find('.details').exists()).toBe(true)
    expect(wrapper.find('.select').exists()).toBe(false)
  })
})
