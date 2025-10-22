<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Spin, Tree } from 'ant-design-vue';

import { getMenuTreeApi } from '#/api/sys/menu';
import { assignRoleMenusApi, getRoleMenusApi } from '#/api/sys/role';

defineOptions({
  name: 'AssignPermissionsModal',
});

const emit = defineEmits(['success']);

const loading = ref(false);
const treeData = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);
const halfCheckedKeys = ref<number[]>([]);
const roleData = ref<any>();

// 处理树节点选中事件
function handleCheck(checkedKeysValue: any, info: any) {
  checkedKeys.value = checkedKeysValue;
  halfCheckedKeys.value = info.halfCheckedKeys || [];
}

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [menuTree, roleMenus] = await Promise.all([
      getMenuTreeApi(),
      getRoleMenusApi(roleData.value.id),
    ]);
    treeData.value = menuTree;
    // 后端只返回叶子节点，Tree组件会自动计算父节点的半选状态
    checkedKeys.value = roleMenus;
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
      // 保存时需要包含所有选中的节点（包括半选中的父节点）
      const allCheckedKeys = [...checkedKeys.value, ...halfCheckedKeys.value];
      await assignRoleMenusApi(roleData.value.id, allCheckedKeys);
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
      roleData.value = undefined;
      treeData.value = [];
      checkedKeys.value = [];
      halfCheckedKeys.value = [];
      return;
    }

    const data = modalApi.getData();
    if (data) {
      roleData.value = data;
      await loadData();
    }
  },
});
</script>

<template>
  <Modal title="分配权限" class="w-2/3">
    <div class="p-4">
      <Spin :spinning="loading">
        <Tree
          :checked-keys="checkedKeys"
          :tree-data="treeData"
          :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
          checkable
          :check-strictly="false"
          :height="400"
          :default-expand-all="true"
          @check="handleCheck"
        />
      </Spin>
    </div>
  </Modal>
</template>

<style scoped>
:deep(.ant-tree) {
  background: transparent;
}
</style>
