import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('increments the count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    counter.increment()
    expect(counter.count).toBe(1)
  })

  it('decrements the count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    counter.decrement()
    expect(counter.count).toBe(-1)
  })

  it('doubles the count', () => {
    const counter = useCounterStore()
    expect(counter.doubleCount).toBe(0)
    counter.increment()
    counter.increment()
    expect(counter.doubleCount).toBe(4)
  })
})