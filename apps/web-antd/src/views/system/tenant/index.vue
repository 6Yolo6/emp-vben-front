<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';
import { Button, message, Popconfirm, Tag } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTenantApi,
  getTenantPageApi,
  updateTenantStatusApi,
} from '#/api/sys/tenant';
import TenantFormModal from './components/TenantFormModal.vue';
import { useGridColumns } from './data';

const AButton = Button;
const APopconfirm = Popconfirm;
const ATag = Tag;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: TenantFormModal,
  destroyOnClose: true,
});

function onRefresh() {
  gridApi.query();
}

function handleCreate() {
  formModalApi.open();
}

function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

async function handleDelete(row: any) {
  try {
    await deleteTenantApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

async function handleToggleStatus(row: any) {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await updateTenantStatusApi(row.id, newStatus);
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
          const result = await getTenantPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });
          return {
            total: result.totalRow || 0,
            items: result.records || [],
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
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
  <Page
    auto-content-height
    description="管理系统租户信息，包括租户的创建、编辑、删除和状态管理"
    title="租户管理"
  >
    <FormModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <AButton type="primary" @click="handleCreate">新增租户</AButton>
      </template>

      <template #action="{ row }">
        <AButton size="small" type="link" @click="handleEdit(row)">
          编辑
        </AButton>
        <AButton size="small" type="link" @click="handleToggleStatus(row)">
          {{ row.status === 1 ? '停用' : '启用' }}
        </AButton>
        <APopconfirm
          cancel-text="取消"
          ok-text="确定"
          title="确定要删除这个租户吗？"
          @confirm="handleDelete(row)"
        >
          <AButton danger size="small" type="link">删除</AButton>
        </APopconfirm>
      </template>

      <template #status="{ row }">
        <ATag :color="row.status === 1 ? 'success' : 'error'">
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>
    </Grid>
  </Page>
</template>
