<
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Alert, message, Spin, Tree } from 'ant-design-vue';

import { getMenuTreeApi } from '#/api/sys/menu';
import {
  assignUserPermissionsApi,
  getUserDirectMenusApi,
  getUserPermissionsApi,
} from '#/api/sys/user';

defineOptions({
  name: 'AssignUserPermissionsModal',
});

const emit = defineEmits(['success']);

const loading = ref(false);
const menuTree = ref<any[]>([]);
const selectedMenuIds = ref<number[]>([]);
const disabledMenuIds = ref<number[]>([]); // 通过岗位获得的权限（只读）
const userData = ref<any>();

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [tree, userMenuIds, allPermissions] = await Promise.all([
      getMenuTreeApi(),
      getUserDirectMenusApi(userData.value.id),
      getUserPermissionsApi(userData.value.id),
    ]);

    // 获取通过角色获得的权限ID（这些权限不能取消勾选）
    const roleMenuIds: number[] = [];
    if (allPermissions && allPermissions.permissions) {
      allPermissions.permissions
        .filter((p: any) => p.sourceType === 'role' || p.sourceType === 'post')
        .forEach((p: any) => roleMenuIds.push(p.menuId));
    }
    disabledMenuIds.value = roleMenuIds;

    // 设置树节点的 disableCheckbox 属性
    const processTree = (nodes: any[]): any[] => {
      return nodes.map((node) => ({
        ...node,
        disableCheckbox: roleMenuIds.includes(node.id),
        children: node.children ? processTree(node.children) : undefined,
      }));
    };

    menuTree.value = processTree(tree);

    // 合并角色权限和直接权限作为初始选中
    selectedMenuIds.value = [...new Set([...roleMenuIds, ...userMenuIds])];
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 树形配置
const treeFieldNames = {
  children: 'children',
  key: 'id',
  title: 'menuName',
};

// 处理选择变化
function handleCheck(checkedKeys: any, e: any) {
  // checkedKeys 可能是数组或对象
  let checked: number[] = [];
  if (Array.isArray(checkedKeys)) {
    checked = checkedKeys;
  } else if (checkedKeys.checked) {
    checked = checkedKeys.checked;
  }

  // 确保角色权限始终被选中
  const allChecked = [...new Set([...checked, ...disabledMenuIds.value])];
  selectedMenuIds.value = allChecked;
}

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.lock();
    try {
      // 只保存直接分配的权限（排除角色权限）
      const directMenuIds = selectedMenuIds.value.filter(
        (id) => !disabledMenuIds.value.includes(id),
      );
      await assignUserPermissionsApi(userData.value.id, directMenuIds);
      await modalApi.close();
      emit('success');
      message.success('权限分配成功');
    } catch (error) {
      console.error('权限分配失败:', error);
      message.error('权限分配失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      userData.value = undefined;
      menuTree.value = [];
      selectedMenuIds.value = [];
      disabledMenuIds.value = [];
      return;
    }

    const data = modalApi.getData();
    if (data) {
      userData.value = data;
      await loadData();
    }
  },
});

const modalTitle = computed(() => {
  return userData.value
    ? `分配权限 - ${userData.value.nickname || userData.value.username}`
    : '分配权限';
});
</script>

<template>
  <Modal :title="modalTitle" class="w-3/4">
    <div class="p-4">
      <Alert message="提示" type="info" show-icon class="mb-4">
        <template #description>
          <div>
            <p>灰色勾选的权限是通过角色/岗位获得的，不能取消。</p>
            <p>可以额外勾选其他权限作为直接分配的权限。</p>
          </div>
        </template>
      </Alert>

      <Spin :spinning="loading">
        <div v-if="menuTree.length > 0">
          <Tree
            v-model:checkedKeys="selectedMenuIds"
            checkable
            :tree-data="menuTree"
            :field-names="treeFieldNames"
            default-expand-all
            
            @check="handleCheck"
          >
            <template #title="{ id, menuName, disableCheckbox }">
              <span>
                {{ menuName }}
                <span v-if="disableCheckbox" class="ml-2 text-xs text-gray-400">
                  (角色权限)
                </span>
              </span>
            </template>
          </Tree>
        </div>
        <div v-else-if="!loading" class="py-8 text-center text-gray-500">
          暂无菜单数据
        </div>
      </Spin>
    </div>
  </Modal>
</template>
