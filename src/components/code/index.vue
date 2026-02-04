<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GanttBar } from '../../types'

interface GanttRow {
  label: string
  bars: GanttBar[]
}

const props = defineProps<{
  data: GanttRow[]
}>()

const emit = defineEmits<{
  (e: 'update', data: GanttRow[]): void
}>()

// 编辑器内容
const editorContent = ref('')
const isEdited = ref(false)
const errorMessage = ref('')

// 初始化编辑器内容
function initContent() {
  editorContent.value = JSON.stringify(props.data, null, 2)
  isEdited.value = false
  errorMessage.value = ''
}

// 监听 props.data 变化，同步更新编辑器内容
watch(() => props.data, () => {
  if (!isEdited.value) {
    initContent()
  }
}, { immediate: true, deep: true })

// 处理输入变化
function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  editorContent.value = target.value
  isEdited.value = true
  errorMessage.value = ''
}

// 应用更改
function applyChanges() {
  try {
    const parsed = JSON.parse(editorContent.value) as GanttRow[]
    
    // 基本校验
    if (!Array.isArray(parsed)) {
      throw new Error('数据必须是数组格式')
    }
    
    emit('update', parsed)
    isEdited.value = false
    errorMessage.value = ''
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '无效的 JSON 格式'
  }
}

// 重置更改
function resetChanges() {
  initContent()
}

// 统计信息
const stats = computed(() => {
  const totalRows = props.data.length
  const totalBars = props.data.reduce((sum, row) => sum + row.bars.length, 0)
  return { totalRows, totalBars }
})
</script>

<template>
  <div class="code-panel">
    <div class="panel-header">
      <h3>数据结构 - 可编辑</h3>
      <div class="stats">
        <span class="stat-item">行数: {{ stats.totalRows }}</span>
        <span class="stat-item">任务数: {{ stats.totalBars }}</span>
      </div>
    </div>
    
    <div class="code-content">
      <textarea 
        :value="editorContent"
        @input="onInput"
        spellcheck="false"
        class="code-editor"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 操作按钮 -->
    <div v-if="isEdited" class="action-bar">
      <button class="btn btn-reset" @click="resetChanges">重置</button>
      <button class="btn btn-apply" @click="applyChanges">应用更改</button>
    </div>
  </div>
</template>

<style scoped>
.code-panel {
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.9em;
  color: #cccccc;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  font-size: 0.75em;
  color: #858585;
  background: #3c3c3c;
  padding: 2px 8px;
  border-radius: 4px;
}

.code-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.code-editor {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: #1e1e1e;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #9cdcfe;
  white-space: pre;
  overflow: auto;
}

.code-editor:focus {
  background: #1e1e1e;
}

/* 错误提示 */
.error-message {
  padding: 8px 16px;
  background: #5a1d1d;
  color: #f48771;
  font-size: 0.8em;
  flex-shrink: 0;
}

/* 操作按钮栏 */
.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #252526;
  border-top: 1px solid #3c3c3c;
  flex-shrink: 0;
}

.btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.85em;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-reset {
  background: #3c3c3c;
  color: #cccccc;
}

.btn-reset:hover {
  background: #4f4f4f;
}

.btn-apply {
  background: #0e639c;
  color: #ffffff;
  flex: 1;
}

.btn-apply:hover {
  background: #1177bb;
}

/* 自定义滚动条 */
.code-editor::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-editor::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.code-editor::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

.code-editor::-webkit-scrollbar-thumb:hover {
  background: #4f4f4f;
}
</style>