<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { message } from 'ant-design-vue';

import { deleteUserApi, getUserPageApi } from '#/api';

import AssignPostsModal from './components/AssignPostsModal.vue';
import AssignRolesModal from './components/AssignRolesModal.vue';
import UserFormModal from './components/UserFormModal.vue';

const loading = ref(false);
const dataSource = ref<any[]>([]);
const formVisible = ref(false);
const rolesVisible = ref(false);
const postsVisible = ref(false);
const currentUserId = ref<number>();

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
];

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const result = await getUserPageApi({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    console.log('API 返回数据:', result);
    dataSource.value = result.records || [];
    console.log(dataSource.value);
    pagination.value.total = result.totalRow || 0;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

// 新增用户
function handleAdd() {
  currentUserId.value = undefined;
  formVisible.value = true;
}

// 编辑用户
function handleEdit(record: any) {
  currentUserId.value = record.id;
  formVisible.value = true;
}

// 删除用户
async function handleDelete(record: any) {
  try {
    await deleteUserApi(record.id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 分配角色
function handleAssignRoles(record: any) {
  currentUserId.value = record.id;
  rolesVisible.value = true;
}

// 分配岗位
function handleAssignPosts(record: any) {
  currentUserId.value = record.id;
  postsVisible.value = true;
}

// 操作成功回调
function handleSuccess() {
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold">用户管理</h2>
        <p class="text-sm text-gray-500">
          管理系统用户信息，包括用户的创建、编辑、删除以及角色和岗位分配
        </p>
      </div>
      <a-button type="primary" @click="handleAdd"> 新增用户 </a-button>
    </div>

    <div class="rounded bg-white p-4">
      <div class="mb-2 text-sm text-gray-600">
        数据加载状态: {{ loading ? '加载中...' : '已加载' }} | 数据条数:
        {{ dataSource.length }}
      </div>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        bordered
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleAssignRoles(record)"
              >
                分配角色
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="handleAssignPosts(record)"
              >
                分配岗位
              </a-button>
              <a-popconfirm
                title="确定要删除这个用户吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
      </a-table>
    </div>

    <!-- 用户表单弹窗 -->
    <UserFormModal
      :visible="formVisible"
      :user-id="currentUserId"
      @update:visible="formVisible = $event"
      @success="handleSuccess"
    />

    <!-- 分配角色弹窗 -->
    <AssignRolesModal
      :visible="rolesVisible"
      :user-id="currentUserId"
      @update:visible="rolesVisible = $event"
      @success="handleSuccess"
    />

    <!-- 分配岗位弹窗 -->
    <AssignPostsModal
      :visible="postsVisible"
      :user-id="currentUserId"
      @update:visible="postsVisible = $event"
      @success="handleSuccess"
    />
  </div>
</template>
