<template>
  <div class="admin-log-page h-full flex flex-col">
    <!-- 搜索和操作栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchParams.search" placeholder="描述 / 用户名 / 模块" :prefix-icon="Search" clearable
            style="width: 260px" @keyup.enter.native="getList" />
        </el-form-item>

        <el-form-item label="操作类型">
          <el-select v-model="searchParams.action_type" placeholder="全部" clearable style="width: 150px"
            @change="getList">
            <el-option v-for="(opt, idx) in actionTypeOptions" :key="idx" :label="opt[1]" :value="opt[0]" />
          </el-select>
        </el-form-item>

        <el-form-item label="模块">
          <el-select v-model="searchParams.module" placeholder="全部" clearable filterable style="width: 200px"
            @change="getList">
            <el-option v-for="m in moduleOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input v-model="searchParams.user_id" placeholder="可填用户ID" clearable style="width: 140px"
            @keyup.enter.native="getList" />
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 280px" @change="onDateRangeChange" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>

        <el-form-item style="margin-left: auto">
          <el-button :icon="Refresh" @click="refresh" :loading="loading">刷新</el-button>
          <el-button type="danger" :icon="Delete" :disabled="selectedIds.length === 0"
            @click="handleBatchDelete">批量删除</el-button>
          <el-popover v-model:visible="popoverVisible" placement="bottom" trigger="manual" :width="'auto'"
            popper-class="clear-log-popover" :hide-after="0" :persistent="true" :teleported="true">
            <template #reference>
              <el-button class="clear-log-trigger" type="warning" :icon="Delete" @click="togglePopover">清空日志</el-button>
            </template>
            <div class="clear-panel" @click.stop>
              <el-radio-group v-model="clearForm.mode" class="mb-3">
                <el-radio label="days">按天数</el-radio>
                <el-radio label="range">按日期范围</el-radio>
              </el-radio-group>

              <!-- 按天数模式 -->
              <div v-if="clearForm.mode === 'days'" class="days-mode">
                <div class="mb-2">
                  <label class="text-sm text-gray-600 mb-1 block">清空天数：</label>
                  <div class="flex items-center gap-2">
                    <el-input-number v-model="clearForm.days" :min="0" :max="365" :step="1" size="default"
                      class="flex-1" />
                    <span class="text-sm text-gray-500">天内的日志</span>
                  </div>
                  <div class="mt-1 text-xs text-gray-400">
                    设为0则清空所有日志，结束日期为昨天
                  </div>
                </div>

                <!-- 快捷天数设置 -->
                <div class="mb-2">
                  <label class="text-sm text-gray-600 mb-1 block">快捷设置：</label>
                  <div class="flex flex-wrap gap-1">
                    <el-button size="small" @click.stop="clearForm.days = 1">昨天1天</el-button>
                    <el-button size="small" @click.stop="clearForm.days = 7">近7天</el-button>
                    <el-button size="small" @click.stop="clearForm.days = 30">近30天</el-button>
                    <el-button size="small" @click.stop="clearForm.days = 90">近90天</el-button>
                  </div>
                </div>
              </div>

              <!-- 按日期范围模式 -->
              <div v-else class="range-mode">
                <!-- 快捷选择按钮 -->
                <div class="mb-3">
                  <label class="text-sm text-gray-600 mb-1 block">快捷选择：</label>
                  <div class="flex flex-wrap gap-1">
                    <el-button size="small" @click.stop="setQuickRange('yesterday')">昨天</el-button>
                    <el-button size="small" @click.stop="setQuickRange('last7days')">近7天</el-button>
                    <el-button size="small" @click.stop="setQuickRange('last30days')">近30天</el-button>
                    <el-button size="small" @click.stop="setQuickRange('thisMonth')">本月</el-button>
                    <el-button size="small" @click.stop="setQuickRange('lastMonth')">上月</el-button>
                  </div>
                </div>

                <!-- 日期选择器 -->
                <div class="date-selectors">
                  <div class="mb-2">
                    <label class="text-sm text-gray-600 mb-1 block">开始日期：</label>
                    <input v-model="clearForm.startDate" type="date" class="input input-bordered w-full"
                      :max="getMaxDate()" @change="onDateChange" @click.stop />
                  </div>

                  <div class="mb-2">
                    <label class="text-sm text-gray-600 mb-1 block">结束日期：</label>
                    <input v-model="clearForm.endDate" type="date" class="input input-bordered w-full"
                      :min="clearForm.startDate || undefined" :max="getMaxDate()" @change="onDateChange" @click.stop />
                  </div>
                </div>
              </div>

              <div class="mt-4 flex justify-end gap-2">
                <el-button size="small" @click.stop="closePopover">取消</el-button>
                <el-button size="small" @click.stop="doClear(false)">预览参数</el-button>
                <el-button size="small" type="warning" @click.stop="doClear(true)">确认清空</el-button>
              </div>
            </div>
          </el-popover>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never" class="list-card flex-1 min-h-0">
      <template #header>
        <div class="list-header">
          <span class="list-title">操作日志</span>
          <span class="list-sub">共 {{ pagination.total_count }} 条</span>
        </div>
      </template>

      <div class="table-container">
        <el-table :data="list" border stripe style="width: 100%" :loading="loading"
          @selection-change="onSelectionChange" height="100%">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="user.username" label="用户" min-width="120">
            <template #default="{ row }">
              <div class="flex items-center gap-1">
                <el-icon>
                  <User />
                </el-icon>
                <span>{{ row.user?.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="action_type_display" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.action_type_display }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="模块" min-width="140" show-overflow-tooltip />
          <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
          <el-table-column prop="ip_address" label="IP" width="130" align="center" />
          <el-table-column prop="response_status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.response_status === 200 ? 'success' : 'danger'" size="small">{{ row.response_status
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="160" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon class="mr-1">
                  <Clock />
                </el-icon>
                <span>{{ formatDate(row.created_at) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" align="center">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" :icon="View" @click="openDetail(row.id)">详情</el-button>
                <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row.id)"></el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination v-model:current-page="searchParams.page" v-model:page-size="searchParams.page_size"
          :total="pagination.total_count" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" background />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detail.visible" title="日志详情" size="520px" :with-header="true">
      <div v-if="detail.loading" class="p-4">
        <el-skeleton rows="8" animated></el-skeleton>
      </div>
      <div v-else-if="detail.data" class="p-4 detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detail.data.id }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.data.user?.username }} (ID: {{ detail.data.user?.id
          }})</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.data.action_type_display }} ({{ detail.data.action_type
          }})</el-descriptions-item>
          <el-descriptions-item label="模块">{{ detail.data.module }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detail.data.description }}</el-descriptions-item>
          <el-descriptions-item label="目标模型">{{ detail.data.target_model ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{ detail.data.target_id ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ detail.data.ip_address }}</el-descriptions-item>
          <el-descriptions-item label="状态码">
            <el-tag :type="detail.data.response_status === 200 ? 'success' : 'danger'">{{ detail.data.response_status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时间">{{ detail.data.created_at }}</el-descriptions-item>
          <el-descriptions-item label="UA">{{ detail.data.user_agent || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="mt-3">
          <div class="text-sm text-gray-500 mb-1">请求数据</div>
          <el-input type="textarea" :rows="8" :model-value="formatJson(detail.data.request_data)" readonly />
        </div>
      </div>
      <div v-else class="p-4">
        <el-empty description="暂无数据" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, View, Clock, User } from '@element-plus/icons-vue'
import { logsApi } from '@/api/admin/logs'
import type {
  OperationLogItem,
  OperationLogDetail,
  OperationLogsListRequest,
  OperationLogsPaginationInfo
} from '@/types/factory'

const loading = ref(false)
const list = ref<OperationLogItem[]>([])
const actionTypeOptions = ref<[string, string][]>([])
const moduleOptions = ref<string[]>([])
const dateRange = ref<string[] | null>(null)

const pagination = reactive<OperationLogsPaginationInfo>({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  page_size: 20,
  has_next: false,
  has_previous: false
})

const searchParams = reactive<OperationLogsListRequest>({
  search: '',
  page: 1,
  page_size: 20,
  action_type: undefined,
  module: undefined,
  user_id: undefined,
  start_date: undefined,
  end_date: undefined
})

const selectedIds = ref<number[]>([])
const popoverVisible = ref(false)

const clearForm = reactive({
  mode: 'days' as 'days' | 'range',
  days: 0,
  range: [] as string[] | [],
  startDate: '',
  endDate: ''
})

// 日期选择器的快捷选项
const dateShortcuts = [
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return [yesterday, yesterday]
    }
  },
  {
    text: '近7天',
    value: () => {
      const end = new Date()
      end.setDate(end.getDate() - 1) // 结束日期为昨天
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '近30天',
    value: () => {
      const end = new Date()
      end.setDate(end.getDate() - 1)
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return [start, end]
    }
  }
]

// 获取最大日期（昨天）
function getMaxDate() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// 日期变化处理
function onDateChange() {
  // 同步更新 range 数组（保持兼容性）
  if (clearForm.startDate && clearForm.endDate) {
    clearForm.range = [clearForm.startDate, clearForm.endDate]
  } else {
    clearForm.range = []
  }
}

// 手动关闭 Popover
function closePopover() {
  popoverVisible.value = false
}

// 切换 Popover 显示状态
function togglePopover() {
  popoverVisible.value = !popoverVisible.value
}

// 快捷日期设置
function setQuickRange(type: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  switch (type) {
    case 'yesterday':
      clearForm.startDate = yesterday.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last7days':
      const start7 = new Date(yesterday)
      start7.setDate(yesterday.getDate() - 6)
      clearForm.startDate = start7.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last30days':
      const start30 = new Date(yesterday)
      start30.setDate(yesterday.getDate() - 29)
      clearForm.startDate = start30.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'thisMonth':
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      // 如果本月还没结束，结束日期设为昨天
      const actualEnd = endMonth.getTime() < yesterday.getTime() ? endMonth : yesterday
      clearForm.startDate = startMonth.toISOString().split('T')[0]
      clearForm.endDate = actualEnd.toISOString().split('T')[0]
      break
    case 'lastMonth':
      const startLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      clearForm.startDate = startLastMonth.toISOString().split('T')[0]
      clearForm.endDate = endLastMonth.toISOString().split('T')[0]
      break
  }

  // 同步更新 range 数组
  onDateChange()
}

const detail = reactive<{ visible: boolean; loading: boolean; data: OperationLogDetail | null }>({
  visible: false,
  loading: false,
  data: null
})

function formatDate(dt?: string) {
  if (!dt) return '-'
  return dt.replace('T', ' ')
}

function formatJson(obj: any) {
  try {
    return JSON.stringify(obj ?? {}, null, 2)
  } catch (e) {
    return String(obj ?? '')
  }
}

function onDateRangeChange() {
  if (dateRange.value && dateRange.value.length === 2) {
    searchParams.start_date = dateRange.value[0]
    searchParams.end_date = dateRange.value[1]
  } else {
    searchParams.start_date = undefined
    searchParams.end_date = undefined
  }
}

async function getList() {
  try {
    loading.value = true
    const { data } = await logsApi.getOperationLogs({ ...searchParams })
    list.value = data.logs || []
    Object.assign(pagination, data.pagination)
    // 过滤项（去重模块）
    actionTypeOptions.value = data.filters?.action_types || []
    const set = new Set<string>((data.filters?.modules || []).filter(Boolean))
    moduleOptions.value = Array.from(set)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取日志失败')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchParams.search = ''
  searchParams.action_type = undefined
  searchParams.module = undefined
  searchParams.user_id = undefined
  dateRange.value = null
  searchParams.start_date = undefined
  searchParams.end_date = undefined
  searchParams.page = 1
  getList()
}

function refresh() {
  getList()
}

function handleSizeChange(size: number) {
  searchParams.page_size = size
  searchParams.page = 1
  getList()
}

function handleCurrentChange(page: number) {
  searchParams.page = page
  getList()
}

function onSelectionChange(rows: OperationLogItem[]) {
  selectedIds.value = rows.map(r => r.id)
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该条日志吗？', '提示', { type: 'warning' })
    const res = await logsApi.deleteOperationLog(id)
    ElMessage.success(res.data || '删除成功')
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条日志吗？`, '提示', { type: 'warning' })
    const res = await logsApi.batchDeleteOperationLogs({ log_ids: selectedIds.value })
    ElMessage.success(res.data || '批量删除成功')
    selectedIds.value = []
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}

async function doClear(confirmDo: boolean) {
  const params: any = {}

  if (clearForm.mode === 'days') {
    // 计算起始时间和结束时间
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // 结束时间为昨天
    const endDate = yesterday.toISOString().split('T')[0]

    // 起始时间为昨天往前推 days 天
    const startDate = new Date(yesterday)
    startDate.setDate(yesterday.getDate() - clearForm.days)
    const startDateStr = startDate.toISOString().split('T')[0]

    params.days = clearForm.days
    params.start_date = startDateStr
    params.end_date = endDate
  } else if (clearForm.mode === 'range') {
    // 使用新的独立日期字段
    if (!clearForm.startDate || !clearForm.endDate) {
      ElMessage.warning('请选择完整的日期范围')
      return
    }
    params.start_date = clearForm.startDate
    params.end_date = clearForm.endDate
  }

  if (!confirmDo) {
    ElMessage.info(`将以参数 ${JSON.stringify(params)} 发起清理`)
    return
  }

  try {
    let confirmText = '此操作不可恢复，确认清空指定范围内的日志吗？'
    if (clearForm.mode === 'days' && clearForm.days === 0) {
      confirmText = '此操作将清空所有日志，不可恢复，确认继续吗？'
    }
    await ElMessageBox.confirm(confirmText, '危险操作', {
      type: 'warning',
    })
    await logsApi.clearOperationLogs(params)
    ElMessage.success('清空完成')
    closePopover() // 成功后关闭 Popover
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}

async function openDetail(id: number) {
  detail.visible = true
  detail.loading = true
  detail.data = null
  try {
    const { data } = await logsApi.getOperationLogDetail(id)
    detail.data = data
  } catch (e) {
    ElMessage.error('获取详情失败')
  } finally {
    detail.loading = false
  }
}

onMounted(() => {
  getList()
})

onUnmounted(() => {
  // 组件卸载时的清理工作
})
</script>

<style scoped>
.search-card {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.list-card {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  max-height: 500px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-weight: 600;
}

.list-sub {
  color: var(--el-color-info);
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  flex-shrink: 0;
}

.clear-panel {
  padding: 16px;
  min-width: 420px;
  max-width: 500px;
  width: auto;
  box-sizing: border-box;
}

.clear-panel .days-mode {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.clear-panel .range-mode {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.clear-panel .date-selectors {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  box-sizing: border-box;
}

.clear-panel .quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.clear-panel .quick-buttons .el-button {
  font-size: 12px;
  padding: 4px 8px;
  flex: 0 0 auto;
  white-space: nowrap;
}

.clear-panel label {
  font-weight: 500;
  color: #606266;
}

.detail-content :deep(.el-descriptions__label) {
  width: 120px;
}

/* 全局样式 - 清空日志弹窗 */
:global(.clear-log-popover) {
  min-width: 420px !important;
  max-width: 500px !important;
  width: auto !important;
  z-index: 2000 !important;
}

/* 确保日期选择器下拉面板不会被其他元素遮挡 */
:global(.el-date-picker__popper) {
  z-index: 2100 !important;
}

/* 专门针对弹窗内日期选择器的样式 */
:global(.date-picker-in-popover) {
  z-index: 2200 !important;
}

/* 阻止日期选择器面板点击事件冒泡 */
:global(.date-picker-no-close) {
  z-index: 2200 !important;
}

:global(.date-picker-no-close .el-picker-panel) {
  z-index: 2300 !important;
}

:global(.date-picker-no-close .el-date-picker__header) {
  pointer-events: auto;
}

:global(.date-picker-no-close .el-date-picker__content) {
  pointer-events: auto;
}

/* 防止日期选择器面板触发 Popover 关闭 */
:global(.el-picker-panel) {
  pointer-events: auto !important;
}

:global(.el-date-picker) {
  pointer-events: auto !important;
}
</style>
