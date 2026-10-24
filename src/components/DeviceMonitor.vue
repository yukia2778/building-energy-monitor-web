<template>
  <div class="device">
    <!-- 左侧：设备列表表格 -->
    <div class="panel list">
      <div class="panel-title">设备运行状态</div>
      <table class="table">
        <thead>
          <tr>
            <th>编号</th><th>设备名称</th><th>类型</th><th>位置</th>
            <th>功率(kW)</th><th>温度(℃)</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in devices" :key="d.id">
            <td>{{ d.id }}</td>
            <td>{{ d.name }}</td>
            <td>{{ d.type }}</td>
            <td>{{ d.location }}</td>
            <td>{{ d.power }}</td>
            <td>{{ d.temp }}</td>
            <td>
              <span class="status" :class="statusClass(d.status)">{{ d.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 状态统计 -->
      <div class="stats">
        <span>运行 <b class="run">{{ stat.run }}</b></span>
        <span>告警 <b class="warn">{{ stat.warn }}</b></span>
        <span>停机 <b class="off">{{ stat.off }}</b></span>
      </div>
    </div>

    <!-- 右侧：设备概览仪表盘 -->
    <div class="panel gauge">
      <div class="panel-title">负载概况</div>
      <div ref="gaugeRef" class="gauge-chart"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { api } from '../service/api'

export default {
  name: 'DeviceMonitor',
  setup() {
    const devices = ref([])
    const gaugeRef = ref(null)
    let gauge = null

    // 状态统计：用 computed 依赖 devices 自动计算
    const stat = computed(() => ({
      run: devices.value.filter((d) => d.status === '运行').length,
      warn: devices.value.filter((d) => d.status === '告警').length,
      off: devices.value.filter((d) => d.status === '停机').length
    }))

    // 状态样式映射
    function statusClass(s) {
      return { 运行: 'run', 告警: 'warn', 停机: 'off' }[s] || ''
    }

    function renderGauge() {
      if (!gauge) gauge = echarts.init(gaugeRef.value)
      // 综合负载：用运行设备平均功率折算一个百分比
      const running = devices.value.filter((d) => d.status === '运行')
      const load = running.length
        ? Math.round((running.reduce((a, b) => a + b.power, 0) / 260) * 100)
        : 0
      gauge.setOption({
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            progress: { show: true, width: 14, itemStyle: { color: '#38bdf8' } },
            axisLine: { lineStyle: { width: 14, color: [[1, 'rgba(56,189,248,0.15)']] } },
            axisTick: { show: false },
            splitLine: { length: 10, lineStyle: { color: '#1e3a5f' } },
            axisLabel: { color: '#7d93b2', distance: 12 },
            pointer: { itemStyle: { color: '#22d3ee' } },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#e6f1ff',
              fontSize: 26,
              offsetCenter: [0, '60%']
            },
            data: [{ value: load, name: '综合负载' }],
            title: { color: '#7d93b2', offsetCenter: [0, '85%'] }
          }
        ]
      })
    }

    function onResize() {
      gauge && gauge.resize()
    }

    onMounted(async () => {
      devices.value = await api.getDevices()
      renderGauge()
      window.addEventListener('resize', onResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
      gauge && gauge.dispose()
    })

    return { devices, stat, gaugeRef, statusClass }
  }
}
</script>

<style scoped>
.device {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table th {
  text-align: left;
  color: var(--text-dim);
  font-weight: 500;
  padding: 10px 12px;
  border-bottom: 1px solid var(--panel-border);
}
.table td {
  padding: 11px 12px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.08);
}
.table tbody tr:hover { background: rgba(56, 189, 248, 0.06); }

.status {
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
}
.status.run { color: var(--success); background: rgba(52, 211, 153, 0.12); }
.status.warn { color: var(--warn); background: rgba(251, 191, 36, 0.12); }
.status.off { color: var(--text-dim); background: rgba(125, 147, 178, 0.12); }

.stats { display: flex; gap: 24px; margin-top: 16px; color: var(--text-dim); font-size: 13px; }
.stats b { font-size: 16px; }
.stats .run { color: var(--success); }
.stats .warn { color: var(--warn); }
.stats .off { color: var(--text-dim); }

.gauge-chart { width: 100%; height: 360px; }

@media (max-width: 900px) {
  .device { grid-template-columns: 1fr; }
}
</style>
