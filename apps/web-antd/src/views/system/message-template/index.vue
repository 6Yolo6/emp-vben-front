<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTemplateApi,
  getTemplatePageApi,
  type MessageTemplateApi,
  updateStatusApi,
} from '#/api/sys/message-template';

import MessageTemplateFormModal from './components/MessageTemplateFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;
const ASwitch = Switch;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: MessageTemplateFormModal,
  destroyOnClose: true,
});

// 搜索条件
const searchForm = ref({
  templateCode: undefined as string | undefined,
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
function handleEdit(row: MessageTemplateApi.MessageTemplateVO) {
  formModalApi.setData(row).open();
}

/** 删除模板 */
async function handleDelete(row: MessageTemplateApi.MessageTemplateVO) {
  try {
    await deleteTemplateApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 切换状态 */
async function handleStatusChange(row: MessageTemplateApi.MessageTemplateVO, checked: boolean) {
  try {
    const status = checked ? 1 : 0;
    await updateStatusApi(row.id, status);
    message.success('状态更新成功');
    row.status = status;
  } catch (error) {
    console.error('状态更新失败:', error);
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1;
  }
}

/** 获取消息类型标签 */
function getMessageTypeTag(type: number) {
  const typeMap: Record<number, { text: string; color: string }> = {
    1: { text: '系统通知', color: 'blue' },
    2: { text: '业务消息', color: 'green' },
    3: { text: '预警消息', color: 'red' },
  };
  return typeMap[type] || { text: '未知', color: 'default' };
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
        title: '消息类型',
        field: 'templateType',
        width: 120,
        slots: { default: 'messageType' },
      },
      {
        title: '消息标题',
        field: 'titleTemplate',
        minWidth: 200,
      },
      {
        title: '版本',
        field: 'version',
        width: 80,
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
          const result = await getTemplatePageApi({
            templateCode: searchForm.value.templateCode,
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
    description="管理消息模板,支持模板变量替换"
    title="消息模板"
  >
    <FormModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleAdd">
            新增模板
          </AButton>
          <AButton @click="onRefresh">
            刷新
          </AButton>
        </ASpace>
      </template>

      <template #messageType="{ row }">
        <ATag :color="getMessageTypeTag(row.templateType).color">
          {{ getMessageTypeTag(row.templateType).text }}
        </ATag>
      </template>

      <template #status="{ row }">
        <ASwitch
          :checked="row.status === 1"
          checked-children="启用"
          un-checked-children="禁用"
          @change="(checked: boolean) => handleStatusChange(row, checked)"
        />
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
            <AButton danger size="small" type="link">
              删除
            </AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>
  </Page>
</template>
