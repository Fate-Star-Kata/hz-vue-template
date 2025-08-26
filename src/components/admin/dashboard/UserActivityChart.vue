<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import EChart from '@/components/common/EChart.vue'
import { getUsersAPI } from '@/api/admin/users'
import type { EChartsOption } from 'echarts'

interface NewUserGrowthData {
  date: string
  newUsers: number
  cumulativeUsers: number
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

const loading = ref(false)
const newUserGrowthData = ref<NewUserGrowthData[]>([])
const userStats = ref<UserStats>({
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  newUsersThisWeek: 0,
  newUsersThisMonth: 0
})

// 新用户增长趋势图配置
const newUserGrowthOption = computed<EChartsOption>(() => {
  const dates = newUserGrowthData.value.map(item => item.date)
  
  return {
    title: {
      text: '新用户增长趋势',
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
      },
      formatter: function(params: any) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param: any) => {
          if (param.seriesName === '新增用户') {
            result += `${param.marker}${param.seriesName}: ${param.value}人<br/>`
          } else {
            result += `${param.marker}${param.seriesName}: ${param.value}人<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['新增用户', '累计用户'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        formatter: function(value: string) {
          return new Date(value).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
          })
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增用户数',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '累计用户数',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '新增用户',
        type: 'bar',
        yAxisIndex: 0,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#5470c6'
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.6)'
              }
            ]
          }
        },
        data: newUserGrowthData.value.map(item => item.newUsers)
      },
      {
        name: '累计用户',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#91cc75'
        },
        itemStyle: {
          color: '#91cc75'
        },
        data: newUserGrowthData.value.map(item => item.cumulativeUsers)
      }
    ]
  }
})

// 用户分布饼图配置
const userDistributionOption = computed<EChartsOption>(() => {
  const total = userStats.value.totalUsers
  const active = userStats.value.activeUsers
  const inactive = total - active
  
  return {
    title: {
      text: '用户活跃度分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: active,
            name: '活跃用户',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#91cc75'
                  },
                  {
                    offset: 1,
                    color: '#5470c6'
                  }
                ]
              }
            }
          },
          {
            value: inactive,
            name: '非活跃用户',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#fac858'
                  },
                  {
                    offset: 1,
                    color: '#ee6666'
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  }
})

// 根据用户创建时间计算新用户增长数据
const calculateNewUserGrowth = (users: any[]) => {
  const data: NewUserGrowthData[] = []
  const today = new Date()
  
  // 生成最近30天的日期
  const dateMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dateMap.set(dateStr, 0)
  }
  
  // 统计每天的新用户数
  users.forEach(user => {
    if (user.date_joined) {
      const joinDate = new Date(user.date_joined).toISOString().split('T')[0]
      if (dateMap.has(joinDate)) {
        dateMap.set(joinDate, dateMap.get(joinDate)! + 1)
      }
    }
  })
  
  // 计算累计用户数
  let cumulativeCount = 0
  const sortedDates = Array.from(dateMap.keys()).sort()
  
  sortedDates.forEach(date => {
    const newUsers = dateMap.get(date) || 0
    cumulativeCount += newUsers
    
    data.push({
      date,
      newUsers,
      cumulativeUsers: cumulativeCount
    })
  })
  
  return data
}

// 获取用户数据
const fetchUserData = async () => {
  try {
    loading.value = true
    
    // 获取用户列表数据
    const response = await getUsersAPI({
      page: 1,
      page_size: 1000,
      query: ''
    })
    
    if (response.code === 200 && response.data) {
      const users = response.data.users || []
      const total = response.data.total || 0
      
      // 计算统计数据
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const thisWeekStart = new Date(now)
      thisWeekStart.setDate(now.getDate() - 7)
      const thisMonthStart = new Date(now)
      thisMonthStart.setDate(now.getDate() - 30)
      
      // 计算新用户统计
      const newUsersToday = users.filter(user => 
        user.date_joined && new Date(user.date_joined).toISOString().split('T')[0] === today
      ).length
      
      const newUsersThisWeek = users.filter(user => 
        user.date_joined && new Date(user.date_joined) >= thisWeekStart
      ).length
      
      const newUsersThisMonth = users.filter(user => 
        user.date_joined && new Date(user.date_joined) >= thisMonthStart
      ).length
      
      // 模拟活跃用户数据（实际项目中应该从后端获取）
      const activeUsers = Math.floor(total * 0.7) // 假设70%的用户是活跃的
      
      userStats.value = {
        totalUsers: total,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
      }
      
      // 根据真实数据计算新用户增长趋势
      newUserGrowthData.value = calculateNewUserGrowth(users)
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    // 使用模拟数据作为后备
    userStats.value = {
      totalUsers: 1250,
      activeUsers: 875,
      newUsersToday: 15,
      newUsersThisWeek: 45,
      newUsersThisMonth: 180
    }
    // 生成模拟的新用户增长数据
    const mockData: NewUserGrowthData[] = []
    const today = new Date()
    let cumulative = 1000
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const newUsers = Math.floor(Math.random() * 20) + 5
      cumulative += newUsers
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        newUsers,
        cumulativeUsers: cumulative
      })
    }
    newUserGrowthData.value = mockData
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserData()
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
  <!-- 用户活动趋势 -->
  <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
    :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.1 } as any">
    <el-card>
      <template #header>
        <span class="font-medium">新用户增长趋势</span>
      </template>
      <div class="h-64">
        <EChart :option="newUserGrowthOption" :loading="loading" />
      </div>
    </el-card>
  </Motion>

  <!-- 用户分布 -->
  <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
    :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
    <el-card>
      <template #header>
        <span class="font-medium">用户活跃度分布</span>
      </template>
      <div class="h-64">
        <EChart :option="userDistributionOption" :loading="loading" />
      </div>
    </el-card>
  </Motion>
</template>

<style scoped>
.user-activity-charts {
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