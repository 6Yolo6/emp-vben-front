/* */
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Table } from 'ant-design-vue';

import { deleteUserApi, getUserPageApi } from '#/api';

import AssignPostsModal from './components/AssignPostsModal.vue';
import AssignRolesModal from './components/AssignRolesModal.vue';
import ResetPasswordModal from './components/ResetPasswordModal.vue';
import UserFormModal from './components/UserFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATable = Table;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: UserFormModal,
  destroyOnClose: true,
});

const [RolesModal, rolesModalApi] = useVbenModal({
  connectedComponent: AssignRolesModal,
  destroyOnClose: true,
});

const [PostsModal, postsModalApi] = useVbenModal({
  connectedComponent: AssignPostsModal,
  destroyOnClose: true,
});

const [PasswordModal, passwordModalApi] = useVbenModal({
  connectedComponent: ResetPasswordModal,
  destroyOnClose: true,
});

// 表格数据
const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 120,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180,
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    customRender: ({ text }: any) => (text === 1 ? '正常' : '停用'),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
  },
];

/** 加载数据 */
async function loadData() {
  try {
    loading.value = true;
    const result = await getUserPageApi({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });

    dataSource.value = result.list || [];
    pagination.value.total = result.total || 0;
  } catch {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

/** 刷新表格 */
function onRefresh() {
  loadData();
}

/** 分页变化 */
function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

/** 创建用户 */
function handleCreate() {
  formModalApi.open();
}

/** 编辑用户 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 删除用户 */
async function handleDelete(row: any) {
  try {
    await deleteUserApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 分配角色 */
function handleAssignRoles(row: any) {
  rolesModalApi.setData(row).open();
}

/** 分配岗位 */
function handleAssignPosts(row: any) {
  postsModalApi.setData(row).open();
}

/** 重置密码 */
function handleResetPassword(row: any) {
  passwordModalApi.setData(row).open();
}

// 初始化加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <RolesModal @success="onRefresh" />
    <PostsModal @success="onRefresh" />
    <PasswordModal @success="onRefresh" />

    <div class="p-4">
      <div class="mb-4">
        <AButton type="primary" @click="handleCreate"> 新增用户 </AButton>
      </div>

      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <ASpace>
              <AButton type="link" size="small" @click="handleEdit(record)">
                编辑
              </AButton>
              <AButton
                type="link"
                size="small"
                @click="handleResetPassword(record)"
              >
                重置密码
              </AButton>
              <AButton
                type="link"
                size="small"
                @click="handleAssignRoles(record)"
              >
                分配角色
              </AButton>
              <AButton
                type="link"
                size="small"
                @click="handleAssignPosts(record)"
              >
                分配岗位
              </AButton>
              <APopconfirm
                title="确定要删除这个用户吗？"
                @confirm="handleDelete(record)"
              >
                <AButton type="link" size="small" danger> 删除 </AButton>
              </APopconfirm>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>
  </Page>
</template>
