import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TheWelcome from '../TheWelcome.vue'

describe('TheWelcome', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders each welcome section heading', () => {
    const wrapper = mount(TheWelcome)
    const headings = wrapper.findAll('h3').map((h) => h.text())
    expect(headings).toEqual([
      'Documentation',
      'Tooling',
      'Ecosystem',
      'Community',
      'Support Vue',
    ])
  })

  it('requests the README be opened in the editor when clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(TheWelcome)
    await wrapper.get('button').trigger('click')

    expect(fetchMock).toHaveBeenCalledWith('/__open-in-editor?file=README.md')
  })
})
