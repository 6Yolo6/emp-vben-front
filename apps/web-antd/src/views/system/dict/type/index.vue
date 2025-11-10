<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictType,
  getDictTypePage,
  refreshDictCache,
  type DictApi,
} from '#/api/sys/dict';

import DictTypeFormModal from './components/DictTypeFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

const router = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: DictTypeFormModal,
  destroyOnClose: true,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 新增 */
function handleCreate() {
  formModalApi.open();
}

/** 编辑 */
function handleEdit(row: DictApi.DictType) {
  formModalApi.setData(row).open();
}

/** 删除 */
async function handleDelete(row: DictApi.DictType) {
  try {
    await deleteDictType(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 查看字典数据 */
function handleViewData(row: DictApi.DictType) {
  router.push({
    path: '/system/dict/data',
    query: { dictType: row.dictType, dictName: row.dictName },
  });
}

/** 刷新缓存 */
async function handleRefreshCache() {
  try {
    await refreshDictCache();
    message.success('缓存刷新成功');
  } catch (error) {
    console.error('缓存刷新失败:', error);
    message.error('缓存刷新失败');
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'seq', width: 60, title: '序号' },
      { field: 'dictName', title: '字典名称', minWidth: 150 },
      { field: 'dictType', title: '字典类型', minWidth: 150 },
      {
        field: 'status',
        title: '状态',
        width: 100,
        slots: { default: 'status' },
      },
      { field: 'remark', title: '备注', minWidth: 200 },
      {
        field: 'createTime',
        title: '创建时间',
        width: 180,
        formatter: ({ cellValue }) => {
          if (!cellValue) return '';
          return cellValue.replace('T', ' ').slice(0, 19);
        },
      },
      {
        field: 'action',
        title: '操作',
        width: 220,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getDictTypePage({
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
  <Page
    auto-content-height
    description="字典类型管理，用于维护系统字典分类"
    title="字典类型"
  >
    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleCreate">新增</AButton>
          <AButton @click="handleRefreshCache">刷新缓存</AButton>
        </ASpace>
      </template>

      <template #status="{ row }">
        <ATag :color="row.status === 1 ? 'success' : 'error'">
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>

      <template #action="{ row }">
        <ASpace>
          <AButton size="small" type="link" @click="handleEdit(row)">
            编辑
          </AButton>
          <AButton size="small" type="link" @click="handleViewData(row)">
            字典数据
          </AButton>
          <APopconfirm title="确定要删除吗？" @confirm="handleDelete(row)">
            <AButton danger size="small" type="link">删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>

    <FormModal @success="onRefresh" />
  </Page>
</template>
