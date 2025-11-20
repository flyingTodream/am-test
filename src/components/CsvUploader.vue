<template>
  <div class="csv-uploader">
    <!-- 简单的上传按钮 -->
    <button class="upload-btn" :disabled="isLoading" @click="triggerFileUpload">
      <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <div v-else class="loading-spinner"></div>
      <span>{{ isLoading ? '处理中...' : '上传CSV文件' }}</span>
    </button>

    <input ref="fileInput" type="file" class="file-input" accept=".csv" @change="handleFileSelect">

    <!-- 文件信息 -->
    <div v-if="fileInfo" class="file-info">
      <div class="file-details">
        <div class="file-icon">📄</div>
        <div class="file-data">
          <div class="file-name">{{ fileInfo.name }}</div>
          <div class="file-meta">
            {{ formatFileSize(fileInfo.size) }}
          </div>
        </div>
        <button class="btn-remove" @click="removeFile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['file-selected', 'file-removed'])

// 响应式数据
const fileInput = ref(null)
const isLoading = ref(false)
const fileInfo = ref(null)

// 触发文件上传
const triggerFileUpload = () => {
  if (!isLoading.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件
const processFile = async (file) => {
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    showError('请选择CSV格式的文件')
    return
  }

  isLoading.value = true
  fileInfo.value = file

  try {
    emit('file-selected', file)
  } catch (error) {
    showError(error.message)
    removeFile()
  } finally {
    isLoading.value = false
  }
}

// 移除文件
const removeFile = () => {
  fileInfo.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('file-removed')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

// 显示错误（这个方法需要从父组件传入或使用全局错误处理）
const showError = (message) => {
  console.error(message)
  // 这里可以emit错误事件，或者使用全局状态管理
}

// 暴露方法给父组件
defineExpose({
  removeFile
})
</script>

<style scoped>
.csv-uploader {
  width: 100%;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  justify-content: center;
}

.upload-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.upload-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.upload-btn svg {
  flex-shrink: 0;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.file-input {
  display: none;
}

.file-info {
  margin-top: 1rem;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.file-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.file-data {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.file-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-remove svg {
  width: 14px;
  height: 14px;
}

@media (max-width: 640px) {
  .upload-btn {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  .file-details {
    padding: 0.625rem;
    gap: 0.5rem;
  }

  .file-name {
    font-size: 0.8rem;
  }

  .file-meta {
    font-size: 0.7rem;
  }
}
</style>