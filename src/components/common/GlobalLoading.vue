<template>
  <Transition name="loading-fade">
    <div v-if="isLoading" class="global-loading-overlay">
      <div class="loading-container">
        <!-- 主要加载动画 -->
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>

        <!-- 加载文本 -->
        <div class="loading-text">
          <span class="loading-dots">{{ loadingText }}</span>
        </div>

        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, toRefs } from 'vue'

interface Props {
  isLoading?: boolean
  text?: string
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  text: '加载中',
  showProgress: true
})

const progress = ref(0)
const dotCount = ref(0)
let progressInterval: ReturnType<typeof setInterval> | null = null
let dotsInterval: ReturnType<typeof setInterval> | null = null

const loadingText = computed(() => {
  const dots = '.'.repeat(dotCount.value)
  return props.text + dots
})

// 模拟进度条动画
const startProgress = () => {
  progress.value = 0
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 200)
}

// 完成进度条
const completeProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  progress.value = 100
}

// 点点动画
const startDotsAnimation = () => {
  dotsInterval = setInterval(() => {
    dotCount.value = (dotCount.value + 1) % 4
  }, 500)
}

// 监听加载状态变化
const { isLoading } = toRefs(props)
watch(isLoading, (newVal) => {
  if (newVal) {
    startProgress()
    startDotsAnimation()
  } else {
    completeProgress()
    setTimeout(() => {
      if (dotsInterval) {
        clearInterval(dotsInterval)
        dotsInterval = null
      }
      dotCount.value = 0
    }, 300)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (dotsInterval) {
    clearInterval(dotsInterval)
  }
})
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: all 0.3s ease;
}

.dark .global-loading-overlay {
  background: rgba(0, 0, 0, 0.95);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .loading-container {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 加载动画 */
.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #8b5cf6;
  animation-delay: -0.5s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #06d6a0;
  animation-delay: -1s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 加载文本 */
.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.dark .loading-text {
  color: #d1d5db;
}

.loading-dots {
  display: inline-block;
  min-width: 80px;
  text-align: left;
}

/* 进度条 */
.progress-bar {
  width: 200px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.dark .progress-bar {
  background: #374151;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06d6a0);
  background-size: 200% 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
  animation: gradient-shift 2s ease-in-out infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.3s ease;
}

.loading-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.loading-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .loading-container {
    padding: 30px 20px;
    gap: 20px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
  }

  .progress-bar {
    width: 160px;
  }

  .loading-text {
    font-size: 14px;
  }
}
</style>