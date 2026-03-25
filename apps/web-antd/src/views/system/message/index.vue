<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchMarkAsReadApi,
  deleteMessageApi,
  getMyMessagePageApi,
  markAsReadApi,
  getMessageByIdApi,
  type MessageApi,
} from '#/api/sys/message';

import MessageDetailModal from './components/MessageDetailModal.vue';
import MessageSendModal from './components/MessageSendModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

const route = useRoute();

const [SendModal, sendModalApi] = useVbenModal({
  connectedComponent: MessageSendModal,
  destroyOnClose: true,
});

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: MessageDetailModal,
  destroyOnClose: true,
});

// 搜索条件
const searchForm = ref({
  isRead: undefined as number | undefined,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 发送消息 */
function handleSend() {
  sendModalApi.open();
}

/** 查看详情 */
async function handleView(row: MessageApi.MessageVO) {
  detailModalApi.setData(row).open();

  // 如果未读，标记为已读
  if (row.isRead === 0) {
    await markAsReadApi(row.id);
    onRefresh();
  }
}

async function loadData() {
  try {
    const messageId = route.query.messageId;
    if (messageId) {
      const message = await getMessageByIdApi(messageId);
      detailModalApi.setData(message).open();
    }
  } catch {
    message.error('加载数据失败');
  }
}

// 可以通过API直接获取消息详情
onMounted(() => {
  loadData();
});

/** 批量标记已读 */
async function handleBatchMarkRead() {
  const records = gridApi.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请选择要标记的消息');
    return;
  }

  try {
    const ids = records.map((r: MessageApi.MessageVO) => r.id);
    await batchMarkAsReadApi(ids);
    message.success('批量标记成功');
    onRefresh();
  } catch (error) {
    console.error('批量标记失败:', error);
  }
}

/** 删除消息 */
async function handleDelete(row: MessageApi.MessageVO) {
  try {
    await deleteMessageApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
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

/** 双击行查看详情 */
function handleRowDblClick(params: any) {
  console.log('双击事件参数:', params);
  // VxeTable 的 cell-dblclick 事件参数格式
  const row = params.row || params;
  handleView(row);
}

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'checkbox', width: 50 },
      {
        title: '消息标题',
        field: 'title',
        minWidth: 200,
      },
      {
        title: '消息内容',
        field: 'content',
        minWidth: 600,
      },
      {
        title: '消息类型',
        field: 'messageType',
        width: 120,
        slots: { default: 'messageType' },
      },
      {
        title: '发送人',
        field: 'senderName',
        width: 120,
      },
      {
        title: '状态',
        field: 'isRead',
        width: 100,
        slots: { default: 'isRead' },
      },
      {
        title: '发送时间',
        field: 'createTime',
        width: 180,
        formatter: ({ cellValue }) => {
          if (!cellValue) return '';
          return cellValue.replace('T', ' ').slice(0, 19);
        },
      },
      {
        title: '操作',
        field: 'action',
        width: 200,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    keepSource: true,
    // 添加双击事件监听
    onCellDblclick: handleRowDblClick,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getMyMessagePageApi({
            isRead: searchForm.value.isRead,
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
  <Page auto-content-height description="查看和管理站内消息" title="站内消息">
    <SendModal @success="onRefresh" />
    <DetailModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleSend"> 发送消息 </AButton>
          <AButton @click="handleBatchMarkRead"> 批量标记已读 </AButton>
          <AButton @click="onRefresh"> 刷新 </AButton>
        </ASpace>
      </template>

      <template #messageType="{ row }">
        <ATag :color="getMessageTypeTag(row.messageType).color">
          {{ getMessageTypeTag(row.messageType).text }}
        </ATag>
      </template>

      <template #isRead="{ row }">
        <ATag :color="row.isRead === 1 ? 'success' : 'warning'">
          {{ row.isRead === 1 ? '已读' : '未读' }}
        </ATag>
      </template>

      <template #action="{ row }">
        <ASpace>
          <AButton size="small" type="link" @click="handleView(row)">
            查看
          </AButton>
          <APopconfirm
            title="确定要删除这条消息吗？"
            @confirm="handleDelete(row)"
          >
            <AButton danger size="small" type="link"> 删除 </AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>
  </Page>
</template>
