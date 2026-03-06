/**
 * 坐标系转换工具函数
 * 支持像素与百分比单位转换，以及不同坐标系之间的位置转换
 */

/**
 * 将像素值转换为百分比值
 * @param value 像素值
 * @param total 总像素值（画布宽度或高度）
 * @returns 百分比值（0-100）
 */
export function pixelToPercent(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * 将百分比值转换为像素值
 * @param percent 百分比值（0-100）
 * @param total 总像素值（画布宽度或高度）
 * @returns 像素值
 */
export function percentToPixel(percent: number, total: number): number {
  return (percent / 100) * total
}

/**
 * 解析百分比字符串，返回百分比数值
 * @param value 可能是百分比字符串（如 "50%"）或数字
 * @returns 百分比数值（0-100）或 null
 */
export function parsePercent(value: string | number): number | null {
  if (typeof value === 'number') return value
  const match = value.match(/^(-?\d+(?:\.\d+)?)\s*%$/)
  if (match && match[1]) {
    return parseFloat(match[1])
  }
  return null
}

/**
 * 格式化百分比显示
 * @param value 百分比值
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 坐标系转换：从左上角原点转换到中心原点
 * @param x 原 X 坐标（左上角坐标系）
 * @param y 原 Y 坐标（左上角坐标系）
 * @param width 画布宽度
 * @param height 画布高度
 * @returns 转换后的坐标 {x, y}
 */
export function topLeftToCenter(x: number, y: number, width: number, height: number): { x: number; y: number } {
  return {
    x: x - width / 2,
    y: height / 2 - y, // Y 轴反转
  }
}

/**
 * 坐标系转换：从中心原点转换到左上角原点
 * @param x 原 X 坐标（中心坐标系）
 * @param y 原 Y 坐标（中心坐标系）
 * @param width 画布宽度
 * @param height 画布高度
 * @returns 转换后的坐标 {x, y}
 */
export function centerToTopLeft(x: number, y: number, width: number, height: number): { x: number; y: number } {
  return {
    x: x + width / 2,
    y: height / 2 - y, // Y 轴反转
  }
}

/**
 * 转换图元位置到新坐标系
 * @param nodeX 图元 X 坐标
 * @param nodeY 图元 Y 坐标
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param fromCoordinateSystem 原坐标系 ('top-left' | 'center')
 * @param toCoordinateSystem 目标坐标系 ('top-left' | 'center')
 * @returns 转换后的坐标 {x, y}
 */
export function transformNodePosition(
  nodeX: number,
  nodeY: number,
  canvasWidth: number,
  canvasHeight: number,
  fromCoordinateSystem: 'top-left' | 'center',
  toCoordinateSystem: 'top-left' | 'center'
): { x: number; y: number } {
  // 如果坐标系相同，直接返回
  if (fromCoordinateSystem === toCoordinateSystem) {
    return { x: nodeX, y: nodeY }
  }

  // 从左上角原点转换到中心原点
  if (fromCoordinateSystem === 'top-left' && toCoordinateSystem === 'center') {
    return topLeftToCenter(nodeX, nodeY, canvasWidth, canvasHeight)
  }

  // 从中心原点转换到左上角原点
  if (fromCoordinateSystem === 'center' && toCoordinateSystem === 'top-left') {
    return centerToTopLeft(nodeX, nodeY, canvasWidth, canvasHeight)
  }

  return { x: nodeX, y: nodeY }
}

/**
 * 根据单位显示值
 * @param value 像素值
 * @param total 总像素值
 * @param unit 单位 ('px' | 'percent')
 * @returns 显示值（带单位的字符串）
 */
export function formatValueWithUnit(value: number, total: number, unit: 'px' | 'percent'): string {
  if (unit === 'percent') {
    return formatPercent(pixelToPercent(value, total), 1)
  }
  return `${Math.round(value)}px`
}

/**
 * 解析带单位的输入值
 * @param input 用户输入（可能是数字或百分比字符串）
 * @param total 总像素值
 * @returns 像素值
 */
export function parseInputWithValue(input: string, total: number): number {
  const percent = parsePercent(input)
  if (percent !== null) {
    return percentToPixel(percent, total)
  }
  // 尝试解析为普通数字
  const num = parseFloat(input)
  return isNaN(num) ? 0 : num
}
