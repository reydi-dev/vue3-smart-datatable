import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import PipelineProbe from '../../src/components/PipelineProbe.vue'

test('the pipeline compiles and mounts a reactive Vue SFC', async () => {
  const wrapper = mount(PipelineProbe)
  try {
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('button').text()).toBe('Probe clicks: 1')
  } finally {
    wrapper.unmount()
  }
})
