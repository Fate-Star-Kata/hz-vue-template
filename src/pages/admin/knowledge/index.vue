<template>
  <div class="knowledge-admin-container h-full overflow-y-auto">
    <!-- 顶部统计与操作 -->
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="stats-header">
          <span class="stats-title">知识库数据</span>
          <el-space>
            <el-button type="primary" :icon="Plus" @click="openCreateDialog">
              新建文章
            </el-button>
            <el-button :icon="Refresh" @click="refreshAll" :loading="loading.list || loading.stats">
              刷新
            </el-button>
          </el-space>
        </div>
      </template>
      <el-row :gutter="16" class="stats-row">
        <el-col :xs="12" :sm="6" :md="4">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总文章数" :value="stats.basic_stats.total_articles || 0" />
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已发布" :value="stats.basic_stats.published_articles || 0" />
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="草稿" :value="stats.basic_stats.draft_articles || 0" />
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="已归档" :value="stats.basic_stats.archived_articles || 0" />
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="精选" :value="stats.basic_stats.featured_articles || 0" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 筛选搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="filters.query" placeholder="输入标题、内容关键字..." :prefix-icon="Search" clearable style="width: 280px" @keyup.enter.native="getList" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="filters.category_id" placeholder="全部分类" clearable style="width: 180px" @change="handleFilterChange">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label=
          "状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 140px" @change="handleFilterChange">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getList">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <div class="list-header">
          <span class="list-title">文章列表</span>
          <el-space>
            <el-button :icon="Delete" type="danger" :disabled="multipleSelection.length === 0" @click="confirmBatchDelete">
              批量删除
            </el-button>
          </el-space>
        </div>
      </template>

      <div v-if="loading.list" v-loading="loading.list" class="loading-container">
        <el-empty description="正在加载数据..." />
      </div>

      <div v-else-if="articles.length === 0" class="empty-container">
        <el-empty description="暂无文章">
          <template #image>
            <el-icon size="60" color="var(--el-color-info)">
              <DocumentRemove />
            </el-icon>
          </template>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建文章</el-button>
        </el-empty>
      </div>

      <div v-else class="table-container">
        <el-table :data="articles" border stripe style="width: 100%" :loading="loading.list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />

          <el-table-column label="标题" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="title-cell">
                <span class="title-text">{{ row.title }}</span>
                <el-tag v-if="row.is_featured" type="warning" size="small" class="ml-2">精选</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="category_name" label="分类" width="120" show-overflow-tooltip />

          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="author_name" label="作者" width="120" show-overflow-tooltip />

          <el-table-column label="浏览/点赞" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.view_count }} / {{ row.like_count }}</span>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="160" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon class="time-icon"><Clock /></el-icon>
                <span class="time-text">{{ formatDate(row.created_at) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="发布时间" width="160" align="center">
            <template #default="{ row }">
              <div class="time-cell">
                <el-icon class="time-icon"><Clock /></el-icon>
                <span class="time-text">{{ row.published_at ? formatDate(row.published_at) : '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template #default="{ row }">
              <el-button-group size="small">
                <el-button type="primary" @click="openEditDialog(row.id)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="success" v-if="row.status !== 'published'" @click="handlePublish(row)">
                  <el-icon><Promotion /></el-icon>
                </el-button>
                <el-button type="warning" v-else @click="handleUnpublish(row)">
                  <el-icon><VideoPause /></el-icon>
                </el-button>
                <el-button type="danger" @click="confirmDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 创建文章对话框 -->
    <el-dialog v-model="dialogs.create" title="新建文章" width="720px" :close-on-click-modal="false" :close-on-press-escape="false" destroy-on-close align-center>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入标题" clearable />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="createForm.summary" type="textarea" :rows="3" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="createForm.category" placeholder="请选择分类" style="width: 260px">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="createForm.tags" placeholder="使用英文逗号分隔，如：前端,Vue,TypeScript" />
        </el-form-item>
        <el-form-item label="封面图" prop="image">
          <el-input v-model="createForm.image" placeholder="图片URL（可选）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="createForm.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="精选">
          <el-switch v-model="createForm.is_featured" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="createForm.content" type="textarea" :rows="8" placeholder="请输入文章内容（支持Markdown）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogs.create = false">取消</el-button>
        <el-button type="primary" :loading="loading.create" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 编辑文章对话框 -->
    <el-dialog v-model="dialogs.edit" :title="`编辑文章 #${editingId || ''}`" width="720px" :close-on-click-modal="false" :close-on-press-escape="false" destroy-on-close align-center>
      <div v-if="loading.detail" class="p-4">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else>
        <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="editForm.title" placeholder="请输入标题" clearable />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="editForm.content" type="textarea" :rows="10" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="editForm.status" placeholder="选择状态" style="width: 200px">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogs.edit = false">取消</el-button>
        <el-button type="primary" :loading="loading.update" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, DocumentRemove, Clock, Promotion, VideoPause } from '@element-plus/icons-vue'
import { getKnowledgeCategories } from '@/api/user/knowledge'
import { adminGetArticles, adminGetArticleDetail, adminUpdateArticle, adminDeleteArticle, adminBatchDeleteArticles, adminPublishArticle, adminUnpublishArticle, adminCreateArticle, adminGetArticleStatistics } from '@/api/admin/knowledge'
import type { KnowledgeCategory, KnowledgeArticle, AdminKnowledgeArticlesQuery, AdminArticleStatisticsResponse, AdminCreateArticlePayload, AdminUpdateArticlePayload } from '@/types/factory'

// 分类
const categories = ref<KnowledgeCategory[]>([])

// 列表与分页
const articles = ref<KnowledgeArticle[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, page_size: 10 })

// 过滤项
const filters = reactive<AdminKnowledgeArticlesQuery>({
  query: '',
  category_id: undefined,
  status: undefined,
})

// 选择
const multipleSelection = ref<KnowledgeArticle[]>([])

// 加载状态
const loading = reactive({ list: false, create: false, update: false, detail: false, stats: false })

// 统计
const stats = reactive<AdminArticleStatisticsResponse['data']>({
  basic_stats: { total_articles: 0, published_articles: 0, draft_articles: 0, archived_articles: 0, featured_articles: 0 },
  category_stats: [],
  author_stats: [],
  recent_articles: [],
})

// 对话框与表单
const dialogs = reactive({ create: false, edit: false })

// 创建表单
const createFormRef = ref<FormInstance>()
const createForm = reactive<AdminCreateArticlePayload>({
  title: '',
  content: '',
  summary: '',
  image: '',
  category: undefined as unknown as number,
  tags: '',
  is_featured: false,
  sort_order: 0,
})

const createRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

// 编辑表单
const editFormRef = ref<FormInstance>()
const editingId = ref<number | null>(null)
const editForm = reactive<Required<AdminUpdateArticlePayload>>({ title: '', content: '', status: 'draft' })

const editRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 方法
const formatDate = (s?: string | null) => {
  if (!s) return '-'
  try { return new Date(s).toLocaleString() } catch { return String(s) }
}

const statusText = (s: string) => ({ draft: '草稿', published: '已发布', archived: '已归档' } as Record<string, string>)[s] || s
const statusTagType = (s: string) => ({ draft: 'info', published: 'success', archived: 'warning' } as Record<string, any>)[s] || 'info'

const handleSelectionChange = (rows: KnowledgeArticle[]) => { multipleSelection.value = rows }

const handleFilterChange = () => { pagination.page = 1; getList() }
const resetFilters = () => {
  filters.query = ''
  filters.category_id = undefined
  filters.status = undefined
  pagination.page = 1
  pagination.page_size = 10
  getList()
}

const handleSizeChange = (size: number) => { pagination.page_size = size; getList() }
const handleCurrentChange = (page: number) => { pagination.page = page; getList() }

const getList = async () => {
  loading.list = true
  try {
    const params: AdminKnowledgeArticlesQuery = {
      query: filters.query || undefined,
      category_id: filters.category_id || undefined,
      status: filters.status,
      page: pagination.page,
      page_size: pagination.page_size,
    }
    const res = await adminGetArticles(params)
    if (res.code === 200) {
      articles.value = res.data.articles || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取文章列表失败')
    }
  } catch (e) {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.list = false
  }
}

const refreshAll = () => { getStats(); getList() }

const getStats = async () => {
  loading.stats = true
  try {
    const res = await adminGetArticleStatistics()
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (e) { /* 忽略 */ } finally { loading.stats = false }
}

// 创建
const openCreateDialog = () => { dialogs.create = true }
const submitCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.create = true
    try {
      const payload: AdminCreateArticlePayload = { ...createForm, image: createForm.image || null }
      const res = await adminCreateArticle(payload)
      if (res.code === 200) {
        ElMessage.success('创建成功')
        dialogs.create = false
        resetCreateForm()
        getList()
      } else {
        ElMessage.error(res.msg || '创建失败')
      }
    } catch (e) {
      ElMessage.error('创建失败')
    } finally {
      loading.create = false
    }
  })
}
const resetCreateForm = () => {
  createForm.title = ''
  createForm.summary = ''
  createForm.category = undefined as unknown as number
  createForm.tags = ''
  createForm.image = ''
  createForm.is_featured = false
  createForm.sort_order = 0
  createForm.content = ''
}

// 编辑
const openEditDialog = async (id: number) => {
  dialogs.edit = true
  editingId.value = id
  loading.detail = true
  try {
    const res = await adminGetArticleDetail(id)
    if (res.code === 200) {
      // 仅编辑允许的字段
      editForm.title = res.data.title
      editForm.content = res.data.content
      editForm.status = (res.data.status as any) || 'draft'
    } else {
      ElMessage.error(res.msg || '获取文章详情失败')
    }
  } catch (e) {
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.detail = false
  }
}

const submitEdit = async () => {
  if (!editFormRef.value || !editingId.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.update = true
    try {
      const payload: AdminUpdateArticlePayload = { title: editForm.title, content: editForm.content, status: editForm.status }
      const res = await adminUpdateArticle(editingId.value!, payload)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        dialogs.edit = false
        getList()
      } else {
        ElMessage.error(res.msg || '保存失败')
      }
    } catch (e) {
      ElMessage.error('保存失败')
    } finally {
      loading.update = false
    }
  })
}

// 发布 / 下架
const handlePublish = async (row: KnowledgeArticle) => {
  try {
    await ElMessageBox.confirm(`确定发布《${row.title}》吗？`, '发布确认', { type: 'warning' })
    const res = await adminPublishArticle(row.id)
    if (res.code === 200) { ElMessage.success('发布成功'); getList() } else { ElMessage.error(res.msg || '发布失败') }
  } catch { /* 取消 */ }
}

const handleUnpublish = async (row: KnowledgeArticle) => {
  try {
    await ElMessageBox.confirm(`确定取消发布《${row.title}》吗？`, '取消发布确认', { type: 'warning' })
    const res = await adminUnpublishArticle(row.id)
    if (res.code === 200) { ElMessage.success('已取消发布'); getList() } else { ElMessage.error(res.msg || '操作失败') }
  } catch { /* 取消 */ }
}

// 删除
const confirmDelete = (row: KnowledgeArticle) => {
  ElMessageBox.confirm(`确定删除《${row.title}》吗？该操作不可恢复。`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await adminDeleteArticle(row.id)
      if (res.code === 200) { ElMessage.success('删除成功'); getList() } else { ElMessage.error(res.msg || '删除失败') }
    })
    .catch(() => {})
}

// 批量删除
const confirmBatchDelete = () => {
  const ids = multipleSelection.value.map(i => i.id)
  if (ids.length === 0) return
  ElMessageBox.confirm(`确定批量删除选中的 ${ids.length} 篇文章吗？不可恢复。`, '批量删除确认', { type: 'warning' })
    .then(async () => {
      const res = await adminBatchDeleteArticles({ article_ids: ids })
      if (res.code === 200) { ElMessage.success('批量删除成功'); getList() } else { ElMessage.error(res.msg || '批量删除失败') }
    })
    .catch(() => {})
}

onMounted(async () => {
  // 分类
  try {
    const res = await getKnowledgeCategories()
    if (res.code === 200) categories.value = res.data
  } catch { /* ignore */ }
  await Promise.all([getStats(), getList()])
})
</script>

<style scoped>
.knowledge-admin-container {
  padding: 16px;
}
.stats-header, .list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stats-title, .list-title {
  font-size: 16px;
  font-weight: 600;
}
.stats-row { margin-top: 4px; }
.stat-card { text-align: center; }

.search-card { margin-top: 12px; }
.list-card { margin-top: 12px; }

.title-cell { display: flex; align-items: center; }
.title-text { font-weight: 600; }
.time-cell { display: flex; align-items: center; justify-content: center; }
.time-icon { margin-right: 6px; }

.pagination-container { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
