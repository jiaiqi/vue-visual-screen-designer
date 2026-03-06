// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PreviewView from '@/views/PreviewView.vue'

const createMemoryStorage = () => {
  const data = new Map<string, string>()

  return {
    getItem(key: string) {
      return data.has(key) ? (data.get(key) as string) : null
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    },
    removeItem(key: string) {
      data.delete(key)
    },
    clear() {
      data.clear()
    },
  }
}

describe('PreviewView', () => {
  beforeEach(() => {
    if (!('localStorage' in globalThis)) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: createMemoryStorage(),
        configurable: true,
      })
    }

    localStorage.clear()
  })

  it('renders nodes and edges from preview schema data', async () => {
    localStorage.setItem(
      'v2_preview_schema_data',
      JSON.stringify({
        version: '2.1',
        canvas: {
          width: 800,
          height: 600,
          background: '#0f172a',
        },
        nodes: [
          {
            id: 'n1',
            type: 'rect',
            layout: { x: 10, y: 20, width: 100, height: 80, zIndex: 1 },
            style: { background: '#111', borderColor: '#222' },
          },
          {
            id: 'n2',
            type: 'circle',
            layout: { x: 320, y: 160, width: 80, height: 80, zIndex: 1 },
            style: { background: '#333', borderColor: '#444' },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            target: 'n2',
            style: { stroke: '#38bdf8', strokeWidth: 2 },
          },
        ],
      }),
    )

    const wrapper = mount(PreviewView)
    await nextTick()

    expect(wrapper.findAll('.node-item')).toHaveLength(2)
    expect(wrapper.findAll('path')).toHaveLength(1)
  })
})
