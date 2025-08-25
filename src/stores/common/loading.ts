import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingText = ref('加载中')
  const showProgress = ref(true)

  // 显示加载动画
  const showLoading = (text: string = '加载中', progress: boolean = true) => {
    loadingText.value = text
    showProgress.value = progress
    isLoading.value = true
  }

  // 隐藏加载动画
  const hideLoading = () => {
    isLoading.value = false
  }

  // 设置加载文本
  const setLoadingText = (text: string) => {
    loadingText.value = text
  }

  return {
    isLoading,
    loadingText,
    showProgress,
    showLoading,
    hideLoading,
    setLoadingText
  }
})