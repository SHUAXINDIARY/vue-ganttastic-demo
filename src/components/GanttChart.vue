<script setup lang="ts">
import { computed } from 'vue'
import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'
import { RecycleScroller } from 'vue-virtual-scroller'
import dayjs from 'dayjs'
import type { GanttRowData, GanttBar } from '../types'

// ============================================
// Props & Emits
// ============================================
interface Props {
  rows: GanttRowData[]
  chartStart: string
  chartEnd: string
  rowHeight?: number
  precision?: 'hour' | 'day' | 'date' | 'month'
  virtualScrollThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 45,
  precision: 'hour',
  virtualScrollThreshold: 50,
})

const emit = defineEmits<{
  (e: 'click-bar', payload: { bar: GanttBar; e: MouseEvent }): void
}>()

// ============================================
// 虚拟滚动
// ============================================
const useVirtualScroll = computed(() => props.rows.length > props.virtualScrollThreshold)

const rowsWithId = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    id: `row-${index}-${row.label}`,
  }))
)

// ============================================
// 时间格式化
// ============================================
function formatUpperTimeunit(value: string): string {
  const date = dayjs(value)
  return date.isValid() ? date.format('M月D日') : value
}

function formatTimeunit(label: string | undefined): string {
  return label ? `${label}时` : ''
}

// ============================================
// 事件处理
// ============================================
function onBarClick(event: { bar: Record<string, unknown>; e: MouseEvent }) {
  emit('click-bar', { bar: event.bar as unknown as GanttBar, e: event.e })
}
</script>

<template>
  <div class="gantt-chart-wrapper">
    <GGanttChart
      :chart-start="chartStart"
      :chart-end="chartEnd"
      :precision="precision"
      width="100%"
      bar-start="beginDate"
      bar-end="endDate"
      :row-height="rowHeight"
      grid
      current-time
      current-time-label="当前时间"
      @click-bar="onBarClick"
    >
      <template #upper-timeunit="{ value }">
        {{ formatUpperTimeunit(value ?? '') }}
      </template>
      <template #timeunit="{ label }">
        {{ formatTimeunit(label) }}
      </template>

      <!-- 超过阈值时启用虚拟滚动 -->
      <RecycleScroller
        v-if="useVirtualScroll"
        class="virtual-scroller"
        :items="rowsWithId"
        :item-size="rowHeight"
        key-field="id"
        :buffer="rowHeight * 10"
      >
        <template #default="{ item }">
          <GGanttRow :label="item.label" :bars="item.bars" />
        </template>
      </RecycleScroller>

      <!-- 不超过阈值时正常渲染 -->
      <template v-else>
        <GGanttRow v-for="row in rows" :key="row.label" :label="row.label" :bars="row.bars" />
      </template>
    </GGanttChart>
  </div>
</template>

<style scoped>
.gantt-chart-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.gantt-chart-wrapper :deep(.g-gantt-chart) {
  min-height: 100%;
}

/* 虚拟滚动容器 */
.virtual-scroller {
  height: 100%;
  min-height: 200px;
}

/* 确保虚拟滚动内的行撑满宽度 */
.virtual-scroller :deep(.vue-recycle-scroller__item-view) {
  width: 100%;
}
</style>
