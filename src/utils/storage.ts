/**
 * LocalForage 存储工具模块
 * 提供异步本地存储功能，支持更大的存储空间
 */
import localforage from 'localforage'

// 配置存储实例
export const storage = {
  // 主题存储
  theme: localforage.createInstance({
    name: 'vue-fabric-editor',
    storeName: 'theme',
    description: '主题和用户偏好设置'
  }),

  // 最近使用图元
  recentShapes: localforage.createInstance({
    name: 'vue-fabric-editor',
    storeName: 'recent-shapes',
    description: '最近使用的图元记录'
  }),

  // 收藏图元
  favoriteShapes: localforage.createInstance({
    name: 'vue-fabric-editor',
    storeName: 'favorite-shapes',
    description: '收藏的图元列表'
  }),

  // 指南完成状态
  guide: localforage.createInstance({
    name: 'vue-fabric-editor',
    storeName: 'guide',
    description: '新手指南完成状态'
  }),

  // 图纸数据
  drawings: localforage.createInstance({
    name: 'vue-fabric-editor',
    storeName: 'drawings',
    description: '保存的图纸数据'
  })
}

// 通用的存储方法
export async function getItem<T>(key: string, store: 'theme' | 'recentShapes' | 'favoriteShapes' | 'guide' | 'drawings' = 'theme'): Promise<T | null> {
  try {
    return await storage[store].getItem<T>(key)
  } catch (error) {
    console.error(`读取 ${store}.${key} 失败:`, error)
    return null
  }
}

export async function setItem<T>(key: string, value: T, store: 'theme' | 'recentShapes' | 'favoriteShapes' | 'guide' | 'drawings' = 'theme'): Promise<T> {
  try {
    return await storage[store].setItem<T>(key, value)
  } catch (error) {
    console.error(`保存 ${store}.${key} 失败:`, error)
    throw error
  }
}

export async function removeItem(key: string, store: 'theme' | 'recentShapes' | 'favoriteShapes' | 'guide' | 'drawings' = 'theme'): Promise<void> {
  try {
    await storage[store].removeItem(key)
  } catch (error) {
    console.error(`删除 ${store}.${key} 失败:`, error)
    throw error
  }
}

export async function clearStore(store: 'theme' | 'recentShapes' | 'favoriteShapes' | 'guide' | 'drawings'): Promise<void> {
  try {
    await storage[store].clear()
  } catch (error) {
    console.error(`清空 ${store} 失败:`, error)
    throw error
  }
}
