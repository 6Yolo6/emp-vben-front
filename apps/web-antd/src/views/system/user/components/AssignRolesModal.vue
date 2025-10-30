<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, message, Spin } from 'ant-design-vue';

import { getRoleListApi } from '#/api/sys/role';
import { assignUserRolesApi, getUserRolesApi } from '#/api/sys/user';

defineOptions({
  name: 'AssignRolesModal',
});

const emit = defineEmits(['success']);

const CheckboxGroup = Checkbox.Group;

const loading = ref(false);
const roleList = ref<any[]>([]);
const selectedRoles = ref<number[]>([]);
const userData = ref<any>();

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [roles, userRoles] = await Promise.all([
      getRoleListApi(),
      getUserRolesApi(userData.value.id),
    ]);
    roleList.value = roles;
    selectedRoles.value = userRoles;
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.lock();
    try {
      await assignUserRolesApi(userData.value.id, selectedRoles.value);
      await modalApi.close();
      emit('success');
      message.success('分配成功');
    } catch (error) {
      console.error('分配失败:', error);
      message.error('分配失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      userData.value = undefined;
      roleList.value = [];
      selectedRoles.value = [];
      return;
    }

    const data = modalApi.getData();
    if (data) {
      userData.value = data;
      await loadData();
    }
  },
});
</script>

<template>
  <Modal title="分配角色" class="w-1/3">
    <div class="p-4">
      <Spin :spinning="loading">
        <CheckboxGroup v-model:value="selectedRoles" class="role-list">
          <div v-for="role in roleList" :key="role.id" class="role-item">
            <Checkbox :value="role.id">
              {{ role.roleName }}
              <span class="role-key">({{ role.roleKey }})</span>
            </Checkbox>
          </div>
        </CheckboxGroup>
      </Spin>
    </div>
  </Modal>
</template>

<style scoped>
.role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.role-item:hover {
  background-color: #fafafa;
}

.role-key {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
</style>
