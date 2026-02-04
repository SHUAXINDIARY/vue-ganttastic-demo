<script setup lang="ts">
// import { ref } from 'vue'
import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'
// import type { GanttBar } from './types'
import { rows } from './utils'
// 获取今天的日期
const today = new Date()
const dateStr = today.toISOString().split('T')[0]

// 图表时间范围：一天 00:00 - 23:59
const chartStart = `${dateStr} 09:00`
const chartEnd = `${dateStr} 20:59`

// 条形拖动事件处理
function onBarDragEnd(event: { bar: Record<string, unknown>; e: MouseEvent }) {
  console.log('Bar dragged:', event.bar)
}

// 条形点击事件
function onBarClick(event: { bar: Record<string, unknown>; e: MouseEvent }) {
  const config = event.bar.ganttBarConfig as { label?: string }
  console.log('Bar clicked:', config?.label)
}
</script>

<template>
  <div class="gantt-container">
    <h1 class="title">📅 今日任务甘特图</h1>
    <p class="subtitle">{{ dateStr }} (小时维度)</p>
    
    <GGanttChart
      :chart-start="chartStart"
      :chart-end="chartEnd"
      precision="hour"
      width="100%"
      bar-start="beginDate"
      bar-end="endDate"
      :row-height="45"
      grid
      current-time
      current-time-label="当前时间"
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
  </div>
</template>

<style scoped>
.gantt-container {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title {
  font-size: 1.8em;
  color: #2c3e50;
  margin: 0 0 8px 0;
  flex-shrink: 0;
}

.subtitle {
  color: #7f8c8d;
  margin: 0 0 16px 0;
  font-size: 1.1em;
  flex-shrink: 0;
}

.gantt-container :deep(.g-gantt-chart) {
  flex: 1;
  min-height: 0;
}
</style>
