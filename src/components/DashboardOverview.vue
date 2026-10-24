<template>
  <div class="overview">
    <!-- 顶部指标卡片区 -->
    <section class="cards">
      <div v-for="card in cards" :key="card.label" class="panel card">
        <div class="card-label">{{ card.label }}</div>
        <div class="card-value">
          {{ card.value }}<span class="unit">{{ card.unit }}</span>
        </div>
        <div class="card-trend" :class="card.up ? 'up' : 'down'">
          {{ card.up ? '▲' : '▼' }} {{ card.trend }}% 较昨日
        </div>
      </div>
    </section>

    <!-- 图表区 -->
    <section class="charts">
      <div class="panel chart-wide">
        <div class="panel-title">近24小时用电 / 用水趋势</div>
        <div ref="hourChartRef" class="chart"></div>
      </div>
      <div class="panel chart-half">
        <div class="panel-title">能耗分项占比</div>
        <div ref="pieChartRef" class="chart"></div>
      </div>
      <div class="panel chart-wide">
        <div class="panel-title">近7天能耗对比</div>
        <div ref="weekChartRef" class="chart"></div>
      </div>
      <div class="panel chart-half">
        <div class="panel-title">分项计量（kWh）</div>
        <div ref="barChartRef" class="chart"></div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { api } from '../service/api'

export default {
  name: 'DashboardOverview',
  setup() {
    const cards = ref([])
    const hourChartRef = ref(null)
    const pieChartRef = ref(null)
    const weekChartRef = ref(null)
    const barChartRef = ref(null)

    let charts = []

    // 统一的 ECharts 初始化 + 注册 resize 自适应
    function mountChart(el) {
      const chart = echarts.init(el)
      charts.push(chart)
      return chart
    }

    // 绘制"近24小时"折线图
    function renderHour(trend) {
      const chart = mountChart(hourChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#7d93b2' } },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: trend.hourTrend.xAxis,
          axisLabel: { color: '#7d93b2' },
          axisLine: { lineStyle: { color: '#1e3a5f' } }
        },
        yAxis: {
          type: 'value',
          name: 'kWh / t',
          nameTextStyle: { color: '#7d93b2' },
          splitLine: { lineStyle: { color: 'rgba(56,189,248,0.12)' } },
          axisLabel: { color: '#7d93b2' }
        },
        series: [
          {
            name: '用电(kWh)',
            type: 'line',
            smooth: true,
            data: trend.hourTrend.electric,
            areaStyle: { opacity: 0.2 },
            itemStyle: { color: '#38bdf8' },
            lineStyle: { color: '#38bdf8' }
          },
          {
            name: '用水(t)',
            type: 'line',
            smooth: true,
            data: trend.hourTrend.water,
            itemStyle: { color: '#22d3ee' },
            lineStyle: { color: '#22d3ee' }
          }
        ]
      })
    }

    // 绘制"分项占比"饼图
    function renderPie(breakdown) {
      const chart = mountChart(pieChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} kWh ({d}%)' },
        legend: { bottom: 0, textStyle: { color: '#7d93b2' } },
        series: [
          {
            type: 'pie',
            radius: ['42%', '70%'],
            center: ['50%', '45%'],
            label: { color: '#e6f1ff' },
            data: breakdown.map((b) => ({ name: b.name, value: b.value, itemStyle: { color: b.color } }))
          }
        ]
      })
    }

    // 绘制"近7天"柱状图
    function renderWeek(trend) {
      const chart = mountChart(weekChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#7d93b2' } },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: trend.weekTrend.xAxis,
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
            type: 'bar',
            barWidth: 18,
            data: trend.weekTrend.electric,
            itemStyle: { color: '#38bdf8', borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '用水(t)',
            type: 'bar',
            barWidth: 18,
            data: trend.weekTrend.water,
            itemStyle: { color: '#22d3ee', borderRadius: [4, 4, 0, 0] }
          }
        ]
      })
    }

    // 绘制"分项计量"横向柱状图
    function renderBar(breakdown) {
      const chart = mountChart(barChartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 70, right: 30, top: 20, bottom: 30 },
        xAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(56,189,248,0.12)' } },
          axisLabel: { color: '#7d93b2' }
        },
        yAxis: {
          type: 'category',
          data: breakdown.map((b) => b.name),
          axisLabel: { color: '#e6f1ff' },
          axisLine: { lineStyle: { color: '#1e3a5f' } }
        },
        series: [
          {
            type: 'bar',
            barWidth: 16,
            data: breakdown.map((b) => ({
              value: b.value,
              itemStyle: { color: b.color, borderRadius: [0, 4, 4, 0] }
            })),
            label: { show: true, position: 'right', color: '#e6f1ff' }
          }
        ]
      })
    }

    onMounted(async () => {
      // 并行请求四类数据（真实项目中对应多个接口）
      const [summary, trend, breakdown, ] = await Promise.all([
        api.getOverview(),
        api.getTrend(),
        api.getBreakdown()
      ])

      cards.value = [
        { label: '今日总能耗', value: summary.totalEnergy, unit: 'kWh', trend: summary.trend, up: true },
        { label: '用电量', value: summary.electric, unit: 'kWh', trend: 4.2, up: true },
        { label: '用水量', value: summary.water, unit: 't', trend: 1.8, up: false },
        { label: '碳排放', value: summary.carbon, unit: 'kgCO₂', trend: 3.5, up: true }
      ]

      renderHour(trend)
      renderWeek(trend)
      renderPie(breakdown)
      renderBar(breakdown)
    })

    // 窗口尺寸变化时，所有图表自适应
    function onResize() {
      charts.forEach((c) => c.resize())
    }
    onMounted(() => window.addEventListener('resize', onResize))
    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
      charts.forEach((c) => c.dispose())
    })

    return { cards, hourChartRef, pieChartRef, weekChartRef, barChartRef }
  }
}
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.card {
  text-align: center;
  padding: 20px 16px;
}
.card-label { color: var(--text-dim); font-size: 13px; }
.card-value { font-size: 30px; font-weight: 700; margin: 8px 0 6px; color: var(--text-main); }
.card-value .unit { font-size: 13px; color: var(--text-dim); margin-left: 4px; font-weight: 400; }
.card-trend { font-size: 12px; }
.card-trend.up { color: var(--success); }
.card-trend.down { color: var(--danger); }

.charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}
.chart-wide, .chart-half { min-height: 300px; }
.chart { width: 100%; height: 260px; }

/* 响应式：窄屏时卡片和图表单列堆叠 */
@media (max-width: 900px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .charts { grid-template-columns: 1fr; }
}
</style>
