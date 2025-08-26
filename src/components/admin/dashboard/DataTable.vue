<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { getUsersAPI } from '@/api/admin/users'
import { logsApi } from '@/api/admin/logs'
import type { User } from '@/types/components/admin'
import type { OperationLogItem } from '@/types/apis/logs'

interface TableData {
  users: User[]
  logs: OperationLogItem[]
  loading: boolean
}

const tableData = ref<TableData>({
  users: [],
  logs: [],
  loading: false
})

const activeTab = ref('users')
const userPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const logPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户表格列配置
const userColumns = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true
  },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180,
    sortable: true
  },
  {
    prop: 'role',
    label: '角色',
    width: 100,
    sortable: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 100
  },
  {
    prop: 'created_at',
    label: '创建时间',
    width: 160,
    sortable: true
  },
  {
    prop: 'last_login',
    label: '最后登录',
    width: 160,
    sortable: true
  }
]

// 日志表格列配置
const logColumns = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true
  },
  {
    prop: 'user.username',
    label: '用户',
    width: 120,
    sortable: true
  },
  {
    prop: 'action_type_display',
    label: '操作',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'module',
    label: '模块',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'description',
    label: '描述',
    minWidth: 200
  },
  {
    prop: 'ip_address',
    label: 'IP地址',
    width: 140
  },
  {
    prop: 'created_at',
    label: '时间',
    width: 160,
    sortable: true
  }
]

// 获取用户数据
const fetchUsers = async () => {
  try {
    tableData.value.loading = true
    const response = await getUsersAPI({
      page: userPagination.value.currentPage,
      page_size: userPagination.value.pageSize,
      query: ''
    })

    if (response.code === 200 && response.data) {
      tableData.value.users = response.data.users || []
      userPagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    // 使用模拟数据作为后备
    tableData.value.users = generateMockUsers()
    userPagination.value.total = 50
  } finally {
    tableData.value.loading = false
  }
}

// 获取日志数据
const fetchLogs = async () => {
  try {
    tableData.value.loading = true
    const response = await logsApi.getOperationLogs({
      page: logPagination.value.currentPage,
      page_size: logPagination.value.pageSize,
      user_id: '',
      action_type: '',
      module: '',
      start_date: '',
      end_date: ''
    })

    if (response.code === 200 && response.data) {
      tableData.value.logs = response.data.logs || []
      logPagination.value.total = response.data.pagination?.total_count || 0
    }
  } catch (error) {
    console.error('获取日志数据失败:', error)
    // 使用模拟数据作为后备
    tableData.value.logs = generateMockLogs()
    logPagination.value.total = 100
  } finally {
    tableData.value.loading = false
  }
}

// 生成模拟用户数据
const generateMockUsers = (): User[] => {
  const users: User[] = []
  const roles = ['admin', 'user', 'moderator']
  const statuses = ['active', 'inactive', 'pending']

  for (let i = 1; i <= userPagination.value.pageSize; i++) {
    const id = (userPagination.value.currentPage - 1) * userPagination.value.pageSize + i
    users.push({
      id,
      username: `user${id}`,
      email: `user${id}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      avatar: '',
      phone: '',
      address: '',
      bio: '',
      is_active: false,
      is_staff: false,
      is_superuser: false
    })
  }

  return users
}

// 生成模拟日志数据
const generateMockLogs = (): OperationLogItem[] => {
  const logs: OperationLogItem[] = []
  const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW']
  const actionDisplays = ['创建', '更新', '删除', '登录', '登出', '查看']
  const modules = ['用户管理', '文件管理', '系统配置', '日志管理', '通知管理']
  const descriptions = ['创建新用户', '更新用户信息', '删除用户', '用户登录系统', '用户退出系统', '查看用户列表']
  const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1']
  const usernames = ['admin', 'user1', 'manager', 'test_user', 'operator']

  for (let i = 1; i <= logPagination.value.pageSize; i++) {
    const id = (logPagination.value.currentPage - 1) * logPagination.value.pageSize + i
    const actionIndex = Math.floor(Math.random() * actionTypes.length)
    const usernameIndex = Math.floor(Math.random() * usernames.length)

    logs.push({
      id,
      user: {
        id: Math.floor(Math.random() * 100) + 1,
        username: usernames[usernameIndex],
        email: `${usernames[usernameIndex]}@example.com`
      },
      action_type: actionTypes[actionIndex],
      action_type_display: actionDisplays[actionIndex],
      module: modules[Math.floor(Math.random() * modules.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      ip_address: ips[Math.floor(Math.random() * ips.length)],
      target_model: null,
      target_id: null,
      response_status: 200,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return logs
}

// 格式化时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    case 'pending':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取角色标签类型
const getRoleType = (role: string) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'moderator':
      return 'warning'
    case 'user':
      return 'primary'
    default:
      return 'info'
  }
}

// 获取操作标签类型
const getActionType = (action: string) => {
  switch (action) {
    case 'LOGIN':
      return 'success'
    case 'LOGOUT':
      return 'info'
    case 'CREATE':
      return 'primary'
    case 'UPDATE':
      return 'warning'
    case 'DELETE':
      return 'danger'
    case 'VIEW':
      return 'info'
    default:
      return 'info'
  }
}

// 处理用户分页变化
const handleUserPageChange = (page: number) => {
  userPagination.value.currentPage = page
  fetchUsers()
}

// 处理日志分页变化
const handleLogPageChange = (page: number) => {
  logPagination.value.currentPage = page
  fetchLogs()
}

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'users' && tableData.value.users.length === 0) {
    fetchUsers()
  } else if (tabName === 'logs' && tableData.value.logs.length === 0) {
    fetchLogs()
  }
}

// 刷新数据
const refreshData = () => {
  if (activeTab.value === 'users') {
    fetchUsers()
  } else {
    fetchLogs()
  }
}

onMounted(() => {
  fetchUsers()
})

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.4, ease: ['easeOut'] }
}
</script>

<template>
  <Motion
    :initial="cardVariants.initial"
    :animate="cardVariants.animate"
    :whileHover="cardVariants.whileHover as any"
    :transition="cardVariants.transition as any"
  >
    <el-card class="data-table-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">数据概览</span>
          <el-button
            size="small"
            type="primary"
            :loading="tableData.loading"
            @click="refreshData"
          >
            刷新数据
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 用户数据表格 -->
        <el-tab-pane label="用户管理" name="users">
          <el-table
            :data="tableData.users"
            :loading="tableData.loading"
            stripe
            border
            style="width: 100%"
            empty-text="暂无用户数据"
          >
            <el-table-column
              v-for="column in userColumns"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              :min-width="column.minWidth"
              :sortable="column.sortable"

            >
              <template #default="{ row }" v-if="column.prop === 'status'">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
              <template #default="{ row }" v-else-if="column.prop === 'role'">
                <el-tag :type="getRoleType(row.role)" size="small">
                  {{ row.role }}
                </el-tag>
              </template>
              <template #default="{ row }" v-else-if="column.prop === 'created_at'">
                {{ formatDateTime(row.created_at) }}
              </template>
              <template #default="{ row }" v-else-if="column.prop === 'last_login'">
                {{ formatDateTime(row.last_login) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="flex justify-center mt-4">
            <el-pagination
              v-model:current-page="userPagination.currentPage"
              :page-size="userPagination.pageSize"
              :total="userPagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handleUserPageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 操作日志表格 -->
        <el-tab-pane label="操作日志" name="logs">
          <el-table
            :data="tableData.logs"
            :loading="tableData.loading"
            stripe
            border
            style="width: 100%"
            empty-text="暂无日志数据"
          >
            <el-table-column
              v-for="column in logColumns"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              :min-width="column.minWidth"
              :sortable="column.sortable"

            >
              <template #default="{ row }" v-if="column.prop === 'action_type_display'">
                <el-tag :type="getActionType(row.action_type)" size="small">
                  {{ row.action_type_display }}
                </el-tag>
              </template>
              <template #default="{ row }" v-else-if="column.prop === 'created_at'">
                {{ formatDateTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="flex justify-center mt-4">
            <el-pagination
              v-model:current-page="logPagination.currentPage"
              :page-size="logPagination.pageSize"
              :total="logPagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handleLogPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </Motion>
</template>

<style scoped>
.data-table-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.data-table-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-pagination {
  margin-top: 16px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}
</style>