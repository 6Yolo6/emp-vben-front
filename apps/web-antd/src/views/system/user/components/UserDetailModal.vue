<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Divider as ADivider,
  Tag as ATag,
  Collapse as ACollapse,
  CollapsePanel as ACollapsePanel,
  Empty as AEmpty,
  Spin as ASpin,
  Tree as ATree,
} from 'ant-design-vue';

import { getUserPermissionsApi } from '#/api/sys/user';

defineOptions({
  name: 'UserDetailModal',
});

const userDetail = ref<any>(null);
const userPermissions = ref<any>(null);
const permissionsLoading = ref(false);

// 加载用户权限信息
async function loadUserPermissions(userId: number) {
  try {
    permissionsLoading.value = true;
    const permissions = await getUserPermissionsApi(userId);
    userPermissions.value = permissions;
  } catch (error) {
    console.error('加载用户权限失败:', error);
  } finally {
    permissionsLoading.value = false;
  }
}

// Modal
const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      userDetail.value = null;
      userPermissions.value = null;
      return;
    }

    const data = modalApi.getData();
    if (data) {
      userDetail.value = data;
      console.log('用户详情:', userDetail.value);

      // 加载用户权限信息
      await loadUserPermissions(data.id);
    }
  },
});

// 获取状态标签颜色
function getStatusColor(status: number) {
  const colorMap: Record<number, string> = {
    1: 'green',
    2: 'orange',
    3: 'blue',
    4: 'gray',
  };
  return colorMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status: number) {
  const textMap: Record<number, string> = {
    1: '在职',
    2: '辞职',
    3: '调出',
    4: '退休',
  };
  return textMap[status] || '未知';
}

// 获取性别文本
function getSexText(sex: number) {
  const textMap: Record<number, string> = {
    0: '未知',
    1: '男',
    2: '女',
  };
  return textMap[sex] || '未知';
}

// 获取权限标签颜色
function getPermissionColor(sourceType: string) {
  const colorMap: Record<string, string> = {
    direct: 'orange', // 直接分配 - 橙色（优先级最高）
    post: 'green', // 岗位 - 绿色
    role: 'blue', // 角色 - 蓝色
  };
  return colorMap[sourceType] || 'default';
}

// 构建权限树
function buildPermissionTree(permissions: any[]) {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  // 创建一个 Map 来存储所有节点
  const nodeMap = new Map();
  const rootNodes: any[] = [];

  // 第一遍：创建所有节点
  permissions.forEach((perm) => {
    const node = {
      key: perm.menuId,
      title: perm.menuName,
      sourceType: perm.sourceType,
      sourceName: perm.sourceName,
      parentId: perm.parentId,
      orderNum: perm.orderNum || 0,
      children: [],
    };
    nodeMap.set(perm.menuId, node);
  });

  // 第二遍：构建树形结构
  permissions.forEach((perm) => {
    const node = nodeMap.get(perm.menuId);
    if (perm.parentId === 0 || perm.parentId === null) {
      // 根节点
      rootNodes.push(node);
    } else {
      // 子节点
      const parentNode = nodeMap.get(perm.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // 如果找不到父节点，作为根节点
        rootNodes.push(node);
      }
    }
  });

  // 排序：按 orderNum 排序
  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => a.orderNum - b.orderNum);
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };
  sortNodes(rootNodes);

  return rootNodes;
}
</script>

<template>
  <Modal title="用户详情" class="w-3/4" :footer="null">
    <div v-if="userDetail" class="p-4">
      <!-- 基本信息 -->
      <div class="mb-6">
        <h3 class="mb-4 text-lg font-medium">基本信息</h3>
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="用户名">
            {{ userDetail.username }}
          </a-descriptions-item>
          <a-descriptions-item label="昵称">
            {{ userDetail.nickname }}
          </a-descriptions-item>
          <a-descriptions-item label="邮箱">
            {{ userDetail.email || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号">
            {{ userDetail.mobile || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="性别">
            {{ getSexText(userDetail.sex) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ userDetail.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">
            {{ userDetail.remark || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <a-divider />

      <!-- 单位信息 -->
      <div class="mb-6">
        <h3 class="mb-4 text-lg font-medium">单位信息</h3>
        <div v-if="userDetail.tenants && userDetail.tenants.length > 0">
          <a-collapse>
            <a-collapse-panel
              v-for="(tenant, index) in userDetail.tenants"
              :key="index"
              :header="`${tenant.tenantName}${tenant.isPrimary ? ' (主单位)' : ''}`"
            >
              <a-descriptions bordered :column="2" size="small">
                <a-descriptions-item label="单位名称">
                  {{ tenant.tenantName }}
                  <a-tag v-if="tenant.isPrimary" color="blue" class="ml-2">
                    主单位
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="状态">
                  <a-tag :color="getStatusColor(tenant.status)">
                    {{ getStatusText(tenant.status) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="部门">
                  {{ tenant.deptName || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="岗位">
                  <span v-if="tenant.postNames && tenant.postNames.length > 0">
                    <a-tag
                      v-for="(postName, pIndex) in tenant.postNames"
                      :key="pIndex"
                      class="mb-1"
                    >
                      {{ postName }}
                    </a-tag>
                  </span>
                  <span v-else>-</span>
                </a-descriptions-item>
                <a-descriptions-item label="主岗位" :span="2">
                  {{ tenant.mainPostName || '-' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <a-empty v-else description="暂无单位信息" />
      </div>

      <a-divider />

      <!-- 权限信息 -->
      <div class="mb-6">
        <h3 class="mb-4 text-lg font-medium">权限信息</h3>
        <a-spin :spinning="permissionsLoading">
          <div v-if="userPermissions && userPermissions.permissions">
            <div v-if="userPermissions.permissions.length > 0">
              <a-tree
                :tree-data="buildPermissionTree(userPermissions.permissions)"
                :field-names="{ key: 'key', title: 'title', children: 'children' }"
                default-expand-all
              >
                <template #title="{ title, sourceType, sourceName }">
                  <span>
                    {{ title }}
                    <a-tag
                      :color="getPermissionColor(sourceType)"
                      class="ml-2"
                      size="small"
                    >
                      {{ sourceName }}
                    </a-tag>
                  </span>
                </template>
              </a-tree>
            </div>
            <a-empty v-else description="暂无权限" size="small" />
          </div>
          <div v-else class="rounded border border-gray-200 bg-gray-50 p-4">
            <p class="text-sm text-gray-500">权限信息加载中...</p>
          </div>
        </a-spin>
      </div>
    </div>
    <a-empty v-else description="暂无数据" />
  </Modal>
</template>
