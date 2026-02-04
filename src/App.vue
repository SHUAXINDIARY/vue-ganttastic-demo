<script setup lang="ts">
import { ref } from 'vue'
import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'
import dayjs from 'dayjs'
import { rows } from './utils'
import CodePanel from './components/code/index.vue'
import type { GanttBar } from './types'

interface GanttRowData {
  label: string
  bars: GanttBar[]
}

// 获取今天的日期
const today = new Date()
const dateStr = today.toISOString().split('T')[0]

// 图表时间范围：一天 09:00 - 20:59
const chartStart = `${dateStr} 09:00`
const chartEnd = `${dateStr} 20:59`

// Modal 状态
const showModal = ref(false)
const selectedBar = ref<Record<string, unknown> | null>(null)

// 格式化上方时间轴标签（月份+天数中文格式）
function formatUpperTimeunit(value: string): string {
  const date = dayjs(value)
  return date.isValid() ? date.format('M月D日') : value
}

// 格式化小时时间轴标签
function formatTimeunit(label: string | undefined): string {
  return label ? `${label}时` : ''
}

// 格式化时间显示
function formatBarTime(datetime: string): string {
  const date = dayjs(datetime)
  return date.isValid() ? date.format('HH:mm') : datetime
}

// 条形拖动事件处理
function onBarDragEnd(event: { bar: Record<string, unknown>; e: MouseEvent }) {
  console.log('Bar dragged:', event.bar)
}

// 条形点击事件 - 打开详情 Modal
function onBarClick(event: { bar: Record<string, unknown>; e: MouseEvent }) {
  selectedBar.value = event.bar
  showModal.value = true
}

// 关闭 Modal
function closeModal() {
  showModal.value = false
  selectedBar.value = null
}

// 更新甘特图数据
function onDataUpdate(newData: GanttRowData[]) {
  rows.value = newData
}
</script>

<template>
  <div class="page-container">
    <div class="header">
      <h1 class="title">📅 今日任务甘特图</h1>
      <p class="subtitle">{{ dateStr }} (小时维度)</p>
    </div>
<!-- 操作控制区块 -->
 
    <div class="main-content">
      <!-- 左侧甘特图 -->
      <div class="gantt-wrapper">
        <GGanttChart :chart-start="chartStart" :chart-end="chartEnd" precision="hour" width="100%" bar-start="beginDate"
          bar-end="endDate" :row-height="45" grid current-time current-time-label="当前时间" @click-bar="onBarClick"
          @dragend-bar="onBarDragEnd">
          <template #upper-timeunit="{ value }">
            {{ formatUpperTimeunit(value ?? '') }}
          </template>
          <template #timeunit="{ label }">
            {{ formatTimeunit(label) }}
          </template>
          <GGanttRow v-for="row in rows" :key="row.label" :label="row.label" :bars="row.bars" />
        </GGanttChart>
      </div>

      <!-- 右侧数据面板 -->
      <div class="code-wrapper">
        <CodePanel :data="rows" @update="onDataUpdate" />
      </div>
    </div>

    <!-- 详情 Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>任务详情</h2>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <div v-if="selectedBar" class="modal-body">
            <div class="detail-item">
              <span class="detail-label">任务名称</span>
              <span class="detail-value">{{ (selectedBar.ganttBarConfig as Record<string, unknown>)?.label ?? '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务ID</span>
              <span class="detail-value">{{ (selectedBar.ganttBarConfig as Record<string, unknown>)?.id ?? '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">开始时间</span>
              <span class="detail-value">{{ formatBarTime(selectedBar.beginDate as string) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结束时间</span>
              <span class="detail-value">{{ formatBarTime(selectedBar.endDate as string) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">颜色标识</span>
              <span class="detail-value">
                <span 
                  class="color-badge" 
                  :style="{ background: ((selectedBar.ganttBarConfig as Record<string, unknown>)?.style as Record<string, string>)?.background }"
                ></span>
                {{ ((selectedBar.ganttBarConfig as Record<string, unknown>)?.style as Record<string, string>)?.background }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.title {
  font-size: 1.8em;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1em;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.gantt-wrapper {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.gantt-wrapper :deep(.g-gantt-chart) {
  min-height: 100%;
}

.code-wrapper {
  width: 400px;
  flex-shrink: 0;
}

/* Modal 样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 360px;
  max-width: 90vw;
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 80px;
  color: #7f8c8d;
  font-size: 0.9em;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-badge {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
