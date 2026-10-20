<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Switch, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteMailConfigApi,
  getMailConfigPageApi,
  type MailApi,
  testMailConfigApi,
} from '#/api/sys/mail';

import MailConfigFormModal from './components/MailConfigFormModal.vue';
import TestMailModal from './components/TestMailModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;
const ASwitch = Switch;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: MailConfigFormModal,
  destroyOnClose: true,
});

const [TestModal, testModalApi] = useVbenModal({
  connectedComponent: TestMailModal,
  destroyOnClose: true,
});

// 搜索条件
const searchForm = ref({
  configName: undefined as string | undefined,
  status: undefined as number | undefined,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 新增配置 */
function handleAdd() {
  formModalApi.open();
}

/** 编辑配置 */
function handleEdit(row: MailApi.MailConfigVO) {
  formModalApi.setData(row).open();
}

/** 删除配置 */
async function handleDelete(row: MailApi.MailConfigVO) {
  try {
    await deleteMailConfigApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 测试配置 */
function handleTest(row: MailApi.MailConfigVO) {
  testModalApi.setData(row).open();
}

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      {
        title: '配置名称',
        field: 'configName',
        minWidth: 150,
      },
      {
        title: 'SMTP服务器',
        field: 'smtpHost',
        minWidth: 150,
      },
      {
        title: '端口',
        field: 'smtpPort',
        width: 80,
      },
      {
        title: '用户名',
        field: 'username',
        minWidth: 150,
      },
      {
        title: '发件人名称',
        field: 'fromName',
        minWidth: 120,
      },
      {
        title: 'SSL',
        field: 'sslEnable',
        width: 80,
        slots: { default: 'sslEnable' },
      },
      {
        title: '默认配置',
        field: 'isDefault',
        width: 100,
        slots: { default: 'isDefault' },
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
        width: 220,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getMailConfigPageApi({
            configName: searchForm.value.configName,
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
    description="管理邮件服务器配置，支持多个SMTP配置"
    title="邮件配置"
  >
    <FormModal @success="onRefresh" />
    <TestModal @success="onRefresh" />

    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleAdd">
            新增配置
          </AButton>
          <AButton @click="onRefresh">
            刷新
          </AButton>
        </ASpace>
      </template>

      <template #sslEnable="{ row }">
        <ATag :color="row.sslEnable === 1 ? 'green' : 'default'">
          {{ row.sslEnable === 1 ? '启用' : '禁用' }}
        </ATag>
      </template>

      <template #isDefault="{ row }">
        <ATag :color="row.isDefault === 1 ? 'blue' : 'default'">
          {{ row.isDefault === 1 ? '是' : '否' }}
        </ATag>
      </template>

      <template #status="{ row }">
        <ATag :color="row.status === 1 ? 'success' : 'default'">
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>

      <template #action="{ row }">
        <ASpace>
          <AButton size="small" type="link" @click="handleTest(row)">
            测试
          </AButton>
          <AButton size="small" type="link" @click="handleEdit(row)">
            编辑
          </AButton>
          <APopconfirm
            title="确定要删除这个配置吗？"
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
