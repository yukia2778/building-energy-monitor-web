<template>
  <div class="trend">
    <div class="panel">
      <div class="head">
        <div class="panel-title" style="margin: 0">能耗趋势分析</div>
        <!-- 时间范围切换：改变响应式数据，触发图表重绘 -->
        <div class="range-switch">
          <button
            v-for="r in ranges"
            :key="r.key"
            class="range-btn"
            :class="{ active: activeRange === r.key }"
            @click="switchRange(r.key)"
          >
            {{ r.label }}
          </button>
        </div>
      </div>

      <div ref="chartRef" class="chart"></div>

      <!-- 数据摘要 -->
      <div class="summary">
        <div v-for="s in summaries" :key="s.label" class="summary-item">
          <div class="s-label">{{ s.label }}</div>
          <div class="s-value">{{ s.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { api } from '../service/api'

export default {
  name: 'EnergyTrend',
  setup() {
    const chartRef = ref(null)
    const activeRange = ref('day')
    const summaries = ref([])

    // 时间范围选项（仅演示 day/week；month 可自行扩展 mock 数据）
    const ranges = [
      { key: 'day', label: '今日' },
      { key: 'week', label: '近7天' },
      { key: 'month', label: '近30天' }
    ]

    let chart = null
    let trend = null

    function render() {
      if (!chart) chart = echarts.init(chartRef.value)

      // 根据当前范围选取数据
      let xData, series
      if (activeRange.value === 'day') {
        xData = trend.hourTrend.xAxis
        series = [trend.hourTrend.electric, trend.hourTrend.water]
      } else if (activeRange.value === 'week') {
        xData = trend.weekTrend.xAxis
        series = [trend.weekTrend.electric, trend.weekTrend.water]
      } else {
        // 近30天：按天采样（mock 简化）
        xData = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
        series = [
          Array.from({ length: 30 }, () => +(1400 + Math.random() * 400).toFixed(1)),
          Array.from({ length: 30 }, () => +(400 + Math.random() * 80).toFixed(1))
        ]
      }

      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#7d93b2' } },
        grid: { left: 50, right: 30, top: 50, bottom: 40 },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: { color: '#7d93b2' },
          axisLine: { lineStyle: { color: '#1e3a5f' } }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(56,189,248,0.12)' } },
          axisLabel: { color: '#7d93b2' }
        },
        series: [
          {
            name: '用电(kWh)',
            type: 'line',
            smooth: true,
            data: series[0],
            areaStyle: { opacity: 0.2 },
            lineStyle: { color: '#38bdf8', width: 2 },
            itemStyle: { color: '#38bdf8' }
          },
          {
            name: '用水(t)',
            type: 'line',
            smooth: true,
            data: series[1],
            lineStyle: { color: '#22d3ee', width: 2 },
            itemStyle: { color: '#22d3ee' }
          }
        ]
      })

      // 计算摘要
      const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
      summaries.value = [
        { label: '样本点数', value: xData.length },
        { label: '用电峰值', value: Math.max(...series[0]) + ' kWh' },
        { label: '用电均值', value: avg(series[0]) + ' kWh' },
        { label: '用水总量', value: series[1].reduce((a, b) => a + b, 0).toFixed(0) + ' t' }
      ]
    }

    function switchRange(key) {
      activeRange.value = key
      render() // 切范围后重绘图表
    }

    function onResize() {
      chart && chart.resize()
    }

    onMounted(async () => {
      trend = await api.getTrend()
      render()
      window.addEventListener('resize', onResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
      chart && chart.dispose()
    })

    return { chartRef, activeRange, ranges, summaries, switchRange }
  }
}
</script>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.range-switch { display: flex; gap: 6px; }
.range-btn {
  padding: 6px 16px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.range-btn.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: var(--accent);
  color: var(--accent2);
}
.chart { width: 100%; height: 400px; }

.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.summary-item {
  text-align: center;
  padding: 12px;
  background: rgba(56, 189, 248, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.15);
}
.s-label { color: var(--text-dim); font-size: 12px; }
.s-value { margin-top: 6px; font-size: 20px; font-weight: 700; color: var(--accent2); }

@media (max-width: 900px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
</style>
