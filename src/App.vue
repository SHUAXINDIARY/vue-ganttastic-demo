<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import dayjs from 'dayjs'
import { rows, generateRows, defaultConfig, type GenerateConfig } from './utils'
import GanttChart from './components/GanttChart.vue'
import BarDetailModal from './components/BarDetailModal.vue'
import CodePanel from './components/code/index.vue'
import type { GanttBar, GanttRowData } from './types'

// ============================================
// 图表时间配置
// ============================================
const dateStr = computed(() => dayjs().format('YYYY-MM-DD'))
const chartStart = computed(() => `${dateStr.value} 09:00`)
const chartEnd = computed(() => `${dateStr.value} 20:59`)

// ============================================
// Modal 状态管理
// ============================================
const showModal = ref(false)
const selectedBar = ref<GanttBar | null>(null)

function onBarClick(payload: { bar: GanttBar; e: MouseEvent }) {
  selectedBar.value = payload.bar
  showModal.value = true
}

function onModalClose() {
  selectedBar.value = null
}

// ============================================
// 数据更新
// ============================================
function onDataUpdate(newData: GanttRowData[]) {
  rows.value = newData
}

// ============================================
// 生成数量控制
// ============================================
const generateConfig = ref<GenerateConfig>({ ...defaultConfig })
const isGenerating = ref(false)

// ============================================
// 性能统计
// ============================================
const dataGenerateTime = ref<number | null>(null)
const chartRenderTime = ref<number | null>(null)

async function regenerateData() {
  isGenerating.value = true
  dataGenerateTime.value = null
  chartRenderTime.value = null

  // 使用 setTimeout 让 UI 有机会更新显示 loading 状态
  await new Promise(resolve => setTimeout(resolve, 50))

  try {
    // 统计数据生成时间
    const generateStart = performance.now()
    const newRows = generateRows(generateConfig.value)
    const generateEnd = performance.now()
    dataGenerateTime.value = Math.round((generateEnd - generateStart) * 100) / 100

    // 统计图表渲染时间
    const renderStart = performance.now()
    rows.value = newRows

    // 等待 DOM 更新完成
    await nextTick()
    // 额外等待一帧确保渲染完成
    await new Promise(resolve => requestAnimationFrame(resolve))
    const renderEnd = performance.now()
    chartRenderTime.value = Math.round((renderEnd - renderStart) * 100) / 100
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <header class="header">
      <h1 class="title">抽卡师 刷新 - 今日任务甘特图</h1>
      <p class="subtitle">{{ dateStr }} (小时维度)</p>
    </header>

    <!-- 生成数量控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label class="control-label">分镜数量</label>
        <input
          v-model.number="generateConfig.rowCount"
          type="number"
          class="control-input"
          min="1"
          max="500"
        />
      </div>
      <div class="control-group">
        <label class="control-label">最少任务数</label>
        <input
          v-model.number="generateConfig.minBars"
          type="number"
          class="control-input"
          min="1"
          max="50"
        />
      </div>
      <div class="control-group">
        <label class="control-label">最多任务数</label>
        <input
          v-model.number="generateConfig.maxBars"
          type="number"
          class="control-input"
          min="1"
          max="50"
        />
      </div>
      <button class="regenerate-btn" :disabled="isGenerating" @click="regenerateData">
        <span v-if="isGenerating" class="btn-loading">
          <span class="spinner" />
          生成中...
        </span>
        <span v-else>重新生成</span>
      </button>

      <!-- 性能统计面板 -->
      <div v-if="dataGenerateTime !== null || chartRenderTime !== null" class="stats-panel">
        <div v-if="dataGenerateTime !== null" class="stats-item">
          <span class="stats-label">数据生成</span>
          <span class="stats-value">{{ dataGenerateTime }} ms</span>
        </div>
        <div v-if="chartRenderTime !== null" class="stats-item">
          <span class="stats-label">图表渲染</span>
          <span class="stats-value">{{ chartRenderTime }} ms</span>
        </div>
        <div v-if="dataGenerateTime !== null && chartRenderTime !== null" class="stats-item stats-total">
          <span class="stats-label">总耗时</span>
          <span class="stats-value">{{ Math.round((dataGenerateTime + chartRenderTime) * 100) / 100 }} ms</span>
        </div>
      </div>
    </div>

    <!-- Loading 遮罩层 -->
    <div v-if="isGenerating" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner" />
        <p class="loading-text">正在生成数据...</p>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧甘特图 -->
      <div class="gantt-wrapper">
        <GanttChart
          :rows="rows"
          :chart-start="chartStart"
          :chart-end="chartEnd"
          @click-bar="onBarClick"
        />
      </div>

      <!-- 右侧数据面板 -->
      <div class="code-wrapper">
        <CodePanel :data="rows" @update="onDataUpdate" />
      </div>
    </div>

    <!-- 任务详情弹窗 -->
    <BarDetailModal
      v-model:visible="showModal"
      :bar="selectedBar"
      @close="onModalClose"
    />
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

/* 控制面板样式 */
.control-panel {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 0.9em;
  color: #495057;
  white-space: nowrap;
}

.control-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9em;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.control-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.15);
}

.regenerate-btn {
  padding: 8px 16px;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.regenerate-btn:hover {
  background: #3aa876;
}

.regenerate-btn:active {
  transform: scale(0.98);
}

.regenerate-btn:disabled {
  background: #9ed4be;
  cursor: not-allowed;
  transform: none;
}

/* 性能统计面板样式 */
.stats-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
  margin-left: auto;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-label {
  font-size: 0.85em;
  color: #558b2f;
}

.stats-value {
  font-size: 0.85em;
  font-weight: 600;
  color: #33691e;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

.stats-total {
  padding-left: 12px;
  border-left: 1px solid #a5d6a7;
}

.stats-total .stats-label {
  color: #2e7d32;
}

.stats-total .stats-value {
  color: #1b5e20;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Loading 遮罩层样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e9ecef;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  color: #495057;
  font-size: 1em;
  font-weight: 500;
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
}

.code-wrapper {
  width: 400px;
  flex-shrink: 0;
}
</style>
