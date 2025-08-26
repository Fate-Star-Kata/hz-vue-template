<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Motion } from 'motion-v'
import EChart from '@/components/common/EChart.vue'
import { monitorApi } from '@/api/system_file/index'
import type { SystemOverview, CpuInfo, MemoryInfo } from '@/api/system_file/index'
import type { EChartsOption } from 'echarts'

interface SystemStats {
  cpu: number
  memory: number
  disk: number
  timestamp: string
}

const loading = ref(false)
const systemOverview = ref<SystemOverview | null>(null)
const cpuData = ref<CpuInfo | null>(null)
const memoryData = ref<MemoryInfo | null>(null)
const systemStats = ref<SystemStats[]>([])
let refreshTimer: number | null = null

// 获取CPU详细信息
const fetchCpuData = async () => {
  try {
    const response = await monitorApi.getCpuMonitor()
    if (response.code === 200) {
      cpuData.value = response.data
    }
  } catch (error) {
    console.error('获取CPU数据失败:', error)
  }
}

// 获取内存详细信息
const fetchMemoryData = async () => {
  try {
    const response = await monitorApi.getMemoryMonitor()
    if (response.code === 200) {
      memoryData.value = response.data
    }
  } catch (error) {
    console.error('获取内存数据失败:', error)
  }
}

// CPU使用率仪表盘配置
const cpuGaugeOption = computed<EChartsOption>(() => ({
  series: [
    {
      name: 'CPU使用率',
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 100,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: 'auto',
          width: 5
        }
      },
      axisLabel: {
        color: '#464646',
        fontSize: 20,
        distance: -60,
        rotate: 'tangential',
        formatter: function (value: number) {
          if (value === 87.5) {
            return 'A+'
          } else if (value === 62.5) {
            return 'A'
          } else if (value === 37.5) {
            return 'B'
          } else if (value === 12.5) {
            return 'C'
          }
          return ''
        }
      },
      title: {
        offsetCenter: [0, '-10%'],
        fontSize: 20
      },
      detail: {
        fontSize: 30,
        offsetCenter: [0, '-35%'],
        valueAnimation: true,
        formatter: function (value: number) {
          return Math.round(value) + '%'
        },
        color: 'inherit'
      },
      data: [
        {
          value: cpuData.value?.cpu_percent || systemOverview.value?.resource_summary?.cpu_percent || 0,
          name: 'CPU使用率'
        }
      ]
    }
  ]
}))

// 内存使用率仪表盘配置
const memoryGaugeOption = computed<EChartsOption>(() => ({
  series: [
    {
      name: '内存使用率',
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 100,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#91cc75'],
            [0.7, '#fac858'],
            [1, '#ee6666']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: 'auto',
          width: 5
        }
      },
      axisLabel: {
        color: '#464646',
        fontSize: 20,
        distance: -60,
        rotate: 'tangential',
        formatter: function (value: number) {
          if (value === 87.5) {
            return 'A+'
          } else if (value === 62.5) {
            return 'A'
          } else if (value === 37.5) {
            return 'B'
          } else if (value === 12.5) {
            return 'C'
          }
          return ''
        }
      },
      title: {
        offsetCenter: [0, '-10%'],
        fontSize: 20
      },
      detail: {
        fontSize: 30,
        offsetCenter: [0, '-35%'],
        valueAnimation: true,
        formatter: function (value: number) {
          return Math.round(value) + '%'
        },
        color: 'inherit'
      },
      data: [
        {
          value: systemOverview.value?.resource_summary?.memory_percent || 0,
          name: '内存使用率'
        }
      ]
    }
  ]
}))

// 系统资源趋势图配置
const trendChartOption = computed<EChartsOption>(() => {
  const times = systemStats.value.map(item =>
    new Date(item.timestamp).toLocaleTimeString()
  )

  return {
    title: {
      text: '系统资源使用趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '磁盘使用率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: times
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(128, 255, 165)'
              },
              {
                offset: 1,
                color: 'rgba(1, 191, 236)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: systemStats.value.map(item => item.cpu)
      },
      {
        name: '内存使用率',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 221, 255)'
              },
              {
                offset: 1,
                color: 'rgba(77, 119, 255)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: systemStats.value.map(item => item.memory)
      },
      {
        name: '磁盘使用率',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(255, 0, 135)'
              },
              {
                offset: 1,
                color: 'rgba(135, 0, 157)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        },
        data: systemStats.value.map(item => item.disk)
      }
    ]
  }
})

// 获取系统概览数据
const fetchSystemOverview = async () => {
  try {
    loading.value = true
    const response = await monitorApi.getSystemOverview()
    if (response.code === 200) {
      systemOverview.value = response.data

      // 添加到趋势数据
      const newStats: SystemStats = {
        cpu: response.data.resource_summary.cpu_percent,
        memory: response.data.resource_summary.memory_percent,
        disk: response.data.resource_summary.disk_percent,
        timestamp: response.data.timestamp
      }

      systemStats.value.push(newStats)

      // 保持最近20个数据点
      if (systemStats.value.length > 20) {
        systemStats.value.shift()
      }
    }
  } catch (error) {
    console.error('获取系统概览数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 启动定时刷新
const startRefresh = () => {
  fetchSystemOverview()
  fetchCpuData()
  fetchMemoryData()
  refreshTimer = setInterval(() => {
    fetchSystemOverview()
    fetchCpuData()
    fetchMemoryData()
  }, 5000) // 每5秒刷新一次
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

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.4, ease: ['easeOut'] }
}
</script>

<template>
  <div class="system-monitor-charts">
    <!-- 仪表盘区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Motion
        :initial="cardVariants.initial"
        :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any"
        :transition="{ ...cardVariants.transition, delay: 0.1 } as any"
      >
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">CPU使用率</span>
              <el-tag
                :type="(cpuData?.cpu_percent || systemOverview?.resource_summary?.cpu_percent || 0) > 80 ? 'danger' :
                       (cpuData?.cpu_percent || systemOverview?.resource_summary?.cpu_percent || 0) > 60 ? 'warning' : 'success'"
                size="small"
              >
                {{ Math.round(cpuData?.cpu_percent || systemOverview?.resource_summary?.cpu_percent || 0) }}%
              </el-tag>
            </div>
          </template>
          <EChart
            :option="cpuGaugeOption"
            :loading="loading"
            height="200px"
          />
        </el-card>
      </Motion>

      <Motion
        :initial="cardVariants.initial"
        :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any"
        :transition="{ ...cardVariants.transition, delay: 0.2 } as any"
      >
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">内存使用率</span>
              <el-tag
                :type="(systemOverview?.resource_summary?.memory_percent || 0) > 80 ? 'danger' :
                       (systemOverview?.resource_summary?.memory_percent || 0) > 60 ? 'warning' : 'success'"
                size="small"
              >
                {{ Math.round(systemOverview?.resource_summary?.memory_percent || 0) }}%
              </el-tag>
            </div>
          </template>
          <EChart
            :option="memoryGaugeOption"
            :loading="loading"
            height="200px"
          />
        </el-card>
      </Motion>
    </div>

    <!-- 趋势图区域 -->
    <Motion
      :initial="cardVariants.initial"
      :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any"
    >
      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">系统资源使用趋势</span>
            <div class="flex items-center space-x-2">
              <el-tag size="small" type="info">
                实时监控
              </el-tag>
              <el-button
                size="small"
                type="primary"
                :loading="loading"
                @click="fetchSystemOverview"
              >
                刷新
              </el-button>
            </div>
          </div>
        </template>
        <EChart
          :option="trendChartOption"
          :loading="loading"
          height="300px"
        />
      </el-card>
    </Motion>
  </div>
</template>

<style scoped>
.system-monitor-charts {
  width: 100%;
}

.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>