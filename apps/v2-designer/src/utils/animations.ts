/**
 * 动画配置和工具函数
 * 支持常见的进入动画、强调动画和退出动画
 */

// 动画类型定义
export type AnimationType = 
  | 'none'
  | 'fade-in'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'zoom-in'
  | 'bounce-in'
  | 'rotate-in'
  | 'flip-in-x'
  | 'flip-in-y'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'swing'
  | 'wobble'

// 动画方向
export type AnimationDirection = 'normal' | 'reverse' | 'alternate'

// 动画迭代次数
export type AnimationIteration = 'infinite' | '1' | '2' | '3'

// 动画配置接口
export interface AnimationConfig {
  type: AnimationType
  duration: number // 秒
  delay: number // 秒
  direction: AnimationDirection
  iteration: AnimationIteration
  timingFunction?: string
}

// 动画关键帧定义
export const animationKeyframes: Record<AnimationType, string> = {
  'none': '',
  
  // 淡入
  'fade-in': `
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  
  // 从左滑入
  'slide-in-left': `
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  
  // 从右滑入
  'slide-in-right': `
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `,
  
  // 从下滑入
  'slide-in-up': `
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  
  // 从上滑入
  'slide-in-down': `
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  
  // 缩放进入
  'zoom-in': `
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  `,
  
  // 弹跳进入
  'bounce-in': `
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    70% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  `,
  
  // 旋转进入
  'rotate-in': `
    from {
      transform: rotate(-180deg);
      opacity: 0;
    }
    to {
      transform: rotate(0);
      opacity: 1;
    }
  `,
  
  // X 轴翻转
  'flip-in-x': `
    from {
      transform: perspective(400px) rotateX(90deg);
      opacity: 0;
    }
    to {
      transform: perspective(400px) rotateX(0);
      opacity: 1;
    }
  `,
  
  // Y 轴翻转
  'flip-in-y': `
    from {
      transform: perspective(400px) rotateY(90deg);
      opacity: 0;
    }
    to {
      transform: perspective(400px) rotateY(0);
      opacity: 1;
    }
  `,
  
  // 弹跳强调
  'bounce': `
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  `,
  
  // 脉冲
  'pulse': `
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  `,
  
  // 抖动
  'shake': `
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  `,
  
  // 摇摆
  'swing': `
    20% {
      transform: rotate(15deg);
    }
    40% {
      transform: rotate(-10deg);
    }
    60% {
      transform: rotate(5deg);
    }
    80% {
      transform: rotate(-5deg);
    }
    100% {
      transform: rotate(0deg);
    }
  `,
  
  // 晃动
  'wobble': `
    0% {
      transform: translateX(0%) rotate(0deg);
    }
    15% {
      transform: translateX(-25%) rotate(-5deg);
    }
    30% {
      transform: translateX(20%) rotate(3deg);
    }
    45% {
      transform: translateX(-15%) rotate(-3deg);
    }
    60% {
      transform: translateX(10%) rotate(2deg);
    }
    75% {
      transform: translateX(-5%) rotate(-1deg);
    }
    100% {
      transform: translateX(0%) rotate(0deg);
    }
  `
}

// 生成动画 CSS
export function generateAnimationCSS(config: AnimationConfig): string {
  if (config.type === 'none') {
    return 'none'
  }

  const keyframeName = `node-anim-${config.type}`
  const direction = config.direction
  const iterations = config.iteration === 'infinite' ? 'infinite' : config.iteration
  
  return `${keyframeName} ${config.duration}s ease ${config.delay}s ${iterations} ${direction} both`
}

// 注册动画到文档
export function registerAnimation(type: AnimationType) {
  if (type === 'none') return
  
  const keyframeName = `node-anim-${type}`
  const keyframeCSS = animationKeyframes[type]
  
  // 检查是否已注册
  const existingStyle = document.getElementById(`anim-style-${type}`)
  if (existingStyle) return
  
  // 确保关键帧 CSS 存在
  if (!keyframeCSS || keyframeCSS.trim() === '') return
  
  // 创建样式标签
  const style = document.createElement('style')
  style.id = `anim-style-${type}`
  style.type = 'text/css'
  style.textContent = `@keyframes ${keyframeName} {${keyframeCSS}}`
  
  // 注册到文档头部
  if (document.head) {
    document.head.appendChild(style)
  }
}

// 预注册所有动画
export function registerAllAnimations() {
  Object.keys(animationKeyframes).forEach(key => {
    registerAnimation(key as AnimationType)
  })
}

// 获取动画选项列表
export function getAnimationOptions() {
  return [
    { label: '无动画', value: 'none' },
    { label: '淡入', value: 'fade-in' },
    { label: '从左滑入', value: 'slide-in-left' },
    { label: '从右滑入', value: 'slide-in-right' },
    { label: '从下滑入', value: 'slide-in-up' },
    { label: '从上滑入', value: 'slide-in-down' },
    { label: '缩放进入', value: 'zoom-in' },
    { label: '弹跳进入', value: 'bounce-in' },
    { label: '旋转进入', value: 'rotate-in' },
    { label: 'X 轴翻转', value: 'flip-in-x' },
    { label: 'Y 轴翻转', value: 'flip-in-y' },
    { label: '弹跳', value: 'bounce' },
    { label: '脉冲', value: 'pulse' },
    { label: '抖动', value: 'shake' },
    { label: '摇摆', value: 'swing' },
    { label: '晃动', value: 'wobble' },
  ]
}
