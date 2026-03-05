/**
 * IT 拓扑图元库
 */

export const itNodes = {
  // 服务器
  server: {
    name: '服务器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="60" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="65" x2="65" y2="65" stroke="currentColor" stroke-width="1"/>
      <circle cx="70" cy="35" r="2" fill="currentColor"/>
      <circle cx="70" cy="45" r="2" fill="currentColor"/>
      <circle cx="70" cy="55" r="2" fill="currentColor"/>
      <circle cx="70" cy="65" r="2" fill="currentColor"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
    ],
  },

  // 路由器
  router: {
    name: '路由器',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="25" x2="50" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="75" x2="50" y2="85" stroke="currentColor" stroke-width="2"/>
      <line x1="25" y1="50" x2="15" y2="50" stroke="currentColor" stroke-width="2"/>
      <line x1="75" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 交换机
  switch_: {
    name: '交换机',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="50" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" stroke-width="1"/>
      <circle cx="40" cy="40" r="2" fill="currentColor"/>
      <circle cx="50" cy="50" r="2" fill="currentColor"/>
      <circle cx="60" cy="60" r="2" fill="currentColor"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 防火墙
  firewall: {
    name: '防火墙',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 25 L70 25 L75 75 L25 75 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M40 40 L60 40 L55 60 L45 60 Z" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="40" x2="50" y2="60" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="50" x2="60" y2="50" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 数据库
  database: {
    name: '数据库',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="30" rx="25" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M25 30 L25 70 Q50 80 75 70 L75 30" fill="none" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="50" cy="70" rx="25" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="25" y1="45" x2="75" y2="45" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <line x1="25" y1="60" x2="75" y2="60" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
    ],
  },

  // 云
  cloud: {
    name: '云',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 60 Q20 60 20 50 Q20 35 35 35 Q40 20 55 25 Q65 15 75 25 Q90 25 90 40 Q95 50 85 60 Z" 
            fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'both' },
      { id: 'bottom', position: 'bottom', type: 'both' },
      { id: 'left', position: 'left', type: 'both' },
      { id: 'right', position: 'right', type: 'both' },
    ],
  },

  // 负载均衡
  loadBalancer: {
    name: '负载均衡',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="25" width="40" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="40" x2="60" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="40" y1="50" x2="60" y2="50" stroke="currentColor" stroke-width="1"/>
      <line x1="40" y1="60" x2="60" y2="60" stroke="currentColor" stroke-width="1"/>
      <path d="M45 35 L50 40 L55 35" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M45 65 L50 60 L55 65" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    defaultPorts: [
      { id: 'top', position: 'top', type: 'target' },
      { id: 'bottom', position: 'bottom', type: 'source' },
    ],
  },

  // 笔记本电脑
  laptop: {
    name: '笔记本电脑',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="50" height="35" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M20 65 L30 75 L70 75 L80 65" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" stroke-width="1"/>
      <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" stroke-width="1"/>
    </svg>`,
    defaultPorts: [
      { id: 'bottom', position: 'bottom', type: 'both' },
    ],
  },
}

export default itNodes
