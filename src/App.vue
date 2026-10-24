<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="topbar">
      <div class="logo">
        <span class="dot"></span>
        <h1>建筑能耗监测平台</h1>
      </div>
      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
      <div class="time">{{ now }}</div>
    </header>

    <!-- 主体：动态组件，根据页签切换 -->
    <main class="content">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DashboardOverview from './components/DashboardOverview.vue'
import EnergyTrend from './components/EnergyTrend.vue'
import DeviceMonitor from './components/DeviceMonitor.vue'

export default {
  name: 'App',
  components: { DashboardOverview, EnergyTrend, DeviceMonitor },
  setup() {
    const activeTab = ref('overview')

    const tabs = [
      { key: 'overview', label: '总览大屏', comp: 'DashboardOverview' },
      { key: 'trend', label: '能耗趋势', comp: 'EnergyTrend' },
      { key: 'device', label: '设备监控', comp: 'DeviceMonitor' }
    ]

    // 动态组件名：computed 响应式依赖 activeTab
    const currentComponent = computed(
      () => tabs.find((t) => t.key === activeTab.value).comp
    )

    // 顶部实时时间（示例：定时器触发响应式更新）
    const now = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    let timer = null
    onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      }, 1000)
    })
    onUnmounted(() => clearInterval(timer))

    return { activeTab, tabs, currentComponent, now }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(15, 30, 50, 0.85);
  border-bottom: 1px solid var(--panel-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}
.logo h1 {
  font-size: 20px;
  letter-spacing: 1px;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 8px;
}
.tab {
  padding: 8px 22px;
  border: 1px solid transparent;
  border-radius: 20px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.tab:hover {
  color: var(--text-main);
}
.tab.active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(34, 211, 238, 0.15));
  border-color: var(--accent);
  color: var(--accent2);
}

.time {
  color: var(--text-dim);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.content {
  flex: 1;
  padding: 24px 28px;
}
</style>
