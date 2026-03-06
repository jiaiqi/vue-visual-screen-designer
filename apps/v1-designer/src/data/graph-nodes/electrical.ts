/**
 * 电气设备图元库
 */

export const electricalNodes = {
  // 断路器
  circuitBreaker: {
    name: '断路器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="25" width="30" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="25" x2="50" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="75" x2="50" y2="85" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="40" x2="60" y2="60" stroke="currentColor" stroke-width="2"/>
      <text x="50" y="55" text-anchor="middle" fill="currentColor" font-size="12">CB</text>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
    ],
  },

  // 变压器
  transformer: {
    name: '变压器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="60" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="30" x2="40" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="60" y1="30" x2="60" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="70" x2="40" y2="85" stroke="currentColor" stroke-width="2"/>
      <line x1="60" y1="70" x2="60" y2="85" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top1', position: 'top', type: 'target' },
      { id: 'top2', position: 'top', type: 'target' },
      { id: 'bottom1', position: 'bottom', type: 'source' },
      { id: 'bottom2', position: 'bottom', type: 'source' },
    ],
  },

  // 开关
  switch_: {
    name: '开关',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="50" x2="40" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="60" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="50" x2="55" y2="35" stroke="currentColor" stroke-width="2"/>
      <circle cx="40" cy="50" r="3" fill="currentColor"/>
      <circle cx="60" cy="50" r="3" fill="currentColor"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 母线
  busbar: {
    name: '母线',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="40" width="80" height="20" fill="none" stroke="currentColor" stroke-width="3"/>
      <line x1="25" y1="40" x2="25" y2="25" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="40" x2="50" y2="25" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="40" x2="75" y2="25" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top1', position: 'top', type: 'source' },
      { id: 'top2', position: 'top', type: 'source' },
      { id: 'top3', position: 'top', type: 'source' },
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 电容器
  capacitor: {
    name: '电容器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="50" x2="42" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="58" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="45" y1="35" x2="45" y2="65" stroke="currentColor" stroke-width="3"/>
      <line x1="55" y1="35" x2="55" y2="65" stroke="currentColor" stroke-width="3"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 电阻
  resistor: {
    name: '电阻',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="15" y1="50" x2="30" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="70" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/>
      <rect x="30" y="40" width="40" height="20" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 电感
  inductor: {
    name: '电感',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="15" y1="50" x2="25" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/>
      <path d="M25 50 Q30 35 35 50 Q40 35 45 50 Q50 35 55 50 Q60 35 65 50 Q70 35 75 50" 
            fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 接地
  ground: {
    name: '接地',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="20" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="58" x2="65" y2="58" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="66" x2="60" y2="66" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'target' },
    ],
  },
}

export default electricalNodes
