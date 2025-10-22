<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, Input, message, Spin } from 'ant-design-vue';

import { assignPostRolesApi, getPostRolesApi } from '#/api/sys/post';
import { getRoleListApi } from '#/api/sys/role';

defineOptions({
  name: 'AssignPostRolesModal',
});

const emit = defineEmits(['success']);

const CheckboxGroup = Checkbox.Group;

const loading = ref(false);
const searchText = ref('');
const allRoles = ref<any[]>([]);
const selectedRoles = ref<number[]>([]);
const postData = ref<any>();

// 过滤角色列表
const filteredRoles = computed(() => {
  if (!searchText.value) {
    return allRoles.value;
  }
  return allRoles.value.filter((role) =>
    role.roleName.toLowerCase().includes(searchText.value.toLowerCase()),
  );
});

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [roles, postRoles] = await Promise.all([
      getRoleListApi(),
      getPostRolesApi(postData.value.id),
    ]);
    allRoles.value = roles;
    selectedRoles.value = postRoles;
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
      await assignPostRolesApi(postData.value.id, selectedRoles.value);
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
      postData.value = undefined;
      allRoles.value = [];
      selectedRoles.value = [];
      searchText.value = '';
      return;
    }

    const data = modalApi.getData();
    if (data) {
      postData.value = data;
      await loadData();
    }
  },
});
</script>

<template>
  <Modal title="分配角色" class="w-2/3">
    <div class="p-4">
      <Spin :spinning="loading">
        <div class="mb-4">
          <Input
            v-model:value="searchText"
            placeholder="搜索角色名称"
            allow-clear
          />
        </div>
        <CheckboxGroup v-model:value="selectedRoles" class="w-full">
          <div class="grid grid-cols-2 gap-4">
            <Checkbox
              v-for="role in filteredRoles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.roleName }}
            </Checkbox>
          </div>
        </CheckboxGroup>
      </Spin>
    </div>
  </Modal>
</template>

<style scoped>
:deep(.ant-checkbox-group) {
  width: 100%;
}
</style>
