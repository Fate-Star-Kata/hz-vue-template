<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import type { User, UserQueryParams } from '@/types/components/admin'
import Search from '@/components/icon/search.vue'
import EditUserDialog from './EditUserDialog.vue'
import AddUserDialog from './AddUserDialog.vue'
import {
  getUsersAPI,
  userDetailAPI,
  deleteUserAPI
} from '@/api/admin/users'
import { useUserStore } from '@/stores/auth/user'

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

// Store
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentEditUser = ref<User | null>(null)
const isAdd = ref(false)

// 查询参数
const params = reactive<UserQueryParams>({
  query: '',
  page: 1,
  page_size: 10
})

// 计算属性
const userId = computed(() => userStore.userInfo?.user_id)

// 获取用户列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getUsersAPI(params)
    list.value = res.data.users
    total.value = res.data.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const search = () => {
  params.page = 1
  getList()
}

// 重置参数
const resetParams = () => {
  params.page = 1
  params.query = ''
  getList()
}

// 查看用户详情
const detail = async (id: number) => {
  try {
    const res = await userDetailAPI(id)
    console.log('用户详情:', res)
    ElMessage.success('查看用户详情成功')
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 编辑用户
const edit = (id: number) => {
  const user = list.value.find(item => item.id === id)
  if (user) {
    currentEditUser.value = cloneDeep(user)
    editDialogVisible.value = true
  }
}

// 添加用户
const handleAdd = () => {
  addDialogVisible.value = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  getList()
}

// 添加成功回调
const handleAddSuccess = () => {
  getList()
}



// 删除用户
const deleteRecord = async (id: number) => {
  try {
    const res = await deleteUserAPI(id)
    ElMessage.success(res.msg || '删除成功')
    getList()
  } catch (error) {
    console.error('删除数据失败:', error)
    ElMessage.error('删除失败')
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  params.page_size = size
  params.page = 1
  getList()
}

const handleCurrentChange = (page: number) => {
  params.page = page
  getList()
}

// 行点击事件
const handleRowClick = (row: User) => {
  // 可以在这里添加行点击逻辑
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<template>
  <!-- @vue-ignore -->
  <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition"
    class="user-manage h-full overflow-y-auto">
    <el-card>
      <!-- 搜索和操作区域 -->
      <Motion :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }">
        <el-row :gutter="16" class="mb-4">
          <el-col :span="6">
            <el-input v-model="params.query" placeholder="请输入邮箱或用户名" clearable @keyup.enter="search">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="12">
            <el-space>
              <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
                <el-button @click="resetParams">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                  重置
                </el-button>
              </Motion>
              <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
                <el-button type="primary" @click="search">
                  <Search size="12" />
                  查询
                </el-button>
              </Motion>
              <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
                <el-button type="success" @click="handleAdd">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加
                </el-button>
              </Motion>
            </el-space>
          </el-col>
        </el-row>
      </Motion>

      <!-- 表格区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }">
        <el-table :data="list" v-loading="loading" border stripe class="user-table" @row-click="handleRowClick">
          <el-table-column label="序号" width="80" align="center">
            <template #default="{ $index }">
              {{ (params.page - 1) * params.page_size + $index + 1 }}
            </template>
          </el-table-column>

          <el-table-column label="用户名" prop="username" min-width="120">
            <template #default="{ row }">
              <span type="primary">
                {{ row.username }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="邮箱" prop="email" min-width="180">
            <template #default="{ row }">
              <span>{{ row.email }}</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" prop="is_active" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                {{ row.is_active ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="工作人员权限" prop="is_staff" width="140" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_staff ? 'success' : 'info'" size="small">
                {{ row.is_staff ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="超级管理员权限" prop="is_superuser" width="160" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_superuser ? 'warning' : 'info'" size="small">
                {{ row.is_superuser ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-space>
                <Motion :whileHover="{ scale: 1.1 }" :whileTap="{ scale: 0.9 }">
                  <el-button type="primary" size="small" :disabled="userId === row.id" @click="edit(row.id)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    编辑
                  </el-button>
                </Motion>
                <Motion :whileHover="{ scale: 1.1 }" :whileTap="{ scale: 0.9 }">
                  <el-popconfirm v-if="userId !== row.id"
                    title="确认删除吗?" confirm-button-text="确认" cancel-button-text="取消" @confirm="deleteRecord(row.id)">
                    <template #reference>
                      <el-button type="danger" size="small">
                        <el-icon>
                          <Delete />
                        </el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </Motion>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </Motion>

      <!-- 分页区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }" class="mt-4 flex justify-end">
        <el-pagination v-model:current-page="params.page" v-model:page-size="params.page_size" :total="total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </Motion>
    </el-card>
    
    <!-- 编辑用户弹窗 -->
    <EditUserDialog
      v-model:visible="editDialogVisible"
      :user-data="currentEditUser"
      @success="handleEditSuccess"
    />
    
    <!-- 添加用户弹窗 -->
    <AddUserDialog
      v-model:visible="addDialogVisible"
      @success="handleAddSuccess"
    />
  </Motion>
</template>

<style scoped lang="scss">
.user-manage {
  .user-table {
    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    :deep(.el-table__header) {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
  }

  .el-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .el-button {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .el-tag {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>