<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Motion } from 'motion-v'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox, type UploadProps, type UploadUserFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const { userInfo, getUserAvatar } = storeToRefs(userStore)

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: ['easeOut'] }
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: ['easeOut'] }
}

// 表单数据
const profileForm = reactive({
  username: userInfo.value?.username || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
  role: userInfo.value?.role || '',
  avatar: getUserAvatar.value || ''
})

// 监听用户信息变化，同步到表单
watch(userInfo, (newUserInfo) => {
  if (newUserInfo) {
    profileForm.username = newUserInfo.username || ''
    profileForm.email = newUserInfo.email || ''
    profileForm.phone = newUserInfo.phone || ''
    profileForm.role = newUserInfo.role || ''
  }
}, { immediate: true })

watch(getUserAvatar, (newAvatar) => {
  profileForm.avatar = newAvatar || ''
}, { immediate: true })

// 保存状态
const saving = ref(false)

// 头像上传相关
const avatarFileList = ref<UploadUserFile[]>([])
const avatarDialogVisible = ref(false)

// 保存个人信息
async function saveProfile() {
  try {
    saving.value = true
    
    // 验证表单数据
    if (!profileForm.username.trim()) {
      ElMessage.error('用户名不能为空')
      return
    }
    
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      ElMessage.error('请输入有效的邮箱地址')
      return
    }
    
    if (profileForm.phone && !/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      ElMessage.error('请输入有效的手机号码')
      return
    }
    
    // 模拟API调用保存用户信息 - 添加随机失败模拟真实场景
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟90%成功率
        if (Math.random() > 0.1) {
          resolve(true)
        } else {
          reject(new Error('网络连接失败'))
        }
      }, 1000)
    })
    
    // 更新用户store中的信息
    await userStore.updateUserInfo({
      username: profileForm.username,
      email: profileForm.email,
      phone: profileForm.phone
    })
    
    ElMessage.success('个人信息保存成功')
  } catch (error) {
    console.error('保存个人信息失败:', error)
    ElMessage.error(`保存失败：${error.message || '请检查网络连接后重试'}`)
  } finally {
    saving.value = false
  }
}

// 头像上传处理
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  profileForm.avatar = URL.createObjectURL(uploadFile.raw!)
  avatarDialogVisible.value = false
  ElMessage.success('头像上传成功')
}

const handleAvatarError: UploadProps['onError'] = (error) => {
  console.error('头像上传失败:', error)
  ElMessage.error(`头像上传失败：${error.message || '请检查网络连接后重试'}`)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)) {
    ElMessage.error('头像只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 自定义头像上传处理
const customAvatarUpload: UploadProps['httpRequest'] = async (options) => {
  try {
    const { file } = options
    
    // 模拟上传过程 - 添加随机失败模拟真实场景
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟85%成功率
        if (Math.random() > 0.15) {
          resolve(true)
        } else {
          reject(new Error('上传服务器连接失败'))
        }
      }, 1500)
    })
    
    // 上传成功，更新头像
    profileForm.avatar = URL.createObjectURL(file)
    
    // 同时更新用户store中的头像信息
    await userStore.updateUserInfo({
      avatar: profileForm.avatar
    })
    
    avatarDialogVisible.value = false
    ElMessage.success('头像上传成功')
    
    // 调用成功回调
    options.onSuccess?.({
      url: profileForm.avatar
    })
    
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(`头像上传失败：${error.message || '请检查网络连接后重试'}`)
    
    // 调用失败回调
    options.onError?.(error as Error)
  }
}

// 打开头像上传对话框
function openAvatarDialog() {
  avatarDialogVisible.value = true
}

// 重置表单
function resetForm() {
  ElMessageBox.confirm(
    '确定要重置所有修改吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    profileForm.username = userInfo.value?.username || ''
    profileForm.email = userInfo.value?.email || ''
    profileForm.phone = userInfo.value?.phone || ''
    profileForm.avatar = getUserAvatar.value || ''
    ElMessage.success('表单已重置')
  })
}
</script>

<template>
  <div class="profile-container h-full overflow-y-auto">
    <!-- @vue-ignore -->
    <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">个人中心</h1>
          <p class="text-gray-600 mt-1">管理您的个人信息和账户设置</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左侧个人信息卡片 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
            :transition="{ ...cardVariants.transition, delay: 0.1 }">
            <el-card class="profile-card">
              <template #header>
                <div class="flex items-center">
                  <el-icon class="mr-2 text-blue-500">
                    <User />
                  </el-icon>
                  <span class="font-medium">基本信息</span>
                </div>
              </template>
              
              <div class="text-center mb-6">
                <el-avatar :size="80" :src="profileForm.avatar" class="mb-4" />
                <h3 class="text-lg font-medium text-gray-900">{{ profileForm.username }}</h3>
                <p class="text-gray-500">{{ profileForm.role }}</p>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center text-sm">
                  <el-icon class="mr-2 text-gray-400">
                    <Message />
                  </el-icon>
                  <span class="text-gray-600">{{ profileForm.email || '未设置邮箱' }}</span>
                </div>
                <div class="flex items-center text-sm">
                  <el-icon class="mr-2 text-gray-400">
                    <Phone />
                  </el-icon>
                  <span class="text-gray-600">{{ profileForm.phone || '未设置手机号' }}</span>
                </div>
              </div>
            </el-card>
          </Motion>

          <!-- 右侧编辑表单 -->
          <div class="lg:col-span-2">
            <!-- @vue-ignore -->
            <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
              :transition="{ ...cardVariants.transition, delay: 0.2 }">
              <el-card>
                <template #header>
                  <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <el-icon class="mr-2 text-green-500">
                          <Edit />
                        </el-icon>
                        <span class="font-medium">编辑信息</span>
                      </div>
                      <div class="flex space-x-2">
                        <el-button @click="resetForm" :disabled="saving">
                          重置
                        </el-button>
                        <el-button type="primary" @click="saveProfile" :loading="saving">
                          {{ saving ? '保存中...' : '保存更改' }}
                        </el-button>
                      </div>
                    </div>
                </template>
                
                <el-form :model="profileForm" label-width="80px" class="profile-form">
                  <el-form-item label="用户名">
                    <el-input v-model="profileForm.username" placeholder="请输入用户名" />
                  </el-form-item>
                  
                  <el-form-item label="邮箱">
                    <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" type="email" />
                  </el-form-item>
                  
                  <el-form-item label="手机号">
                    <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                  </el-form-item>
                  
                  <!-- <el-form-item label="角色">
                    <el-input v-model="profileForm.role" disabled />
                  </el-form-item>
                   -->
                  <el-form-item label="头像">
                    <div class="flex items-center space-x-4">
                      <el-avatar :size="40" :src="profileForm.avatar" />
                      <el-button size="small" @click="openAvatarDialog">
                        <el-icon class="mr-1">
                          <Plus />
                        </el-icon>
                        更换头像
                      </el-button>
                    </div>
                  </el-form-item>
                </el-form>
              </el-card>
            </Motion>
          </div>
        </div>
      </div>
    </Motion>
    
    <!-- 头像上传对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="更换头像" width="400px" center>
      <div class="text-center">
        <div class="mb-4">
          <el-avatar :size="100" :src="profileForm.avatar" class="mb-4" />
          <p class="text-gray-600 text-sm">当前头像</p>
        </div>
        
        <el-upload
          class="avatar-uploader"
          :http-request="customAvatarUpload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :on-error="handleAvatarError"
          :before-upload="beforeAvatarUpload"
          accept="image/*"
          drag
        >
          <div class="upload-area">
            <el-icon class="upload-icon">
              <Plus />
            </el-icon>
            <div class="upload-text">
              <p>点击或拖拽图片到此处上传</p>
              <p class="upload-hint">支持 JPG、PNG、GIF 格式，文件大小不超过 2MB</p>
            </div>
          </div>
        </el-upload>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 24px;
}

.profile-card {
  height: fit-content;
}

.profile-form .el-form-item {
  margin-bottom: 20px;
}

/* 卡片悬停效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 头像上传样式 */
.avatar-uploader {
  width: 100%;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 0;
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.dialog-footer {
  text-align: center;
}
</style>