<template>
  <div class="base-info">
    <el-form ref="formRef" :model="localUserInfo" :rules="rules" label-width="100px" v-if="localUserInfo">
      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="localUserInfo.username" disabled placeholder="用户名" />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="localUserInfo.email" type="email" placeholder="请输入邮箱" @input="updateUserInfo" />
      </el-form-item>

      <!-- 姓名 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="姓" prop="first_name">
            <el-input v-model="localUserInfo.first_name" placeholder="请输入姓" @input="updateUserInfo" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名" prop="last_name">
            <el-input v-model="localUserInfo.last_name" placeholder="请输入名" @input="updateUserInfo" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 账户状态 -->
      <el-form-item label="账户状态">
        <el-switch v-model="localUserInfo.is_active" active-text="启用" inactive-text="禁用" :disabled="true" />
      </el-form-item>
    </el-form>
    <div v-else class="loading-placeholder">
      <el-skeleton :rows="4" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 定义组件名称
defineOptions({
  name: 'BaseInfo'
})

// Props
interface Props {
  userInfo?: any
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update:user-info': [userInfo: any]
}

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 本地用户信息（用于双向绑定）
const localUserInfo = computed({
  get: () => props.userInfo,
  set: (value) => {
    emit('update:user-info', value)
  }
})

// 表单验证规则
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  first_name: [
    { max: 50, message: '姓不能超过50个字符', trigger: 'blur' }
  ],
  last_name: [
    { max: 50, message: '名不能超过50个字符', trigger: 'blur' }
  ]
}

// 更新用户信息
const updateUserInfo = () => {
  if (localUserInfo.value) {
    emit('update:user-info', { ...localUserInfo.value })
  }
}

// 暴露表单验证方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
})
</script>

<style scoped lang="scss">
.base-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(229, 231, 235, 0.8);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading-placeholder {
    padding: 20px;
  }

  .avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-control {
    .label-text {
      font-weight: 500;
    }
  }

  .input-error,
  .select-error {
    border-color: hsl(var(--error));
  }

  // Element Plus 表单样式优化
  :deep(.el-form-item) {
    margin-bottom: 20px;

    .el-form-item__label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .el-input__wrapper {
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover {
        border-color: #d1d5db;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
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

  :deep(.el-switch) {
    --el-switch-on-color: #409eff;
    --el-switch-off-color: #dcdfe6;
  }

  :deep(.el-col) {
    margin-bottom: 0;
  }

  :deep(.el-row .el-form-item) {
    margin-bottom: 18px;
  }
}
</style>
