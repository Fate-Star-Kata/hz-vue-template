<template>
  <div class="userinfo">
    <div class="container">
      <!-- Tab 导航 -->
      <div class="tab-navigation">
        <button v-for="tab in tabList" :key="tab.key" :class="['tab-btn', { 'active': activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 内容 -->
      <div class="content">
        <!-- 基本信息 -->
        <BaseInfo v-show="activeTab === 'baseInfo'" ref="baseInfoRef" :user-info="localUserInfo"
          @update:user-info="localUserInfo = $event" />

        <!-- 个人详细信息 -->
        <PersonalDetails v-show="activeTab === 'personalDetails'" ref="personalDetailsRef"
          :user-info="localUserInfo?.user_info || {}" @update:user-info="updatePersonalDetails" />

        <!-- 社交信息 -->
        <SocialInfo v-show="activeTab === 'socialInfo'" ref="socialInfoRef" :user-info="localUserInfo?.user_info || {}"
          @update:user-info="updateSocialInfo" />

        <!-- 修改密码 -->
        <ChangePassword v-show="activeTab === 'changePassword'" />
      </div>

      <!-- 统一的操作按钮 - 密码修改选项卡时隐藏 -->
      <div v-if="activeTab !== 'changePassword'" class="action-buttons">
        <el-button @click="resetForm" :disabled="saving || loading">
          重置
        </el-button>
        <el-button type="primary" @click="saveUserInfo" :loading="saving">
          {{ saving ? '保存中...' : '保存更改' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from 'pinia'
import { getCurrentUserInfo } from '@/api/user/index'
import { updateUserInfo } from '@/api/user/userinfo'
import type { UpdateUserInfoRequest } from '@/types/factory'
import BaseInfo from '@/components/pages/userInfo/BaseInfo.vue'
import PersonalDetails from '@/components/pages/userInfo/PersonalDetails.vue'
import SocialInfo from '@/components/pages/userInfo/SocialInfo.vue'
import ChangePassword from '@/components/pages/userInfo/ChangePassword.vue'

// 定义页面元数据
defineOptions({
  name: 'UserInfo'
})

// 响应式数据
const activeTab = ref<string>('baseInfo')
const loading = ref(false)
const saving = ref(false)
const router = useRouter()

// 用户store
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 子组件引用
const baseInfoRef = ref()
const personalDetailsRef = ref()
const socialInfoRef = ref()

// 本地用户数据
const localUserInfo = ref<any>(null)

watch(activeTab, (val) => {
  console.log('当前选项卡:', val)
})

// Tab 列表配置
const tabList = reactive([
  {
    key: 'baseInfo',
    label: '基本信息'
  },
  {
    key: 'personalDetails',
    label: '个人详细信息'
  },
  {
    key: 'socialInfo',
    label: '社交信息'
  },
  {
    key: 'changePassword',
    label: '修改密码'
  }
])

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await getCurrentUserInfo()
    if (response.code === 200) {
      localUserInfo.value = response.data
      // 确保user_info存在并包含所有必要字段
      if (!localUserInfo.value.user_info) {
        localUserInfo.value.user_info = {}
      }

      // 确保所有字段都有默认值
      localUserInfo.value.user_info = {
        // 个人详细信息字段
        phone: localUserInfo.value.user_info.phone || '',
        gender: localUserInfo.value.user_info.gender || 'other',
        birthday: localUserInfo.value.user_info.birthday || '',
        address: localUserInfo.value.user_info.address || '',
        bio: localUserInfo.value.user_info.bio || '',

        // 社交信息字段
        wechat: localUserInfo.value.user_info.wechat || '',
        qq: localUserInfo.value.user_info.qq || '',
        weibo: localUserInfo.value.user_info.weibo || '',
        personal_site: localUserInfo.value.user_info.personal_site || '',

        // 其他字段
        avatar: localUserInfo.value.user_info.avatar || '',
        ...localUserInfo.value.user_info
      }
    } else if (response.code === 401) {
      ElMessage.error('身份认证失败，请先登录')
      router.push('/auth/login')
    } else {
      ElMessage.error(response.msg || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 更新个人详细信息
const updatePersonalDetails = (data: any) => {
  if (localUserInfo.value && localUserInfo.value.user_info) {
    localUserInfo.value.user_info = { ...localUserInfo.value.user_info, ...data }
  }
}

// 更新社交信息
const updateSocialInfo = (data: any) => {
  if (localUserInfo.value && localUserInfo.value.user_info) {
    localUserInfo.value.user_info = { ...localUserInfo.value.user_info, ...data }
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!localUserInfo.value) {
    ElMessage.error('用户信息不存在')
    return
  }

  try {
    // 根据当前选项卡验证对应的表单
    let currentFormRef = null
    switch (activeTab.value) {
      case 'baseInfo':
        currentFormRef = baseInfoRef.value
        break
      case 'personalDetails':
        currentFormRef = personalDetailsRef.value
        break
      case 'socialInfo':
        currentFormRef = socialInfoRef.value
        break
    }

    // 验证表单
    if (currentFormRef && currentFormRef.validate) {
      await currentFormRef.validate()
    }

    saving.value = true

    // 验证必填字段
    if (!localUserInfo.value.username?.trim()) {
      ElMessage.error('用户名不能为空')
      return
    }

    if (localUserInfo.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localUserInfo.value.email)) {
      ElMessage.error('请输入有效的邮箱地址')
      return
    }

    // 构造更新请求数据
    const updateData: UpdateUserInfoRequest = {
      id: localUserInfo.value.id,
      username: localUserInfo.value.username,
      email: localUserInfo.value.email || '',
      first_name: localUserInfo.value.first_name || '',
      last_name: localUserInfo.value.last_name || '',
      is_active: localUserInfo.value.is_active,
      user_info: {
        avatar: localUserInfo.value.user_info?.avatar || '',
        phone: localUserInfo.value.user_info?.phone || '',
        wechat: localUserInfo.value.user_info?.wechat || '',
        qq: localUserInfo.value.user_info?.qq || '',
        weibo: localUserInfo.value.user_info?.weibo || '',
        personal_site: localUserInfo.value.user_info?.personal_site || '',
        bio: localUserInfo.value.user_info?.bio || '',
        address: localUserInfo.value.user_info?.address || '',
        birthday: localUserInfo.value.user_info?.birthday || '',
        gender: localUserInfo.value.user_info?.gender || 'other'
      }
    }

    // 调用更新用户信息API
    const response = await updateUserInfo(updateData)

    if (response.code === 200) {
      await userStore.setUserInfo(localUserInfo.value)
      ElMessage.success('个人信息保存成功')
    } else if (response.code === 401) {
      ElMessage.error('身份认证失败，请先登录')
      router.push('/auth/login')
    } else {
      ElMessage.error(response.msg || '保存失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(`保存失败：${error.message || '请检查网络连接后重试'}`)
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  ElMessageBox.confirm(
    '确定要重置所有修改吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    // 重新获取用户信息
    await fetchUserInfo()

    // 重置对应的表单字段
    let currentFormRef = null
    switch (activeTab.value) {
      case 'baseInfo':
        currentFormRef = baseInfoRef.value
        break
      case 'personalDetails':
        currentFormRef = personalDetailsRef.value
        break
      case 'socialInfo':
        currentFormRef = socialInfoRef.value
        break
    }

    // 重置表单验证状态
    if (currentFormRef && currentFormRef.resetFields) {
      currentFormRef.resetFields()
    }

    ElMessage.success('表单已重置')
  })
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.userinfo {
  min-height: calc(100vh - 100px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  .container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .tab-navigation {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: white;
    padding: 8px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(229, 231, 235, 0.6);

    .tab-btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #6b7280;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        background: rgba(59, 130, 246, 0.05);
        color: #3b82f6;
      }

      &.active {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);

        &:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
        }
      }
    }
  }

  .content {
    animation: fadeIn 0.3s ease-in-out;
  }

  .action-buttons {
    margin-top: 24px;
    padding: 20px 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(229, 231, 235, 0.8);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .el-button {
      border-radius: 8px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.3s ease;

      &.el-button--primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>