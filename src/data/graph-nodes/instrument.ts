/**
 * 仪表仪器图元库
 */

export const instrumentNodes = {
  // 压力表
  pressureGauge: {
    name: '压力表',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M50 20 L50 25" stroke="currentColor" stroke-width="2"/>
      <path d="M50 75 L50 80" stroke="currentColor" stroke-width="2"/>
      <path d="M20 50 L25 50" stroke="currentColor" stroke-width="2"/>
      <path d="M75 50 L80 50" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" stroke-width="2" transform="rotate(45 50 50)"/>
      <circle cx="50" cy="50" r="5" fill="currentColor"/>
      <text x="50" y="90" text-anchor="middle" fill="currentColor" font-size="10">P</text>
    </svg>`,
    defaultPorts: [
      { id: 'bottom', position: 'bottom', type: 'target' },
    ],
  },

  // 流量计
  flowMeter: {
    name: '流量计',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M35 50 L45 40 L55 60 L65 50" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="4" fill="currentColor"/>
      <text x="50" y="90" text-anchor="middle" fill="currentColor" font-size="10">F</text>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 温度计
  temperatureSensor: {
    name: '温度计',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="20" width="16" height="50" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="75" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="35" x2="50" y2="65" stroke="currentColor" stroke-width="3"/>
      <circle cx="50" cy="75" r="5" fill="currentColor"/>
      <line x1="35" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="40" x2="40" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="50" x2="40" y2="50" stroke="currentColor" stroke-width="1"/>
      <text x="50" y="95" text-anchor="middle" fill="currentColor" font-size="10">T</text>
    </svg>`,
    defaultPorts: [
      { id: 'bottom', position: 'bottom', type: 'target' },
    ],
  },

  // 液位计
  levelGauge: {
    name: '液位计',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="20" width="30" height="60" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="42" y1="30" x2="58" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="42" y1="40" x2="58" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="42" y1="50" x2="58" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="42" y1="60" x2="58" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="42" y1="70" x2="58" y2="70" stroke="currentColor" stroke-width="1"/>
      <rect x="42" y="50" width="16" height="22" fill="currentColor" opacity="0.3"/>
      <text x="50" y="90" text-anchor="middle" fill="currentColor" font-size="10">L</text>
    </svg>`,
    defaultPorts: [
      { id: 'bottom', position: 'bottom', type: 'target' },
    ],
  },

  // 功率表
  powerMeter: {
    name: '功率表',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M35 50 L50 35 L65 50" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="35" x2="50" y2="50" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="4" fill="currentColor"/>
      <text x="50" y="90" text-anchor="middle" fill="currentColor" font-size="10">W</text>
    </svg>`,
    defaultPorts: [
      { id: 'bottom', position: 'bottom', type: 'target' },
    ],
  },

  // 分析仪
  analyzer: {
    name: '分析仪',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="50" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" stroke-width="1"/>
      <circle cx="42" cy="45" r="2" fill="currentColor"/>
      <circle cx="50" cy="55" r="2" fill="currentColor"/>
      <circle cx="58" cy="45" r="2" fill="currentColor"/>
      <text x="50" y="85" text-anchor="middle" fill="currentColor" font-size="10">A</text>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'target' },
      { id: 'right', position: 'right', type: 'source' },
    ],
  },
}

export default instrumentNodes
