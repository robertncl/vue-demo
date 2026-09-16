import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TripForm from '../travel/TripForm.vue'

describe('TripForm', () => {
  it('emits a trip draft and resets after submitting', async () => {
    const wrapper = mount(TripForm)

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
    expect((wrapper.find('#destination').element as HTMLInputElement).value).toBe('')
  })

  it('does not emit when required fields are missing', async () => {
    const wrapper = mount(TripForm)
    await wrapper.find('#destination').setValue('Oslo')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('create')).toBeUndefined()
  })

  it('applies a prefill from a destination page', () => {
    const wrapper = mount(TripForm, {
      props: { prefill: { destination: 'Bali, Indonesia', budget: 490 } },
    })

    expect((wrapper.find('#destination').element as HTMLInputElement).value).toBe('Bali, Indonesia')
    expect((wrapper.find('#budget').element as HTMLInputElement).value).toBe('490')
  })
})
