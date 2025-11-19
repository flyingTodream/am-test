<template>
  <div class="status-message-container">
    <!-- 错误消息 -->
    <transition name="error" appear>
      <div v-if="error" class="message error-message">
        <div class="message-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="message-content">
          <h4 class="message-title">错误</h4>
          <p class="message-text">{{ error }}</p>
        </div>
        <button class="message-close" @click="clearError">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>

    <!-- 成功消息 -->
    <transition name="success" appear>
      <div v-if="success" class="message success-message">
        <div class="message-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="message-content">
          <h4 class="message-title">成功</h4>
          <p class="message-text">{{ success }}</p>
        </div>
        <button class="message-close" @click="clearSuccess">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>

    <!-- 警告消息 -->
    <transition name="warning" appear>
      <div v-if="warning" class="message warning-message">
        <div class="message-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="message-content">
          <h4 class="message-title">警告</h4>
          <p class="message-text">{{ warning }}</p>
        </div>
        <button class="message-close" @click="clearWarning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>

    <!-- 信息消息 -->
    <transition name="info" appear>
      <div v-if="info" class="message info-message">
        <div class="message-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="message-content">
          <h4 class="message-title">信息</h4>
          <p class="message-text">{{ info }}</p>
        </div>
        <button class="message-close" @click="clearInfo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  error: {
    type: String,
    default: ''
  },
  success: {
    type: String,
    default: ''
  },
  warning: {
    type: String,
    default: ''
  },
  info: {
    type: String,
    default: ''
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['update:error', 'update:success', 'update:warning', 'update:info'])

// 清除消息方法
const clearError = () => {
  emit('update:error', '')
}

const clearSuccess = () => {
  emit('update:success', '')
}

const clearWarning = () => {
  emit('update:warning', '')
}

const clearInfo = () => {
  emit('update:info', '')
}

// 自动关闭功能
const setupAutoClose = () => {
  if (!props.autoClose) return

  if (props.error) {
    setTimeout(clearError, props.duration)
  }
  if (props.success) {
    setTimeout(clearSuccess, props.duration)
  }
  if (props.warning) {
    setTimeout(clearWarning, props.duration)
  }
  if (props.info) {
    setTimeout(clearInfo, props.duration)
  }
}

// 监听消息变化，设置自动关闭
watch([() => props.error, () => props.success, () => props.warning, () => props.info], () => {
  setupAutoClose()
}, { immediate: true })
</script>

<style scoped>
.status-message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  width: 100%;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  border-left: 4px solid;
}

.error-message {
  background: #fef2f2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.success-message {
  background: #f0fdf4;
  border-left-color: #22c55e;
  color: #166534;
}

.warning-message {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #92400e;
}

.info-message {
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #1e40af;
}

.message-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.error-message .message-icon {
  color: #ef4444;
}

.success-message .message-icon {
  color: #22c55e;
}

.warning-message .message-icon {
  color: #f59e0b;
}

.info-message .message-icon {
  color: #3b82f6;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  line-height: 1.25;
}

.message-text {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-close {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  border-radius: 4px;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.message-close:hover {
  opacity: 1;
}

/* 过渡动画 */
.error-enter-active,
.error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.success-enter-active,
.success-leave-active {
  transition: all 0.3s ease;
}

.success-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.success-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.warning-enter-active,
.warning-leave-active {
  transition: all 0.3s ease;
}

.warning-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.warning-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.info-enter-active,
.info-leave-active {
  transition: all 0.3s ease;
}

.info-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.info-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .status-message-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }

  .message {
    padding: 0.875rem;
  }

  .message-title {
    font-size: 0.8rem;
  }

  .message-text {
    font-size: 0.8rem;
  }
}
</style>