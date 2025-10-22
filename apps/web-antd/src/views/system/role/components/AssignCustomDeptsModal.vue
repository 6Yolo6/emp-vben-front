<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Tree } from 'ant-design-vue';

import { assignRoleDeptsApi, getDeptTreeApi, getRoleDeptsApi } from '#/api';

defineOptions({
  name: 'AssignCustomDeptsModal',
});

const emit = defineEmits(['success']);

const ATree = Tree;

const roleData = ref<any>();
const treeData = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!roleData.value?.id) {
      return;
    }

    modalApi.lock();
    try {
      await assignRoleDeptsApi(
        roleData.value.id,
        checkedKeys.value as number[],
      );
      message.success('分配成功');
      await modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      roleData.value = undefined;
      treeData.value = [];
      checkedKeys.value = [];
      return;
    }

    // 加载数据
    const data = modalApi.getData();
    if (!data || !data.id) {
      return;
    }

    modalApi.lock();
    try {
      roleData.value = data;

      // 加载部门树
      treeData.value = await getDeptTreeApi();

      // 加载已分配的部门
      const deptIds = await getRoleDeptsApi(data.id);
      checkedKeys.value = deptIds || [];
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal title="分配自定义部门" class="w-1/2">
    <div class="p-4">
      <div class="mb-4 text-gray-600">
        为角色"{{ roleData?.roleName }}"选择可访问的部门
      </div>
      <ATree
        v-model:checked-keys="checkedKeys"
        checkable
        :tree-data="treeData"
        :field-names="{ title: 'deptName', key: 'id', children: 'children' }"
        :height="400"
      />
    </div>
  </Modal>
</template>
