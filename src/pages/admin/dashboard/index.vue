<template>
  <div class="system-monitor-container p-4 bg-gray-50 h-screen overflow-hidden">
    <div class="mb-3">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">系统监控大屏</h1>
      <p class="text-sm text-gray-600">实时监控系统资源使用情况</p>
    </div>

    <!-- 监控信息网格布局 -->
    <div class="grid grid-cols-4 gap-3 h-[calc(100vh-120px)]">
      <!-- CPU监控 -->
      <div class="bg-white rounded-lg shadow-md p-3">
        <h3 class="text-sm font-semibold text-gray-800 mb-2">CPU监控</h3>
        <div class="space-y-2">
          <div class="text-xs text-gray-600">
            <div class="flex justify-between mb-1">
              <span>核心数: {{ cpuInfo.cpu_count || 0 }}</span>
              <span>{{ cpuInfo.cpu_freq?.current || 0 }} MHz</span>
            </div>
          </div>
          <div v-if="cpuInfo.cpu_percent && cpuInfo.cpu_percent.length">
            <div class="space-y-1">
              <div v-for="(percent, index) in cpuInfo.cpu_percent.slice(0, 4)" :key="index" class="flex items-center">
                <span class="text-xs text-gray-500 w-8">{{ index + 1 }}</span>
                <div class="flex-1 bg-gray-200 rounded-full h-1.5 mx-1">
                  <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" :style="{ width: percent + '%' }"></div>
                </div>
                <span class="text-xs text-gray-600 w-8">{{ percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存监控 -->
      <div class="bg-white rounded-lg shadow-md p-3">
        <h3 class="text-sm font-semibold text-gray-800 mb-2">内存监控</h3>
        <div class="space-y-2">
          <div>
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>使用率</span>
              <span>{{ memoryInfo.memory?.percent || 0 }}%</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full transition-all duration-300" :style="{ width: (memoryInfo.memory?.percent || 0) + '%' }"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p class="text-gray-600">总内存</p>
              <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.total || 0) }}</p>
            </div>
            <div>
              <p class="text-gray-600">已使用</p>
              <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.used || 0) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 磁盘监控 -->
      <div class="bg-white rounded-lg shadow-md p-3">
        <h3 class="text-sm font-semibold text-gray-800 mb-2">磁盘监控</h3>
        <div class="space-y-2">
          <div v-for="disk in diskInfo.disk_info.slice(0, 2)" :key="disk.device" class="border-b border-gray-100 pb-2 last:border-b-0">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-800">{{ disk.device }}</span>
              <span class="text-xs text-gray-600">{{ disk.percent }}%</span>
            </div>
            <div class="bg-gray-200 rounded-full h-1.5 mb-1">
              <div class="bg-yellow-600 h-1.5 rounded-full transition-all duration-300" :style="{ width: disk.percent + '%' }"></div>
            </div>
            <div class="text-xs text-gray-600">
              <div class="flex justify-between">
                <span>{{ formatBytes(disk.used) }}</span>
                <span>{{ formatBytes(disk.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统警告 -->
      <div class="bg-white rounded-lg shadow-md p-3">
        <h3 class="text-sm font-semibold text-gray-800 mb-2">系统状态</h3>
        <div v-if="systemOverview.alerts && systemOverview.alerts.length" class="space-y-1">
          <div v-for="(alert, index) in systemOverview.alerts.slice(0, 3)" :key="index" class="flex items-center p-2 rounded text-xs" :class="{
            'bg-yellow-50 border border-yellow-200': alert.type === 'warning',
            'bg-red-50 border border-red-200': alert.type === 'error',
            'bg-blue-50 border border-blue-200': alert.type === 'info'
          }">
            <div class="flex-1">
              <p class="font-medium" :class="{
                'text-yellow-800': alert.type === 'warning',
                'text-red-800': alert.type === 'error',
                'text-blue-800': alert.type === 'info'
              }">{{ alert.message }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-gray-500 text-center py-4">
          系统运行正常
        </div>
      </div>

      <!-- 进程监控 -->
      <div class="bg-white rounded-lg shadow-md p-3 col-span-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-semibold text-gray-800">进程监控 (总数: {{ processInfo.total_processes || 0 }})</h3>
          <div class="flex space-x-2">
            <select v-model="processSortBy" @change="fetchProcessInfo" class="text-xs border border-gray-300 rounded px-1 py-0.5">
              <option value="cpu_percent">按CPU排序</option>
              <option value="memory_percent">按内存排序</option>
            </select>
            <select v-model="processLimit" @change="fetchProcessInfo" class="text-xs border border-gray-300 rounded px-1 py-0.5">
              <option value="10">显示10个</option>
              <option value="15">显示15个</option>
            </select>
          </div>
        </div>
        <div class="overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">PID</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">进程名</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">CPU%</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">内存%</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">内存使用</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="process in processInfo.processes" :key="process.pid" class="hover:bg-gray-50">
                <td class="px-2 py-1 text-xs text-gray-900">{{ process.pid }}</td>
                <td class="px-2 py-1 text-xs text-gray-900 truncate max-w-32">{{ process.name }}</td>
                <td class="px-2 py-1 text-xs">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                    'bg-red-100 text-red-800': process.cpu_percent > 50,
                    'bg-yellow-100 text-yellow-800': process.cpu_percent > 20 && process.cpu_percent <= 50,
                    'bg-green-100 text-green-800': process.cpu_percent <= 20
                  }">
                    {{ process.cpu_percent }}%
                  </span>
                </td>
                <td class="px-2 py-1 text-xs">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                    'bg-red-100 text-red-800': process.memory_percent > 10,
                    'bg-yellow-100 text-yellow-800': process.memory_percent > 5 && process.memory_percent <= 10,
                    'bg-green-100 text-green-800': process.memory_percent <= 5
                  }">
                    {{ process.memory_percent.toFixed(2) }}%
                  </span>
                </td>
                <td class="px-2 py-1 text-xs text-gray-900">{{ formatBytes(process.memory_info?.rss || 0) }}</td>
                <td class="px-2 py-1 text-xs">
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                    'bg-green-100 text-green-800': process.status === 'running',
                    'bg-yellow-100 text-yellow-800': process.status === 'sleeping',
                    'bg-red-100 text-red-800': process.status === 'stopped'
                  }">
                    {{ process.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>

    <!-- 底部状态栏 -->
     <div class="absolute bottom-2 left-4 right-4 flex justify-between items-center bg-white rounded-lg shadow-md px-3 py-1">
       <div class="text-xs text-gray-600">
         最后更新: {{ lastUpdateTime || 'N/A' }}
       </div>
       <div class="flex space-x-2 items-center">
         <button @click="refreshAllData" :disabled="loading" class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
           <svg v-if="loading" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           {{ loading ? '刷新中...' : '刷新' }}
         </button>
         <label class="flex items-center text-xs">
            <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh" class="mr-1">
            <span class="text-xs text-gray-600">自动刷新 ({{ refreshInterval / 1000 }}s)</span>
          </label>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { monitorApi } from '@/api/system_file'

// 响应式数据
const loading = ref(false)
const lastUpdateTime = ref('')
const autoRefresh = ref(true)
const refreshInterval = ref(5000) // 5秒刷新间隔
let refreshTimer = null

// 监控数据
const systemOverview = ref({})
const cpuInfo = ref({})
const memoryInfo = ref({})
const diskInfo = ref({ disk_info: [] })
const networkInfo = ref({ network_info: {} })
const processInfo = ref({ processes: [], total_processes: 0 })
const gpuInfo = ref({ gpu_available: false, gpu_info: [], message: '' })

// 进程监控参数
const processSortBy = ref('cpu_percent')
const processLimit = ref('10')

// 工具函数
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// API调用函数
const fetchSystemOverview = async () => {
  try {
    const response = await monitorApi.getSystemOverview()
    console.log('系统概览API响应:', response)
    if (response.code === 200 && response.data) {
      systemOverview.value = response.data
      console.log('系统概览数据:', systemOverview.value)
    }
  } catch (error) {
    console.error('获取系统概览失败:', error)
  }
}

const fetchCpuInfo = async () => {
  try {
    const response = await monitorApi.getCpuMonitor()
    console.log('CPU监控API响应:', response)
    if (response.code === 200 && response.data) {
      cpuInfo.value = response.data
      console.log('CPU数据:', cpuInfo.value)
    }
  } catch (error) {
    console.error('获取CPU信息失败:', error)
  }
}

const fetchMemoryInfo = async () => {
  try {
    const response = await monitorApi.getMemoryMonitor()
    console.log('内存监控API响应:', response)
    if (response.code === 200 && response.data) {
      memoryInfo.value = response.data
      console.log('内存数据:', memoryInfo.value)
    }
  } catch (error) {
    console.error('获取内存信息失败:', error)
  }
}

const fetchDiskInfo = async () => {
  try {
    const response = await monitorApi.getDiskMonitor()
    if (response.code === 200 && response.data) {
      diskInfo.value = response.data
    }
  } catch (error) {
    console.error('获取磁盘信息失败:', error)
  }
}

const fetchNetworkInfo = async () => {
  try {
    const response = await monitorApi.getNetworkMonitor()
    if (response.code === 200 && response.data) {
      networkInfo.value = response.data
    }
  } catch (error) {
    console.error('获取网络信息失败:', error)
  }
}

const fetchProcessInfo = async () => {
  try {
    const response = await monitorApi.getProcessMonitor({
      limit: parseInt(processLimit.value),
      sort_by: processSortBy.value
    })
    if (response.code === 200 && response.data) {
      processInfo.value = response.data
    }
  } catch (error) {
    console.error('获取进程信息失败:', error)
  }
}

const fetchGpuInfo = async () => {
  try {
    const response = await monitorApi.getGpuMonitor()
    if (response.code === 200 && response.data) {
      gpuInfo.value = response.data
    }
  } catch (error) {
    console.error('获取GPU信息失败:', error)
  }
}

// 刷新所有数据
const refreshAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchSystemOverview(),
      fetchCpuInfo(),
      fetchMemoryInfo(),
      fetchDiskInfo(),
      fetchNetworkInfo(),
      fetchProcessInfo(),
      fetchGpuInfo()
    ])
    lastUpdateTime.value = new Date().toLocaleString()
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 自动刷新控制
const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(() => {
    refreshAllData()
  }, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(() => {
  refreshAllData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.system-monitor-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>