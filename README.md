# 抽卡师工作流程可视化 - 前端技术方案

## 1. 背景

### 1.1 业务背景

抽卡师在日常工作中需要处理大量分镜任务，每个分镜包含多个子任务（如绘制、审核、修改等），任务时间分布在一天的不同时段。目前缺乏直观的方式来查看一天内的工作安排，导致：

- 难以快速了解当天任务的整体分布
- 无法直观看到任务之间的时间冲突
- 不便于进行工作量评估和调度优化

### 1.2 需求目标

开发一个**一天工作流程可视化**系统，以甘特图形式展示抽卡师的任务分布：

- 横轴：时间轴（小时维度，如 09:00 - 20:00）
- 纵轴：分镜列表
- 色块：每个子任务的时间段

### 1.3 核心诉求

| 诉求 | 描述 |
|------|------|
| 直观展示 | 以甘特图形式展示一天内所有分镜的任务时间分布 |
| 交互能力 | 支持点击查看任务详情、拖拽调整时间 |
| 实时标记 | 显示当前时间线，便于定位 |
| 数据调试 | 支持查看和编辑原始数据结构 |

---

## 2. 技术调研

### 2.1 甘特图组件选型

| 组件库 | Stars | Vue 3 支持 | TypeScript | 交互能力 | 维护状态 |
|--------|-------|-----------|------------|----------|----------|
| **vue-ganttastic** | 300+ | ✅ | ✅ | 拖拽、点击、hover | 活跃 |
| gantt-schedule-timeline-calendar | 2.8k | ❌ (需适配) | ✅ | 丰富 | 活跃 |
| dhtmlx-gantt | 1k+ | 部分 | ❌ | 丰富 | 商业 |
| frappe-gantt | 4k+ | ❌ (原生JS) | ❌ | 基础 | 一般 |

**选型结论：vue-ganttastic**

选择理由：
1. 原生 Vue 3 + TypeScript 支持，无需额外适配
2. 支持小时级精度（`precision="hour"`），满足一天维度展示
3. 内置拖拽、点击、当前时间线等交互功能
4. 提供插槽自定义时间轴标签格式
5. 轻量级，无复杂依赖

### 2.2 技术栈选择

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 前端框架 |
| TypeScript | 5.9+ | 类型安全 |
| Vite | 7.x | 构建工具 |
| vue-ganttastic | 2.3+ | 甘特图组件 |
| dayjs | 1.11+ | 时间处理 |

---

## 3. 技术方案

### 3.1 项目结构

```
src/
├── App.vue                    # 主页面组件
├── main.ts                    # 入口文件（dayjs 插件配置）
├── components/
│   └── code/
│       └── index.vue          # 数据调试面板
├── types/
│   └── index.d.ts             # 类型定义
├── utils/
│   └── index.ts               # 数据生成工具
└── style.css                  # 全局样式
```

### 3.2 数据结构设计

```typescript
// 甘特图条形数据类型
interface GanttBar {
  beginDate: string          // 开始时间 "YYYY-MM-DD HH:mm"
  endDate: string            // 结束时间 "YYYY-MM-DD HH:mm"
  ganttBarConfig: {
    id: string               // 唯一标识
    label?: string           // 显示文本
    style?: {
      background: string     // 背景色
    }
  }
}

// 甘特图行数据
interface GanttRow {
  label: string              // 行标签（分镜名称）
  bars: GanttBar[]           // 该行的任务条列表
}
```

**示例数据：**

```json
[
  {
    "label": "分镜 1",
    "bars": [
      {
        "beginDate": "2026-02-03 10:00",
        "endDate": "2026-02-03 12:00",
        "ganttBarConfig": {
          "id": "row-0-bar-0",
          "label": "任务 1",
          "style": { "background": "#42b883" }
        }
      }
    ]
  }
]
```

### 3.3 核心功能实现

#### 3.3.1 甘特图渲染

```vue
<GGanttChart
  :chart-start="chartStart"    <!-- 图表开始时间 -->
  :chart-end="chartEnd"        <!-- 图表结束时间 -->
  precision="hour"             <!-- 小时精度 -->
  bar-start="beginDate"        <!-- 条形开始时间字段 -->
  bar-end="endDate"            <!-- 条形结束时间字段 -->
  :row-height="45"             <!-- 行高 -->
  grid                         <!-- 显示网格 -->
  current-time                 <!-- 显示当前时间线 -->
  @click-bar="onBarClick"      <!-- 点击事件 -->
  @dragend-bar="onBarDragEnd"  <!-- 拖拽事件 -->
>
  <GGanttRow
    v-for="row in rows"
    :key="row.label"
    :label="row.label"
    :bars="row.bars"
  />
</GGanttChart>
```

#### 3.3.2 时间轴中文化

通过插槽自定义时间轴标签：

```vue
<!-- 日期显示：2月3日 -->
<template #upper-timeunit="{ value }">
  {{ dayjs(value).format('M月D日') }}
</template>

<!-- 小时显示：10时 -->
<template #timeunit="{ label }">
  {{ label }}时
</template>
```

#### 3.3.3 任务详情弹窗

点击任务条展示详情 Modal：

```vue
<div v-if="showModal" class="modal-overlay">
  <div class="modal-content">
    <div class="detail-item">
      <span class="detail-label">任务名称</span>
      <span class="detail-value">{{ selectedBarConfig.label }}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">开始时间</span>
      <span class="detail-value">{{ formatBarTime(selectedBar.beginDate) }}</span>
    </div>
    <!-- ... -->
  </div>
</div>
```

#### 3.3.4 数据调试面板

支持实时编辑 JSON 数据并重新渲染：

```vue
<CodePanel :data="rows" @update="onDataUpdate" />
```

功能特性：
- 显示完整 JSON 数据结构
- 支持编辑并应用更改
- JSON 格式校验
- 显示统计信息（行数、任务数）

### 3.4 dayjs 插件配置

vue-ganttastic 依赖 dayjs 的扩展插件，需在入口文件配置：

```typescript
// main.ts
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)
```

### 3.5 颜色方案

为确保同一分镜内的任务颜色不重复，采用 **Fisher-Yates 洗牌算法**：

```typescript
const colors = [
  '#42b883', '#27ae60', '#2ecc71',  // 绿色系
  '#3498db', '#2980b9', '#5dade2',  // 蓝色系
  '#e74c3c', '#c0392b', '#ff6b6b',  // 红色系
  // ... 共 40 种颜色
]

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

// 每行打乱颜色，按索引分配
const shuffledColors = shuffle(colors)
const color = shuffledColors[barIndex % shuffledColors.length]
```

---

## 4. 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  📅 抽卡师工作流程 - 今日任务甘特图                            │
│  2026-02-03 (小时维度)                                       │
├─────────────────────────────────────────┬───────────────────┤
│                                         │                   │
│            甘特图区域                    │    数据调试面板    │
│                                         │                   │
│  ┌─────┬────────────────────────────┐  │  ┌─────────────┐  │
│  │     │ 09  10  11  12  13  14 ... │  │  │ 数据结构    │  │
│  ├─────┼────────────────────────────┤  │  │             │  │
│  │分镜1│ ████  ████████             │  │  │ [           │  │
│  │分镜2│      ██████    ████        │  │  │   {...},    │  │
│  │分镜3│ ██████████████████████     │  │  │   {...}     │  │
│  │ ... │                            │  │  │ ]           │  │
│  └─────┴────────────────────────────┘  │  │             │  │
│                                         │  │ [应用更改]  │  │
│                                         │  └─────────────┘  │
└─────────────────────────────────────────┴───────────────────┘
```

---

## 5. 技术优化

### 5.1 Vue 最佳实践

基于 Vue Skills 规范进行代码组织：

```typescript
// ============================================
// 类型定义
// ============================================
interface GanttRowData { ... }

// ============================================
// 图表时间配置
// ============================================
const chartStart = computed(() => ...)

// ============================================
// Modal 状态管理
// ============================================
const showModal = ref(false)
const selectedBar = ref(null)

// ============================================
// 甘特图事件处理
// ============================================
function onBarClick() { ... }
```

### 5.2 性能

#### 当前测试数据规模

| 指标 | 数值 |
|------|------|
| 分镜行数 | 100 行 |
| 每行任务数 | 1-20 个（随机） |
| 总任务数 | 约 1000+ 个 |
| 时间范围 | 09:00 - 20:59（12 小时） |

#### 渲染性能表现

| 场景 | 表现 |
|------|------|
| 首次加载 | 100 行 × 平均 10 个任务，渲染流畅，无明显卡顿 |
| 滚动性能 | 甘特图区域滚动流畅，FPS 稳定 |
| 交互响应 | 点击任务条、拖拽操作响应及时（<100ms） |
| 数据更新 | JSON 编辑后应用更改，图表即时刷新 |

#### 优化措施

| 优化点 | 实现方式 |
|--------|----------|
| 响应式数据 | 使用 `ref` 管理数据，避免不必要的深层响应式 |
| 计算属性缓存 | `dateStr`、`chartStart`、`chartEnd` 使用 `computed` 缓存 |
| 样式隔离 | 使用 `scoped` 样式，减少选择器匹配开销 |
| 颜色预计算 | 每行颜色在数据生成时一次性分配，避免渲染时计算 |

#### 性能边界预估

| 数据规模 | 预期表现 |
|----------|----------|
| 100 行 / 1000 任务 | 流畅 ✅ |
| 500 行 / 5000 任务 | 可接受，建议分页 ⚠️ |
| 1000+ 行 | 需要虚拟滚动优化 ⚠️ |

> **建议**：实际业务中抽卡师一天的分镜数量通常在 50-200 个范围内，当前方案可满足需求。如后续数据量增大，可考虑引入虚拟滚动（如 `@vueuse/core` 的 `useVirtualList`）。

---

## 6. 后续扩展

### 6.1 功能扩展

- [ ] 任务拖拽后数据持久化
- [ ] 多日期切换
- [ ] 任务筛选/搜索
- [ ] 导出为图片/PDF
- [ ] 与后端 API 对接

### 6.2 UI 优化

- [ ] 深色/浅色主题切换
- [ ] 响应式布局适配
- [ ] 任务状态标识（已完成/进行中/待开始）
- [ ] 拖拽时的视觉反馈优化

---

## 7. 总结

本方案基于 **Vue 3 + TypeScript + vue-ganttastic** 技术栈，实现了抽卡师一天工作流程的可视化展示。核心特性包括：

1. **甘特图展示** - 以小时为单位展示分镜任务时间分布
2. **交互能力** - 支持点击查看详情、拖拽调整时间
3. **实时标记** - 显示当前时间线
4. **数据调试** - 支持实时编辑和预览数据结构

技术选型合理，代码结构清晰，具备良好的扩展性，可满足业务需求并支持后续功能迭代。
