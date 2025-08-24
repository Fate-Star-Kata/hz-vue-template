<template>
  <div class="content-management-container h-full overflow-y-auto">
    <!-- 统计卡片 -->
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="stats-header">
          <span class="stats-title">数据统计</span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            发布通知
          </el-button>
        </div>
      </template>
      <!-- <el-row :gutter="16" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总通知数" :value="stats.total">
              <template #prefix>
                <el-icon style="color: var(--el-color-primary)">
                  <Bell />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="今日发布" :value="stats.today">
              <template #prefix>
                <el-icon style="color: var(--el-color-success)">
                  <Calendar />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="本月发布" :value="stats.this_month">
              <template #prefix>
                <el-icon style="color: var(--el-color-warning)">
                  <TrendCharts />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row> -->
    </el-card>

    <!-- 筛选和搜索 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchParams.query" placeholder="搜索通知标题或内容..." :prefix-icon="Search" clearable
            style="width: 300px" @input="handleSearch" />
        </el-form-item>

        <el-form-item label="可见性">
          <el-select v-model="searchParams.is_public" placeholder="全部" clearable style="width: 120px"
            @change="handleFilterChange">
            <el-option label="公开" :value="1" />
            <el-option label="私有" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getNotificationList">
            搜索
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知列表 -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <div class="list-header">
          <span class="list-title">通知列表</span>
          <el-space>
            <el-button :icon="Refresh" @click="refreshData" :loading="loading" size="small">
              刷新
            </el-button>

          </el-space>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" v-loading="loading" class="loading-container">
        <el-empty description="正在加载通知..." />
      </div>

      <!-- 空状态 -->
      <div v-else-if="notificationList.length === 0" class="empty-container">
        <el-empty description="暂无通知数据">
          <template #image>
            <el-icon size="60" color="var(--el-color-info)">
              <DocumentRemove />
            </el-icon>
          </template>
          <el-button type="primary" @click="showCreateDialog = true">
            发布第一条通知
          </el-button>
        </el-empty>
      </div>

      <!-- 通知列表 -->
      <div v-else class="table-container">
        <el-table 
          :data="notificationList" 
          stripe 
          border
          style="width: 100%"
          :loading="loading"
          empty-text="暂无通知数据"
          class="notification-table"
        >
          <el-table-column prop="title" label="通知标题" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="title-cell">
                <span class="title-text">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="content" label="通知内容" min-width="300" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="content-cell">
                <span class="content-text">{{ row.content }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
              <div class="status-cell">
                <el-tag :type="row.is_public ? 'success' : 'warning'" size="small">
                  {{ row.is_public ? '公开' : '私有' }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="启用状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                <el-icon class="mr-1">
                  <CircleCheckFilled v-if="row.is_active" />
                  <CircleCloseFilled v-else />
                </el-icon>
                {{ row.is_active ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          

          
          <el-table-column label="创建时间" width="120" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon class="time-icon">
                  <Clock />
                </el-icon>
                <span class="time-text">{{ formatDate(row.created_at) }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-cell">
                <el-button-group size="small" class="action-button-group">
                  <el-button type="warning" @click="handleEdit(row.id)" size="small">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button type="success" @click="handleSendToUsers(row.id)" size="small">
                    <el-icon>
                      <UserFilled />
                    </el-icon>
                  </el-button>
                  <el-button type="danger" @click="handleDelete(row.id)" size="small">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="searchParams.page" v-model:page-size="searchParams.page_size" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" background />
    </div>

    <!-- 创建/编辑通知对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingNotification ? '编辑通知' : '发布通知'"
      width="650px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      class="notification-dialog"
      align-center
    >
      <template #header="{ titleId, titleClass }">
        <div class="dialog-header">
          <div class="dialog-icon">
            <el-icon size="24">
              <Edit v-if="editingNotification" />
              <Plus v-else />
            </el-icon>
          </div>
          <h3 :id="titleId" :class="titleClass" class="dialog-title">
            {{ editingNotification ? '编辑通知' : '发布通知' }}
          </h3>
        </div>
      </template>

      <div class="dialog-content">
        <el-form
          ref="notificationFormRef"
          :model="notificationForm"
          :rules="formRules"
          label-width="100px"
          label-position="left"
          size="default"
          class="notification-form"
        >
          <div class="form-section">
            <h4 class="section-title">基本信息</h4>
            <el-form-item label="通知标题" prop="title" class="form-item">
              <el-input
                v-model="notificationForm.title"
                placeholder="请输入通知标题"
                maxlength="100"
                show-word-limit
                clearable
                class="form-input"
              />
            </el-form-item>

            <el-form-item label="通知内容" prop="content" class="form-item">
              <el-input
                v-model="notificationForm.content"
                type="textarea"
                :rows="6"
                placeholder="请输入通知内容"
                maxlength="1000"
                show-word-limit
                resize="vertical"
                class="form-textarea"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <h4 class="section-title">通知设置</h4>
            <div class="switch-group">
              <el-form-item label="是否启用" class="switch-item">
                <el-switch
                  v-model="notificationForm.is_active"
                  active-text="启用"
                  inactive-text="未启用"
                  active-color="var(--el-color-success)"
                  inactive-color="var(--el-color-info)"
                  size="default"
                />
              </el-form-item>

              <el-form-item label="通知所有人" class="switch-item">
                <el-switch
                  v-model="notificationForm.notify_all"
                  active-text="是"
                  inactive-text="否"
                  active-color="var(--el-color-primary)"
                  inactive-color="var(--el-color-info)"
                  size="default"
                  @change="handleNotifyAllChange"
                />
              </el-form-item>


            </div>
            <br></br>
            <!-- 指定用户选择 -->
            <el-form-item v-if="!notificationForm.notify_all" label="指定用户" prop="recipient_user_ids" class="form-item">
              <el-select
                v-model="notificationForm.recipient_user_ids"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请选择要通知的用户"
                :remote-method="searchUsers"
                :loading="userSearchLoading"
                class="form-select"
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.username"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            size="large"
            @click="showCreateDialog = false"
            class="cancel-btn"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
            class="submit-btn"
          >
            <el-icon v-if="!submitting" class="btn-icon">
              <Edit v-if="editingNotification" />
              <Plus v-else />
            </el-icon>
            {{ editingNotification ? '更新通知' : '发布通知' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 发送给特定用户对话框 -->
    <el-dialog
      v-model="showSendToUserDialog"
      title="发送给特定用户"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      align-center
    >
      <div class="send-to-user-content">
        <el-form label-width="100px">
          <el-form-item label="选择用户">
            <el-select
              v-model="sendToUserForm.recipient_user_ids"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="请选择要通知的用户"
              :remote-method="searchUsers"
              :loading="userSearchLoading"
              style="width: 100%"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSendToUserDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSendToUsersSubmit">发送</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Refresh,
  Search,
  Bell,
  Calendar,
  TrendCharts,
  DocumentRemove,
  Edit,
  Delete,
  Clock,
  CircleCheckFilled,
  CircleCloseFilled,
  UserFilled
} from '@element-plus/icons-vue'
import { notificationApi } from '@/api/admin/notification'
import type {
  NotificationItem as NotificationItemType,
  NotificationListReq,
  CreateNotificationReq,
  NotificationStats
} from '@/types/factory'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const markingAllAsRead = ref(false)
const showCreateDialog = ref(false)
const editingNotification = ref<NotificationItemType | null>(null)
const notificationFormRef = ref<FormInstance>()

// 搜索参数
const searchParams = reactive<NotificationListReq>({
  query: '',
  page: 1,
  page_size: 10,
  is_active: undefined,
  is_public: undefined,
})

// 通知列表数据
const notificationList = ref<NotificationItemType[]>([])
const total = ref(0)


// 统计数据
const stats = ref<NotificationStats>({
  total: 0,
  today: 0,
  this_week: 0,
  this_month: 0,
})

// 表单数据
const notificationForm = reactive<CreateNotificationReq>({
  title: '',
  content: '',
  is_public: true,
  is_active: true,
  notify_all: false,
  email_notification: false,
  recipient_user_ids: [],
})

// 用户搜索相关
const userSearchLoading = ref(false)
const userOptions = ref<Array<{ id: number; username: string }>>([])
const showSendToUserDialog = ref(false)
const sendToUserForm = reactive({
  notification_id: 0,
  recipient_user_ids: [] as number[]
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 5, max: 500, message: '内容长度在 5 到 500 个字符', trigger: 'blur' }
  ],
  recipient_user_ids: [
    {
      validator: (rule: any, value: any, callback: any) => {
        // 移除必须选择用户的验证，允许不指定用户发送
        callback()
      },
      trigger: 'change'
    }
  ]
}

// @ts-ignore 搜索防抖
let searchTimer: NodeJS.Timeout | null = null

// 方法
const getNotificationList = async () => {
  loading.value = true
  try {
    const response = await notificationApi.getUserNotificationList(searchParams)
    if (response.code === 200) {
      notificationList.value = response.data.notifications
      total.value = response.data.total
    } else {
      ElMessage.error(response.msg || '获取通知列表失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败，请重试')
  } finally {
    loading.value = false
  }
}

const getStats = async () => {
  try {
    const response = await notificationApi.getNotificationStats()
    if (response.code === 200) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    searchParams.page = 1
    getNotificationList()
  }, 500)
}

const handleFilterChange = () => {
  searchParams.page = 1
  getNotificationList()
}

const handleSizeChange = (size: number) => {
  searchParams.page_size = size
  searchParams.page = 1
  getNotificationList()
}

const handleCurrentChange = (page: number) => {
  searchParams.page = page
  getNotificationList()
}

const refreshData = () => {
  getNotificationList()
  getStats()
}

const resetForm = () => {
  notificationForm.title = ''
  notificationForm.content = ''
  notificationForm.is_active = true
  notificationForm.notify_all = false
  notificationForm.email_notification = false
  notificationForm.recipient_user_ids = []
  editingNotification.value = null
  notificationFormRef.value?.resetFields()
  userOptions.value = []
}

// 处理通知所有人开关变化
const handleNotifyAllChange = (value: boolean) => {
  if (value) {
    notificationForm.recipient_user_ids = []
    userOptions.value = []
  }
  // 触发表单验证，确保用户选择字段的验证状态更新
  setTimeout(() => {
    notificationFormRef.value?.validateField('recipient_user_ids')
  }, 100)
}

// 搜索用户
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }
  
  userSearchLoading.value = true
  try {
    // 调用用户搜索API
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query,
      page: 1,
      page_size: 50 // 获取更多用户供选择
    })
    
    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({
        id: user.id!,
        username: user.username
      }))
    } else {
      userOptions.value = []
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索用户失败')
    userOptions.value = []
  } finally {
    userSearchLoading.value = false
  }
}

const resetSearch = () => {
  searchParams.page = 1
  searchParams.page_size = 10
  searchParams.query = ''
  searchParams.is_active = true
  searchParams.is_public = undefined
  getNotificationList()
}

const handleSubmit = async () => {
  if (!notificationFormRef.value) return

  try {
    // 先进行表单验证
    await notificationFormRef.value.validate()
    
    // 移除必须选择用户的验证，允许不指定用户发送
    
    submitting.value = true

    // 构建提交数据，根据notify_all决定是否包含recipient_user_ids
    const submitData = {
      title: notificationForm.title,
      content: notificationForm.content,
      is_public: notificationForm.notify_all, // is_public的值等于notify_all的值
      is_active: notificationForm.is_active,
      notify_all: notificationForm.notify_all,
      email_notification: false,
      // 只有当notify_all为false时才传递recipient_user_ids
      ...(notificationForm.notify_all ? {} : { recipient_user_ids: notificationForm.recipient_user_ids })
    }

    const response = editingNotification.value
      ? await notificationApi.updateNotification({
        id: editingNotification.value.id,
        ...submitData
      })
      : await notificationApi.createNotification(submitData)

    if (response.code === 200) {
      ElMessage.success(response.msg || `${editingNotification.value ? '更新' : '发布'}成功`)
      showCreateDialog.value = false
      resetForm()
      refreshData()
    } else {
      ElMessage.error(response.msg || `${editingNotification.value ? '更新' : '发布'}失败`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleEdit = (id: string | number) => {
  const notification = notificationList.value.find(item => item.id === id)
  if (notification) {
    editingNotification.value = notification
    notificationForm.title = notification.title
    notificationForm.content = notification.content
    notificationForm.is_active = notification.is_active ?? true
    notificationForm.notify_all = notification.notify_all ?? false
    notificationForm.email_notification = notification.email_notification ?? false
    notificationForm.recipient_user_ids = notification.recipient_user_ids || []
    showCreateDialog.value = true
  }
}

// 发送通知给特定用户
const handleSendToUsers = async (id: string | number) => {
  sendToUserForm.notification_id = Number(id)
  sendToUserForm.recipient_user_ids = []
  
  // 加载所有用户列表
  try {
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query: '',
      page: 1,
      page_size: 100 // 获取更多用户
    })
    
    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({
        id: user.id!,
        username: user.username
      }))
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
  
  showSendToUserDialog.value = true
}

// 提交发送给特定用户
const handleSendToUsersSubmit = async () => {
  if (sendToUserForm.recipient_user_ids.length === 0) {
    ElMessage.warning('请选择要通知的用户')
    return
  }

  try {
    // 获取原通知信息
    const originalNotification = notificationList.value.find(item => item.id === sendToUserForm.notification_id)
    if (!originalNotification) {
      ElMessage.error('通知不存在')
      return
    }

    // 使用创建通知接口，将现有通知内容发送给特定用户
    const response = await notificationApi.createNotification({
      title: ` ${originalNotification.title}`,
      content: originalNotification.content,
      is_public: false, // 设置为false，确保只有指定用户能看到
      is_active: true,
      notify_all: false,
      email_notification: originalNotification.email_notification ?? false,
      recipient_user_ids: sendToUserForm.recipient_user_ids
    })

    if (response.code === 200) {
      ElMessage.success('通知发送成功')
      showSendToUserDialog.value = false
      sendToUserForm.notification_id = 0
      sendToUserForm.recipient_user_ids = []
      userOptions.value = []
      // 刷新通知列表
      refreshData()
    } else {
      ElMessage.error(response.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送通知失败:', error)
    ElMessage.error('发送失败，请重试')
  }
}

const handleDelete = async (id: string | number) => {
  try {
    await ElMessageBox.confirm(
      '确认删除此通知吗？删除后无法恢复。',
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await notificationApi.deleteNotification(id)
    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功')
      handleDeleteSuccess(id)
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

const handleDeleteSuccess = (id: string | number) => {
  // 从列表中移除已删除的项
  const index = notificationList.value.findIndex(item => item.id === id)
  if (index > -1) {
    notificationList.value.splice(index, 1)
    total.value--
  }
  refreshData()
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 生命周期
onMounted(() => {
  getNotificationList()
  getStats()
})
</script>

<style scoped>
.content-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
}

.stats-grid {
  margin-top: 16px;
}

.stat-card {
  text-align: center;
}

.stat-card .el-statistic {
  --el-statistic-content-font-size: 28px;
}

.filters-card {
  margin-bottom: 20px;
}

.list-card {
  margin-top: 2em;
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.table-container {
  margin-top: 16px;
}

.notification-table {
  border-radius: 8px;
  overflow: hidden;
}

.title-cell {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content-cell {
  display: flex;
  align-items: center;
}

.content-text {
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.time-icon {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.time-text {
  font-weight: 500;
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

.action-button-group {
  display: flex;
  flex-wrap: nowrap;
}

.action-button-group .el-button {
  min-width: auto;
  padding: 5px 8px;
}

.mr-1 {
  margin-right: 4px;
}

.text-gray-400 {
  color: #9ca3af;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.notification-detail {
  margin: 16px 0;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content-card {
  margin-top: 8px;
}

.content-text {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 弹窗样式美化 */
.notification-dialog {
  --el-dialog-border-radius: 12px;
  --el-dialog-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.notification-dialog .el-dialog__header {
  padding: 0;
  border-bottom: none;
}

.dialog-header {
  display: flex;
  align-items: center;
  background: var(--el-bg-color);
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary-light-9);
  border: 2px solid var(--el-color-primary);
  border-radius: 10px;
  margin-right: 12px;
}

.dialog-icon .el-icon {
  color: var(--el-color-primary);
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.dialog-content {
  padding: 0;
  background: var(--el-bg-color);
}

.notification-form {
  max-height: 60vh;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: none;
}

.form-section:hover {
  box-shadow: none;
  transform: none;
}

.section-title {
  font-size: large;
  margin: 0 0 16px 0;
  font-weight: 600;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title::before {
  display: none;
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-input,
.form-textarea {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-input:focus-within,
.form-textarea:focus-within {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.switch-group {
  display: grid;
  gap: 12px;
}

.switch-item {
  margin-bottom: 0;
  padding: 12px 16px;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.switch-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
}

.switch-item .el-form-item__label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  background: var(--el-bg-color);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid var(--el-border-color-light);
}

.cancel-btn {
  min-width: 100px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  margin-right: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-management {
    padding: 16px;
  }

  .stats-grid .el-col {
    margin-bottom: 16px;
  }

  .notification-dialog {
    width: 95% !important;
    margin: 0 auto;
  }

  .dialog-header {
    padding: 20px 16px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .dialog-footer {
    padding: 16px;
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .dialog-icon {
    margin-right: 0;
  }
}
</style>
