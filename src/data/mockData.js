// ===== 模拟数据（mock data）=====
// 前端开发中，后端接口未就绪时常用本地 mock 数据占位，
// 后续接真实接口时，把下方返回替换为 axios 请求即可（见 service/api.js）。

// 生成近24小时 / 近30天能耗数据的工具函数
function genSeries(hours, base) {
  const arr = []
  for (let i = 0; i < hours; i++) {
    // 用电峰值集中在白天（9-18点），用正弦波模拟昼夜规律
    const factor = 0.5 + 0.5 * Math.sin(((i + 8) / 24) * Math.PI * 2)
    arr.push(+(base * (0.7 + factor * 0.9) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(1))
  }
  return arr
}

export const todaySummary = {
  totalEnergy: 2184.6,   // 今日总能耗 kWh
  electric: 1523.2,      // 用电量 kWh
  water: 428.5,          // 用水量 t
  gas: 232.9,            // 燃气量 m³
  carbon: 1168.4,        // 碳排放 kgCO₂
  trend: 6.8             // 较昨日变化 %
}

// 近24小时用电趋势（小时级）
export const hourTrend = {
  xAxis: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  electric: genSeries(24, 60),
  water: genSeries(24, 18)
}

// 近7天能耗（天级）
export const weekTrend = {
  xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  electric: genSeries(7, 1500),
  water: genSeries(7, 420)
}

// 分项计量（空调/照明/动力/其他）
export const breakdown = [
  { name: '空调', value: 612, color: '#38bdf8' },
  { name: '照明', value: 328, color: '#22d3ee' },
  { name: '动力', value: 247, color: '#a78bfa' },
  { name: '其他', value: 336, color: '#34d399' }
]

// 设备监控列表
export const deviceList = [
  { id: 'AC-01', name: '中央空调-1#主机', type: '空调', location: '2号楼机房', status: '运行', power: 186.5, temp: 46.2 },
  { id: 'AC-02', name: '中央空调-2#主机', type: '空调', location: '2号楼机房', status: '运行', power: 172.3, temp: 45.8 },
  { id: 'LT-01', name: '照明回路-办公楼1层', type: '照明', location: '办公楼1层', status: '运行', power: 23.6, temp: 28.4 },
  { id: 'LT-02', name: '照明回路-办公楼2层', type: '照明', location: '办公楼2层', status: '告警', power: 12.4, temp: 61.3 },
  { id: 'PW-01', name: '动力-水泵变频器', type: '动力', location: '地下一层', status: '运行', power: 55.1, temp: 42.0 },
  { id: 'PW-02', name: '动力-电梯1#', type: '动力', location: '办公楼', status: '停机', power: 0, temp: 25.1 },
  { id: 'EV-01', name: '充电桩-交流1#', type: '其他', location: '停车场', status: '运行', power: 6.4, temp: 38.9 }
]
