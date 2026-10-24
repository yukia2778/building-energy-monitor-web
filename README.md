# 建筑能耗监测平台（前端作品集项目）

基于 **Vue3 + Vite + ECharts** 的建筑能耗监测前端演示项目，风格为深色科技数据大屏。
可作作品集项目 / 简历项目经历，也可作为学习 Vue3 与 ECharts 可视化的练手模板。

## 功能页面

| 页面 | 内容 |
|---|---|
| 总览大屏 | 今日总能耗 / 用电 / 用水 / 碳排放指标卡片 + 4 张图表（24h趋势、分项占比饼图、近7天对比、分项柱状图） |
| 能耗趋势 | 时间范围切换（今日 / 近7天 / 近30天），折线图 + 数据摘要 |
| 设备监控 | 设备运行状态表格 + 状态统计 + 综合负载仪表盘 |

## 技术栈

- Vue 3（组合式 API `<script setup>`）
- Vite 6 构建工具
- ECharts 5 数据可视化
- axios（API 层预留，当前使用本地 mock 数据）

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
npm run build    # 生产构建，产物输出到 dist/
npm run preview  # 本地预览构建产物
```

## 目录结构

```
building-energy-monitor/
├─ index.html              # 入口 HTML
├─ vite.config.js          # Vite 配置（@ 别名等）
├─ src/
│  ├─ main.js              # 应用入口
│  ├─ App.vue              # 主容器 + 顶部导航 + 动态组件切换
│  ├─ style.css            # 全局样式
│  ├─ data/mockData.js     # 模拟数据
│  ├─ service/api.js       # API 服务层（mock 占位，可替换为真实接口）
│  └─ components/
│     ├─ DashboardOverview.vue   # 总览大屏
│     ├─ EnergyTrend.vue         # 能耗趋势
│     └─ DeviceMonitor.vue       # 设备监控
```

## 接真实后端

后端接口就绪后，在 `src/service/api.js` 中把 `api.getXxx` 方法体替换为真实的
`axios.get('/api/xxx')` 请求即可，无需改动任何组件。
