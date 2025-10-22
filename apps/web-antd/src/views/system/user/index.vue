<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUserApi, getUserPageApi, updateUserStatusApi } from '#/api';

import AssignPostsModal from './components/AssignPostsModal.vue';
import AssignRolesModal from './components/AssignRolesModal.vue';
import ResetPasswordModal from './components/ResetPasswordModal.vue';
import UserFormModal from './components/UserFormModal.vue';
import { useGridColumns } from './data';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

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

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
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

/** 切换用户状态 */
async function handleToggleStatus(row: any) {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await updateUserStatusApi(row.id, newStatus);
    message.success('状态修改成功');
    onRefresh();
  } catch (error) {
    console.error('状态修改失败:', error);
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getUserPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });

          return {
            total: result.totalRow,
            items: result.records,
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    exportConfig: {},
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      zoom: true,
      slots: {
        buttons: 'toolbar-buttons',
      },
    },
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <RolesModal @success="onRefresh" />
    <PostsModal @success="onRefresh" />
    <PasswordModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <AButton type="primary" @click="handleCreate">新增用户</AButton>
      </template>
      <template #status="{ row }">
        <ATag
          :color="row.status === 1 ? 'success' : 'error'"
          style="cursor: pointer"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>
      <template #actions="{ row }">
        <ASpace :size="4">
          <AButton type="link" size="small" @click="handleEdit(row)">
            编辑
          </AButton>
          <AButton type="link" size="small" @click="handleResetPassword(row)">
            重置密码
          </AButton>
          <AButton type="link" size="small" @click="handleAssignRoles(row)">
            分配角色
          </AButton>
          <AButton type="link" size="small" @click="handleAssignPosts(row)">
            分配岗位
          </AButton>
          <APopconfirm
            title="确定要删除这个用户吗？"
            @confirm="handleDelete(row)"
          >
            <AButton type="link" size="small" danger>删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>
  </Page>
</template>
