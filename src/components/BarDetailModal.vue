<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { GanttBar, GanttBarConfig } from '../types'

// ============================================
// Props & Emits
// ============================================
interface Props {
  visible: boolean
  bar: GanttBar | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

// ============================================
// 计算属性
// ============================================
const barConfig = computed<GanttBarConfig | null>(() => {
  if (!props.bar) return null
  return props.bar.ganttBarConfig as GanttBarConfig
})

// ============================================
// 工具函数
// ============================================
function formatBarTime(datetime: string): string {
  const date = dayjs(datetime)
  return date.isValid() ? date.format('HH:mm') : datetime
}

function close() {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && bar" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>任务详情</h2>
          <button class="modal-close" @click="close">&times;</button>
        </div>
        <div v-if="barConfig" class="modal-body">
          <div class="detail-item">
            <span class="detail-label">任务名称</span>
            <span class="detail-value">{{ barConfig.label ?? '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">任务ID</span>
            <span class="detail-value">{{ barConfig.id ?? '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">开始时间</span>
            <span class="detail-value">{{ formatBarTime(bar.beginDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">结束时间</span>
            <span class="detail-value">{{ formatBarTime(bar.endDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">颜色标识</span>
            <span class="detail-value">
              <span class="color-badge" :style="{ background: barConfig.style?.background }" />
              {{ barConfig.style?.background }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
