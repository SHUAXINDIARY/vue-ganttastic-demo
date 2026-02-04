# Vue Gantt Chart Demo

基于 Vue 3 + TypeScript + vue-ganttastic 的甘特图可视化示例项目。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 前端框架 |
| TypeScript | 5.9+ | 类型安全 |
| Vite | 7.x | 构建工具 |
| vue-ganttastic | 2.3+ | 甘特图组件 |
| dayjs | 1.11+ | 时间处理 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

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

## 数据结构

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
  label: string              // 行标签
  bars: GanttBar[]           // 该行的任务条列表
}
```

**示例数据：**

```json
[
  {
    "label": "Row 1",
    "bars": [
      {
        "beginDate": "2026-02-03 10:00",
        "endDate": "2026-02-03 12:00",
        "ganttBarConfig": {
          "id": "row-0-bar-0",
          "label": "Task 1",
          "style": { "background": "#42b883" }
        }
      }
    ]
  }
]
```

## 核心功能

### 甘特图渲染

```vue
<GGanttChart
  :chart-start="chartStart"
  :chart-end="chartEnd"
  precision="hour"
  bar-start="beginDate"
  bar-end="endDate"
  :row-height="45"
  grid
  current-time
  @click-bar="onBarClick"
  @dragend-bar="onBarDragEnd"
>
  <GGanttRow
    v-for="row in rows"
    :key="row.label"
    :label="row.label"
    :bars="row.bars"
  />
</GGanttChart>
```

### 时间轴自定义

通过插槽自定义时间轴标签：

```vue
<template #upper-timeunit="{ value }">
  {{ dayjs(value).format('M月D日') }}
</template>

<template #timeunit="{ label }">
  {{ label }}时
</template>
```

### 数据调试面板

支持实时编辑 JSON 数据并重新渲染：

```vue
<CodePanel :data="rows" @update="onDataUpdate" />
```

功能特性：
- 显示完整 JSON 数据结构
- 支持编辑并应用更改
- JSON 格式校验
- 显示统计信息

## dayjs 插件配置

vue-ganttastic 依赖 dayjs 的扩展插件：

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

## 性能

### 测试数据规模

| 指标 | 数值 |
|------|------|
| 行数 | 100 行 |
| 每行任务数 | 1-20 个 |
| 总任务数 | 约 1000+ 个 |

### 性能表现

| 场景 | 表现 |
|------|------|
| 首次加载 | 渲染流畅，无明显卡顿 |
| 滚动性能 | FPS 稳定 |
| 交互响应 | <100ms |

### 性能边界

| 数据规模 | 预期表现 |
|----------|----------|
| 100 行 / 1000 任务 | 流畅 ✅ |
| 500 行 / 5000 任务 | 建议分页 ⚠️ |
| 1000+ 行 | 需要虚拟滚动 ⚠️ |

## License

MIT

