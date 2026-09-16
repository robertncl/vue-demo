import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ItineraryPlanner from '../travel/ItineraryPlanner.vue'
import type { Trip } from '@/types/travel'

const trip: Trip = {
  id: 't1',
  destination: 'Kyoto, Japan',
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  budget: 500,
  activities: [
    { id: 'a1', day: 2, time: '10:00', title: 'Arashiyama', cost: 30 },
    { id: 'a2', day: 1, time: '08:00', title: 'Fushimi Inari', cost: 0 },
    { id: 'a3', day: 1, time: '19:00', title: 'Gion dinner', cost: 120 },
  ],
}

function mountPlanner(overrides = {}) {
  return mount(ItineraryPlanner, {
    props: {
      trip,
      spentAmount: 150,
      remainingBudget: 350,
      durationDays: 3,
      budgetUsedPercent: 30,
      ...overrides,
    },
  })
}

describe('ItineraryPlanner', () => {
  it('groups activities by day in order with a day total', () => {
    const wrapper = mountPlanner()
    const groups = wrapper.findAll('.day-group')

    expect(groups).toHaveLength(2)
    expect(groups[0].text()).toContain('Day 1')
    expect(groups[0].text()).toContain('$120')
    expect(groups[1].text()).toContain('Day 2')
    expect(groups[1].text()).toContain('Arashiyama')
  })

  it('shows the budget breakdown', () => {
    const wrapper = mountPlanner()
    expect(wrapper.find('.budget').text()).toContain('Remaining')
    expect(wrapper.find('.budget').text()).toContain('$350')
    expect(wrapper.find('.bar span').attributes('style')).toContain('width: 30%')
  })

  it('flags an over-budget trip', () => {
    const wrapper = mountPlanner({ remainingBudget: -75, budgetUsedPercent: 100 })
    expect(wrapper.find('.budget').classes()).toContain('over')
    expect(wrapper.find('.budget').text()).toContain('Over by')
    expect(wrapper.find('.budget').text()).toContain('$75')
  })

  it('emits addActivity and clears the form', async () => {
    const wrapper = mountPlanner()

    await wrapper.find('.activity-form input[type="text"]').setValue('Nishiki market')
    await wrapper.findAll('.activity-form input[type="number"]')[1].setValue(25)
    await wrapper.find('.activity-form').trigger('submit')

    const emitted = wrapper.emitted('addActivity')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toMatchObject({ title: 'Nishiki market', cost: 25, day: 1 })
    expect(
      (wrapper.find('.activity-form input[type="text"]').element as HTMLInputElement).value,
    ).toBe('')
  })

  it('does not emit when the title is empty', async () => {
    const wrapper = mountPlanner()
    await wrapper.find('.activity-form').trigger('submit')
    expect(wrapper.emitted('addActivity')).toBeUndefined()
  })

  it('emits removeActivity with the activity id', async () => {
    const wrapper = mountPlanner()
    await wrapper.find('.day-group .remove').trigger('click')
    expect(wrapper.emitted('removeActivity')).toEqual([['a2']])
  })

  it('shows an empty state when there is nothing planned', () => {
    const wrapper = mountPlanner({ trip: { ...trip, activities: [] } })
    expect(wrapper.text()).toContain('No activities planned yet')
  })
})
