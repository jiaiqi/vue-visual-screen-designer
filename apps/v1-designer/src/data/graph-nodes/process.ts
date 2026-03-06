/**
 * 工艺设备图元库
 */

export const processNodes = {
  // 泵
  pump: {
    name: '泵',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M35 50 L50 35 L65 50 L50 65 Z" fill="currentColor"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="65" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'target' },
      { id: 'out', position: 'right', type: 'source' },
    ],
  },

  // 阀门
  valve: {
    name: '阀门',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 35 L50 50 L20 65 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M80 35 L50 50 L80 65 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="20" x2="50" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="65" x2="50" y2="80" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="5" fill="currentColor"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'both' },
      { id: 'out', position: 'right', type: 'both' },
    ],
  },

  // 储罐
  tank: {
    name: '储罐',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="20" rx="30" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M20 20 L20 80 Q50 90 80 80 L80 20" fill="none" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="50" cy="80" rx="30" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <line x1="20" y1="65" x2="80" y2="65" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 换热器
  heatExchanger: {
    name: '换热器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="60" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M35 30 Q45 40 35 50 Q25 60 35 70" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M50 30 Q60 40 50 50 Q40 60 50 70" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M65 30 Q75 40 65 50 Q55 60 65 70" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="35" x2="25" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="65" x2="25" y2="65" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="35" x2="85" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="65" x2="85" y2="65" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'in1', position: 'left', type: 'target' },
      { id: 'in2', position: 'left', type: 'target' },
      { id: 'out1', position: 'right', type: 'source' },
      { id: 'out2', position: 'right', type: 'source' },
    ],
  },

  // 压缩机
  compressor: {
    name: '压缩机',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M35 40 L50 50 L35 60" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M50 40 L65 50 L50 60" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="20" y1="50" x2="35" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="65" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="3" fill="currentColor"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'target' },
      { id: 'out', position: 'right', type: 'source' },
    ],
  },

  // 过滤器
  filter: {
    name: '过滤器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 25 L70 25 L60 75 L40 75 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" stroke-width="1"/>
      <line x1="37" y1="45" x2="63" y2="45" stroke="currentColor" stroke-width="1"/>
      <line x1="39" y1="55" x2="61" y2="55" stroke="currentColor" stroke-width="1"/>
      <line x1="41" y1="65" x2="59" y2="65" stroke="currentColor" stroke-width="1"/>
      <line x1="50" y1="75" x2="50" y2="85" stroke="currentColor" stroke-width="2"/>
      <line x1="20" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'target' },
      { id: 'out', position: 'bottom', type: 'source' },
    ],
  },

  // 反应器
  reactor: {
    name: '反应器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 20 L70 20 L75 80 L25 80 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="30" x2="65" y2="30" stroke="currentColor" stroke-width="1"/>
      <line x1="33" y1="40" x2="67" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="31" y1="50" x2="69" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="29" y1="60" x2="71" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="27" y1="70" x2="73" y2="70" stroke="currentColor" stroke-width="1"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="42" x2="50" y2="58" stroke="currentColor" stroke-width="2"/>
      <line x1="42" y1="50" x2="58" y2="50" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
    ],
  },

  // 风机
  fan: {
    name: '风机',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M50 20 Q65 35 50 50 Q35 65 50 80" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M20 50 Q35 35 50 50 Q65 65 80 50" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="5" fill="currentColor"/>
      <line x1="20" y1="50" x2="10" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="80" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'target' },
      { id: 'out', position: 'right', type: 'source' },
    ],
  },

  // 电机
  motor: {
    name: '电机',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="50" y="55" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">M</text>
      <line x1="25" y1="50" x2="15" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="25" r="3" fill="currentColor"/>
      <line x1="50" y1="22" x2="50" y2="15" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'power', position: 'top', type: 'target' },
      { id: 'in', position: 'left', type: 'target' },
      { id: 'out', position: 'right', type: 'source' },
    ],
  },

  // 管道
  pipe: {
    name: '管道',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="40" width="80" height="20" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="10" y1="45" x2="90" y2="45" stroke="currentColor" stroke-width="1"/>
      <line x1="10" y1="55" x2="90" y2="55" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="40" x2="30" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="70" y1="40" x2="70" y2="35" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'in', position: 'left', type: 'both' },
      { id: 'out', position: 'right', type: 'both' },
      { id: 'top1', position: 'top', type: 'both' },
      { id: 'top2', position: 'top', type: 'both' },
    ],
  },
}

export default processNodes
