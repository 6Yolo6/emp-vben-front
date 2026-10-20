<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMailTemplateApi,
  getMailTemplatePageApi,
  type MailApi,
} from '#/api/sys/mail';

import MailTemplateFormModal from './components/MailTemplateFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: MailTemplateFormModal,
  destroyOnClose: true,
});

// 搜索条件
const searchForm = ref({
  templateName: undefined as string | undefined,
  status: undefined as number | undefined,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 新增模板 */
function handleAdd() {
  formModalApi.open();
}

/** 编辑模板 */
function handleEdit(row: MailApi.MailTemplateVO) {
  formModalApi.setData(row).open();
}

/** 删除模板 */
async function handleDelete(row: MailApi.MailTemplateVO) {
  try {
    await deleteMailTemplateApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      {
        title: '模板编码',
        field: 'templateCode',
        minWidth: 150,
      },
      {
        title: '模板名称',
        field: 'templateName',
        minWidth: 150,
      },
      {
        title: '邮件主题',
        field: 'subject',
        minWidth: 200,
      },
      {
        title: '模板类型',
        field: 'templateType',
        width: 100,
        slots: { default: 'templateType' },
      },
      {
        title: '模板变量',
        field: 'variables',
        minWidth: 150,
      },
      {
        title: '状态',
        field: 'status',
        width: 100,
        slots: { default: 'status' },
      },
      {
        title: '创建时间',
        field: 'createTime',
        width: 180,
      },
      {
        title: '操作',
        field: 'action',
        width: 180,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getMailTemplatePageApi({
            templateName: searchForm.value.templateName,
            status: searchForm.value.status,
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
    description="管理邮件模板，支持HTML和纯文本格式"
    title="邮件模板"
  >
    <FormModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleAdd"> 新增模板 </AButton>
          <AButton @click="onRefresh"> 刷新 </AButton>
        </ASpace>
      </template>

      <template #templateType="{ row }">
        <ATag :color="row.templateType === 1 ? 'blue' : 'default'">
          {{ row.templateType === 1 ? 'HTML' : '纯文本' }}
        </ATag>
      </template>

      <template #status="{ row }">
        <ATag :color="row.status === 1 ? 'success' : 'default'">
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>

      <template #action="{ row }">
        <ASpace>
          <AButton size="small" type="link" @click="handleEdit(row)">
            编辑
          </AButton>
          <APopconfirm
            title="确定要删除这个模板吗？"
            @confirm="handleDelete(row)"
          >
            <AButton danger size="small" type="link"> 删除 </AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>
  </Page>
</template>
