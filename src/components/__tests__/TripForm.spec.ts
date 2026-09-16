import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TripForm from '../travel/TripForm.vue'
import { useSettingsStore } from '@/stores/settings'

function mountForm(props: Record<string, unknown> = {}) {
  return mount(TripForm, { props, global: { plugins: [createPinia()] } })
}

function valueOf(wrapper: ReturnType<typeof mountForm>, selector: string) {
  return (wrapper.find(selector).element as HTMLInputElement).value
}

describe('TripForm', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('emits a trip draft and resets after submitting', async () => {
    const wrapper = mountForm()

    await wrapper.find('#destination').setValue('Lisbon, Portugal')
    await wrapper.find('#startDate').setValue('2026-05-01')
    await wrapper.find('#endDate').setValue('2026-05-06')
    await wrapper.find('#budget').setValue(800)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('create')![0][0]).toEqual({
      destination: 'Lisbon, Portugal',
      startDate: '2026-05-01',
      endDate: '2026-05-06',
      budget: 800,
    })
    expect(valueOf(wrapper, '#destination')).toBe('')
  })

  it('does not emit when required fields are missing', async () => {
    const wrapper = mountForm()
    await wrapper.find('#destination').setValue('Oslo')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('create')).toBeUndefined()
  })

  it('applies a prefill and shows the budget in the active currency', () => {
    const wrapper = mountForm({ prefill: { destination: 'Bali, Indonesia', budget: 490 } })

    expect(valueOf(wrapper, '#destination')).toBe('Bali, Indonesia')
    expect(valueOf(wrapper, '#budget')).toBe('490')
  })

  it('re-denominates the budget field when the currency changes', async () => {
    const wrapper = mountForm({ prefill: { destination: 'Kyoto', budget: 1000 } })
    const settings = useSettingsStore()

    expect(valueOf(wrapper, '#budget')).toBe('1000')

    settings.setCurrency('EUR')
    await wrapper.vm.$nextTick()

    expect(valueOf(wrapper, '#budget')).toBe('920')
  })

  it('converts the entered budget back to USD when submitting', async () => {
    const wrapper = mountForm()
    const settings = useSettingsStore()
    settings.setCurrency('GBP')
    await wrapper.vm.$nextTick()

    await wrapper.find('#destination').setValue('London')
    await wrapper.find('#startDate').setValue('2026-05-01')
    await wrapper.find('#endDate').setValue('2026-05-06')
    await wrapper.find('#budget').setValue(790)
    await wrapper.find('form').trigger('submit')

    // 790 GBP at the fixed 0.79 rate is 1000 USD
    expect((wrapper.emitted('create')![0][0] as { budget: number }).budget).toBeCloseTo(1000, 6)
  })

  it('labels the budget field with the active currency code', async () => {
    const wrapper = mountForm()
    const settings = useSettingsStore()

    expect(wrapper.find('label[for="budget"]').text()).toContain('USD')

    settings.setCurrency('JPY')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('label[for="budget"]').text()).toContain('JPY')
  })
})
