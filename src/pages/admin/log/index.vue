<template>
  <div class="admin-log-page h-full flex flex-col">
    <!-- 搜索和操作栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchParams.search" placeholder="描述 / 用户名 / 模块" :prefix-icon="Search" clearable style="width: 260px" @keyup.enter.native="getList" />
        </el-form-item>

        <el-form-item label="操作类型">
          <el-select v-model="searchParams.action_type" placeholder="全部" clearable style="width: 150px" @change="getList">
            <el-option v-for="(opt, idx) in actionTypeOptions" :key="idx" :label="opt[1]" :value="opt[0]" />
          </el-select>
        </el-form-item>

        <el-form-item label="模块">
          <el-select v-model="searchParams.module" placeholder="全部" clearable filterable style="width: 200px" @change="getList">
            <el-option v-for="m in moduleOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input v-model="searchParams.user_id" placeholder="可填用户ID" clearable style="width: 140px" @keyup.enter.native="getList" />
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 280px" @change="onDateRangeChange" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>

        <el-form-item style="margin-left: auto">
          <el-button :icon="Refresh" @click="refresh" :loading="loading">刷新</el-button>
          <el-button type="danger" :icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
          <el-popover placement="bottom" trigger="click" width="320">
            <template #reference>
              <el-button type="warning" :icon="Delete">清空日志</el-button>
            </template>
            <div class="clear-panel">
              <el-radio-group v-model="clearForm.mode">
                <el-radio label="days">按天数</el-radio>
                <el-radio label="range">按日期范围</el-radio>
              </el-radio-group>
              <div v-if="clearForm.mode === 'days'" class="mt-2">
                <el-input-number v-model="clearForm.days" :min="1" :max="365" /> 天内的日志
              </div>
              <div v-else class="mt-2">
                <el-date-picker v-model="clearForm.range" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
              </div>
              <div class="mt-3 flex justify-end gap-2">
                <el-button size="small" @click="doClear(false)">预览参数</el-button>
                <el-button size="small" type="warning" @click="doClear(true)">确认清空</el-button>
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
        <el-table :data="list" border stripe style="width: 100%" :loading="loading" @selection-change="onSelectionChange" height="100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="user.username" label="用户" min-width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-icon><User /></el-icon>
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
            <el-tag :type="row.response_status === 200 ? 'success' : 'danger'" size="small">{{ row.response_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon class="mr-1"><Clock /></el-icon>
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
        <el-pagination
          v-model:current-page="searchParams.page"
          v-model:page-size="searchParams.page_size"
          :total="pagination.total_count"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
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
          <el-descriptions-item label="用户">{{ detail.data.user?.username }} (ID: {{ detail.data.user?.id }})</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.data.action_type_display }} ({{ detail.data.action_type }})</el-descriptions-item>
          <el-descriptions-item label="模块">{{ detail.data.module }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detail.data.description }}</el-descriptions-item>
          <el-descriptions-item label="目标模型">{{ detail.data.target_model ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{ detail.data.target_id ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ detail.data.ip_address }}</el-descriptions-item>
          <el-descriptions-item label="状态码">
            <el-tag :type="detail.data.response_status === 200 ? 'success' : 'danger'">{{ detail.data.response_status }}</el-tag>
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
import { onMounted, reactive, ref } from 'vue'
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

const clearForm = reactive({
  mode: 'days' as 'days' | 'range',
  days: 30,
  range: [] as string[] | []
})

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
    params.days = clearForm.days
  } else if (Array.isArray(clearForm.range) && clearForm.range.length === 2) {
    params.start_date = clearForm.range[0]
    params.end_date = clearForm.range[1]
  }

  if (!confirmDo) {
    ElMessage.info(`将以参数 ${JSON.stringify(params)} 发起清理`)
    return
  }

  try {
    await ElMessageBox.confirm('此操作不可恢复，确认清空指定范围内的日志吗？', '危险操作', { type: 'warning' })
    await logsApi.clearOperationLogs(params)
    ElMessage.success('清空完成')
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
</script>

<style scoped>
.search-card { margin-bottom: 12px; flex-shrink: 0; }
.list-card { margin-top: 12px; display: flex; flex-direction: column; min-height: 0; }
.table-container {
    flex: 1;
    min-height: 0;
    overflow: auto;
    max-height: 500px;
  }
.list-header { display: flex; align-items: center; justify-content: space-between; }
.list-title { font-weight: 600; }
.list-sub { color: var(--el-color-info); font-size: 12px; }
.pagination-container { display: flex; justify-content: flex-end; padding: 12px 0; flex-shrink: 0; }
.clear-panel { padding: 8px 4px; }
.detail-content :deep(.el-descriptions__label) { width: 120px; }
</style>
