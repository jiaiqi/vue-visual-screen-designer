<script setup lang="ts">
import { ref, watch } from 'vue'
import { Node } from '@antv/x6'
import { Plus, Trash2, Circle, ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

interface PortConfig {
  id: string
  group: string
  position: 'top' | 'right' | 'bottom' | 'left'
  type: 'input' | 'output' | 'both'
  fill: string
  stroke: string
  radius: number
  magnet: boolean
}

const portPositions = ['top', 'right', 'bottom', 'left'] as const
const portTypes = ['input', 'output', 'both'] as const

const ports = ref<PortConfig[]>([])

const positionIconMap = {
  top: ArrowUp,
  right: ArrowRight,
  bottom: ArrowDown,
  left: ArrowLeft,
}

const typeColorMap = {
  input: 'var(--color-accent-emerald)',
  output: 'var(--theme-primary)',
  both: 'var(--color-accent-indigo)',
}

const defaultPortFill = 'var(--color-bg-secondary)'
const defaultPortStroke = 'var(--theme-primary)'

const loadPorts = () => {
  const nodePorts = props.node.getPorts()
  const portConfigs: PortConfig[] = []

  nodePorts.forEach((port) => {
    const portId = port.id
    if (portId) {
      portConfigs.push({
        id: portId,
        group: port.group || 'top',
        position: (port.group as PortConfig['position']) || 'top',
        type: 'both',
        fill: defaultPortFill,
        stroke: defaultPortStroke,
        radius: 4,
        magnet: true,
      })
    }
  })

  if (portConfigs.length === 0) {
    portConfigs.push(
      { id: 'port_top', group: 'top', position: 'top', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
      { id: 'port_right', group: 'right', position: 'right', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
      { id: 'port_bottom', group: 'bottom', position: 'bottom', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
      { id: 'port_left', group: 'left', position: 'left', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true }
    )
  }

  ports.value = portConfigs
}

watch(() => props.node, loadPorts, { immediate: true })

const addPort = () => {
  const newPort: PortConfig = {
    id: `port_${Date.now()}`,
    group: 'top',
    position: 'top',
    type: 'both',
    fill: defaultPortFill,
    stroke: defaultPortStroke,
    radius: 4,
    magnet: true,
  }
  ports.value.push(newPort)
  applyPorts()
}

const removePort = (index: number) => {
  ports.value.splice(index, 1)
  applyPorts()
}

const updatePort = (index: number, key: keyof PortConfig, value: string | number | boolean) => {
  const port = ports.value[index]
  if (port) {
    (port as Record<string, unknown>)[key] = value
    if (key === 'position') {
      port.group = value as string
    }
    applyPorts()
  }
}

const applyPorts = () => {
  const groups: Record<string, { position: string; attrs: { circle: { r: number; magnet: boolean; stroke: string; fill: string } } }> = {}

  ports.value.forEach((port) => {
    if (!groups[port.group]) {
      groups[port.group] = {
        position: port.group,
        attrs: {
          circle: {
            r: port.radius,
            magnet: port.magnet,
            stroke: port.stroke,
            fill: port.fill,
          },
        },
      }
    }
  })

  const items = ports.value.map((port) => ({
    id: port.id,
    group: port.group,
  }))

  props.node.prop('ports', {
    groups,
    items,
  })

  emit('update')
}

const resetToDefault = () => {
  ports.value = [
    { id: 'port_top', group: 'top', position: 'top', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
    { id: 'port_right', group: 'right', position: 'right', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
    { id: 'port_bottom', group: 'bottom', position: 'bottom', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true },
    { id: 'port_left', group: 'left', position: 'left', type: 'both', fill: defaultPortFill, stroke: defaultPortStroke, radius: 4, magnet: true }
  ]
  applyPorts()
}
</script>

<template>
  <div class="port-config-panel">
    <div class="panel-header">
      <h4 class="panel-title mb-3">连接桩配置</h4>
      <div class="flex gap-1">
        <button
          @click="addPort"
          class="icon-btn"
          title="添加连接桩">
          <Plus class="w-3.5 h-3.5" />
        </button>
        <button
          @click="resetToDefault"
          class="icon-btn warning"
          title="重置为默认">
          <Circle class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="port-list space-y-2">
      <div
        v-for="(port, index) in ports"
        :key="port.id"
        class="port-item p-2 rounded-lg">

        <div class="flex items-center justify-between mb-2">
          <span class="port-id">{{ port.id }}</span>
          <button
            @click="removePort(index)"
            class="icon-btn danger p-1"
            title="删除">
            <Trash2 class="w-3 h-3" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="field-label block mb-1">位置</label>
            <select
              :value="port.position"
              @change="updatePort(index, 'position', ($event.target as HTMLSelectElement).value)"
              class="field-input w-full px-2 py-1 text-xs rounded">
              <option v-for="pos in portPositions" :key="pos" :value="pos">
                {{ pos === 'top' ? '上' : pos === 'right' ? '右' : pos === 'bottom' ? '下' : '左' }}
              </option>
            </select>
          </div>

          <div>
            <label class="field-label block mb-1">类型</label>
            <select
              :value="port.type"
              @change="updatePort(index, 'type', ($event.target as HTMLSelectElement).value)"
              class="field-input w-full px-2 py-1 text-xs rounded">
              <option v-for="type in portTypes" :key="type" :value="type">
                {{ type === 'input' ? '输入' : type === 'output' ? '输出' : '双向' }}
              </option>
            </select>
          </div>

          <div>
            <label class="field-label block mb-1">边框色</label>
            <input
              type="color"
              :value="port.stroke"
              @input="updatePort(index, 'stroke', ($event.target as HTMLInputElement).value)"
              class="field-input w-full h-6 rounded cursor-pointer" />
          </div>

          <div>
            <label class="field-label block mb-1">填充色</label>
            <input
              type="color"
              :value="port.fill"
              @input="updatePort(index, 'fill', ($event.target as HTMLInputElement).value)"
              class="field-input w-full h-6 rounded cursor-pointer" />
          </div>

          <div>
            <label class="field-label block mb-1">半径</label>
            <input
              type="range"
              :value="port.radius"
              @input="updatePort(index, 'radius', Number(($event.target as HTMLInputElement).value))"
              min="2"
              max="10"
              class="w-full slider-theme" />
          </div>

          <div class="flex items-center">
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="port.magnet"
                  @change="updatePort(index, 'magnet', ($event.target as HTMLInputElement).checked)"
                  class="checkbox-theme" />
              <span class="field-label">可连接</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="ports.length === 0" class="text-center py-4 empty-text text-xs">
      暂无连接桩，点击上方按钮添加
    </div>
  </div>
</template>

<style scoped>
.port-config-panel {
  padding: 8px;
  color: var(--color-text-secondary);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.port-list {
  max-height: 300px;
  overflow-y: auto;
}

.port-list::-webkit-scrollbar {
  width: 4px;
}

.port-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 2px;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.icon-btn {
  padding: 6px;
  border-radius: 6px;
  color: var(--color-text-tertiary);
  transition: all 0.18s ease;
}

.icon-btn:hover {
  background: var(--ui-panel-bg-soft);
  color: var(--theme-primary);
}

.icon-btn.warning:hover {
  color: var(--ui-warning);
}

.icon-btn.danger:hover {
  background: var(--ui-danger-bg);
  color: var(--ui-danger-text);
}

.port-item {
  background: color-mix(in oklab, var(--color-bg-tertiary) 56%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 62%, transparent);
}

.port-id {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: 'Fira Code', monospace;
}

.field-label {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.field-input {
  background: var(--ui-panel-bg-strong);
  border: 1px solid var(--ui-border);
  color: var(--color-text-secondary);
  outline: none;
}

.field-input:focus {
  border-color: var(--ui-info-border);
  box-shadow: 0 0 0 2px var(--ui-focus-ring);
}

.slider-theme {
  accent-color: var(--theme-primary);
}

.checkbox-theme {
  accent-color: var(--theme-primary);
}

.empty-text {
  color: var(--color-text-tertiary);
}
</style>
