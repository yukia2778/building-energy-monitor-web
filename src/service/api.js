// ===== API 服务层 =====
// 此处是"接后端接口"的标准写法。当前用 mock 数据占位，
// 后端就绪后，把 getOverview / getTrend 等方法体改为真实 axios 请求即可。

import axios from 'axios'
import { todaySummary, hourTrend, weekTrend, breakdown, deviceList } from '../data/mockData'

// 模拟网络延迟，让数据加载过程更真实
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const api = {
  // 获取总览数据
  async getOverview() {
    await delay()
    return todaySummary
  },
  // 获取趋势数据
  async getTrend() {
    await delay()
    return { hourTrend, weekTrend }
  },
  // 获取分项数据
  async getBreakdown() {
    await delay()
    return breakdown
  },
  // 获取设备列表
  async getDevices() {
    await delay()
    return deviceList
  }
}

// 真实接口写法示例（后端就绪后取消注释使用）：
// export const api = {
//   async getOverview() {
//     const { data } = await axios.get('/api/overview')
//     return data
//   },
//   async getTrend() {
//     const { data } = await axios.get('/api/trend')
//     return data
//   }
// }
