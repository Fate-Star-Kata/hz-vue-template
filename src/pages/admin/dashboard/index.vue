<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Motion } from 'motion-v'
import { Refresh } from '@element-plus/icons-vue'
import SystemMonitorChart from '@/components/admin/dashboard/SystemMonitorChart.vue'
import UserActivityChart from '@/components/admin/dashboard/UserActivityChart.vue'
import DataTable from '@/components/admin/dashboard/DataTable.vue'
import { getUsersAPI } from '@/api/admin/users'
import { monitorApi } from '@/api/system_file/index'
import { logsApi } from '@/api/admin/logs'
import type { SystemOverview } from '@/api/system_file/index'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.05,
    y: -10,
    transition: { duration: 0.3, ease: ['easeOut'] }
  },
  transition: { duration: 0.6, ease: ['easeOut'] }
}

const statsCardVariants = {
  initial: { opacity: 0, x: -50, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  whileHover: {
    scale: 1.03,
    y: -5,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.5, ease: ['easeOut'] }
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  whileHover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.4, ease: ['easeOut'], delay: 0.2 }
}

// 数据状态
const loading = ref(false)
const systemOverview = ref<SystemOverview | null>(null)
const dashboardStats = ref({
  totalUsers: 0,
  todayOrders: 0,
  totalRevenue: 0,
  activeUsers: 0,
  todayLogs: 0
})

let refreshTimer: number | null = null

// 统计卡片数据
const stats = computed(() => [
  {
    title: '总用户数',
    value: dashboardStats.value.totalUsers.toLocaleString(),
    change: '+12%',
    changeType: 'increase',
    icon: 'user',
    color: 'bg-blue-500'
  },
  {
    title: '今日日志',
    value: dashboardStats.value.todayLogs.toString(),
    change: '+5%',
    changeType: 'increase',
    icon: 'file-text',
    color: 'bg-green-500'
  },
  {
    title: 'CPU使用率',
    value: systemOverview.value?.resource_summary ? `${Math.round(systemOverview.value.resource_summary.cpu_percent)}%` : '0%',
    change: (systemOverview.value?.resource_summary?.cpu_percent ?? 0) > 70 ? '高负载' : '正常',
    changeType: (systemOverview.value?.resource_summary?.cpu_percent ?? 0) > 70 ? 'decrease' : 'increase',
    icon: 'cpu',
    color: 'bg-yellow-500'
  },
  {
    title: '内存使用率',
    value: systemOverview.value?.resource_summary ? `${Math.round(systemOverview.value.resource_summary.memory_percent)}%` : '0%',
    change: (systemOverview.value?.resource_summary?.memory_percent ?? 0) > 80 ? '高负载' : '正常',
    changeType: (systemOverview.value?.resource_summary?.memory_percent ?? 0) > 80 ? 'decrease' : 'increase',
    icon: 'hard-drive',
    color: 'bg-purple-500'
  }
])

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    loading.value = true

    // 并行获取所有数据
    const [usersResponse, systemResponse, logsResponse] = await Promise.allSettled([
      getUsersAPI({ page: 1, page_size: 1, query: '' }),
      monitorApi.getSystemOverview(),
      logsApi.getOperationLogs({ page: 1, page_size: 1, start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0] })
    ])

    // 处理用户数据
    if (usersResponse.status === 'fulfilled' && usersResponse.value.code === 200) {
      dashboardStats.value.totalUsers = usersResponse.value.data?.total || 0
      dashboardStats.value.activeUsers = Math.floor(dashboardStats.value.totalUsers * 0.7) // 假设70%活跃
    } else {
      // 使用模拟数据
      dashboardStats.value.totalUsers = 1234
      dashboardStats.value.activeUsers = 892
    }

    // 处理系统监控数据
    if (systemResponse.status === 'fulfilled' && systemResponse.value.code === 200) {
      systemOverview.value = systemResponse.value.data
    }

    // 处理日志数据
    if (logsResponse.status === 'fulfilled' && logsResponse.value.code === 200) {
      dashboardStats.value.todayLogs = logsResponse.value.data?.pagination?.total_count || 0
    } else {
      dashboardStats.value.todayLogs = 45
    }

    // 模拟其他数据
    dashboardStats.value.todayOrders = Math.floor(Math.random() * 100) + 50
    dashboardStats.value.totalRevenue = Math.floor(Math.random() * 100000) + 50000

  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    // 使用模拟数据作为后备
    dashboardStats.value = {
      totalUsers: 1234,
      todayOrders: 89,
      totalRevenue: 45678,
      activeUsers: 892,
      todayLogs: 45
    }
  } finally {
    loading.value = false
  }
}

// 启动定时刷新
const startRefresh = () => {
  fetchDashboardData()
  refreshTimer = setInterval(fetchDashboardData, 30000) // 每30秒刷新一次
}

// 停止定时刷新
const stopRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  startRefresh()
})

onUnmounted(() => {
  stopRefresh()
})
</script>

<template>
  <div class="dashboard-container p-6 bg-gray-50 min-h-screen">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
      <el-card class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <Motion :initial="{ x: -30, opacity: 0 }" :animate="{ x: 0, opacity: 1 }"
              :transition="{ duration: 0.5, delay: 0.3 }">
              <h1 class="text-2xl font-bold text-gray-800">仪表盘</h1>
            </Motion>
            <Motion :initial="{ x: -20, opacity: 0 }" :animate="{ x: 0, opacity: 1 }"
              :transition="{ duration: 0.4, delay: 0.4 }">
              <p class="text-gray-600 mt-1">欢迎回来，这里是您的数据概览</p>
            </Motion>
          </div>
          <div class="flex items-center space-x-3">
            <Motion :initial="{ scale: 0.8, opacity: 0 }" :animate="{ scale: 1, opacity: 1 }"
              :whileHover="{ scale: 1.05 }" :transition="{ duration: 0.3, delay: 0.5 }">
              <el-button type="primary" :icon="Refresh" :loading="loading" circle @click="fetchDashboardData" />
            </Motion>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Motion v-for="(stat, index) in stats" :key="stat.title" :initial="statsCardVariants.initial"
            :animate="statsCardVariants.animate" :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.1 * (index + 1) } as any" :class="[
              'p-6 rounded-lg cursor-pointer',
              stat.title === '总用户数' ? 'bg-blue-50' : '',
              stat.title === '今日日志' ? 'bg-green-50' : '',
              stat.title === 'CPU使用率' ? 'bg-yellow-50' : '',
              stat.title === '内存使用率' ? 'bg-purple-50' : ''
            ]">
            <div class="flex items-center justify-between">
              <div>
                <p :class="[
                  'text-sm font-medium',
                  stat.title === '总用户数' ? 'text-blue-600' : '',
                  stat.title === '今日日志' ? 'text-green-600' : '',
                  stat.title === 'CPU使用率' ? 'text-yellow-600' : '',
                  stat.title === '内存使用率' ? 'text-purple-600' : ''
                ]">{{ stat.title }}</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.2 * (index + 1) }">
                  <p :class="[
                    'text-2xl font-bold',
                    stat.title === '总用户数' ? 'text-blue-900' : '',
                    stat.title === '今日日志' ? 'text-green-900' : '',
                    stat.title === 'CPU使用率' ? 'text-yellow-900' : '',
                    stat.title === '内存使用率' ? 'text-purple-900' : ''
                  ]">{{ stat.value }}</p>
                </Motion>
                <p :class="[
                  'text-xs mt-1',
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                ]">{{ stat.change }}</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.1 * (index + 1) } as any" :class="[
                  stat.title === '总用户数' ? 'text-blue-500' : '',
                  stat.title === '今日日志' ? 'text-green-500' : '',
                  stat.title === 'CPU使用率' ? 'text-yellow-500' : '',
                  stat.title === '内存使用率' ? 'text-purple-500' : ''
                ]">
                <el-icon size="32">
                  <User v-if="stat.icon === 'user'" />
                  <Document v-else-if="stat.icon === 'file-text'" />
                  <Monitor v-else-if="stat.icon === 'cpu'" />
                  <Cpu v-else-if="stat.icon === 'hard-drive'" />
                </el-icon>
              </Motion>
            </div>
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 系统监控区域 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.6 } as any">
      <div class="mb-6">
        <SystemMonitorChart />
      </div>
    </Motion>

    <!-- 用户活动区域 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.8 } as any">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UserActivityChart />
      </div>
    </Motion>

    <!-- 数据表格区域 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 1.0 } as any">
      <DataTable />
    </Motion>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
}

/* 统计卡片增强样式 */
.cursor-pointer {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.cursor-pointer:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .cursor-pointer {
    transition: none;
  }
}

/* 增强卡片视觉效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>