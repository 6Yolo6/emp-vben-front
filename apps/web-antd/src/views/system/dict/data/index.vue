<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { Alert, Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictData,
  getDictDataPage,
  type DictApi,
} from '#/api/sys/dict';

import DictDataFormModal from './components/DictDataFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;
const AAlert = Alert;

const route = useRoute();
const router = useRouter();

const dictType = ref<string>('');
const dictName = ref<string>('');

const pageTitle = computed(() => {
  return dictName.value ? `字典数据 - ${dictName.value}` : '字典数据';
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: DictDataFormModal,
  destroyOnClose: true,
  onOpenChange: (isOpen: boolean) => {
    if (isOpen) {
      // 传递 dictType 到表单
      formModalApi.setData({ dictType: dictType.value });
    }
  },
});

onMounted(() => {
  dictType.value = (route.query.dictType as string) || '';
  dictName.value = (route.query.dictName as string) || '';

  if (!dictType.value) {
    message.warning('缺少字典类型参数');
    router.push('/system/dict/type');
  }
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 新增 */
function handleCreate() {
  formModalApi.setData({ dictType: dictType.value }).open();
}

/** 编辑 */
function handleEdit(row: DictApi.DictData) {
  formModalApi.setData({ ...row, dictType: dictType.value }).open();
}

/** 删除 */
async function handleDelete(row: DictApi.DictData) {
  try {
    await deleteDictData(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 返回 */
function handleBack() {
  router.push('/system/dict/type');
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'seq', width: 60, title: '序号' },
      { field: 'dictSort', title: '排序', width: 80 },
      { field: 'dictLabel', title: '字典标签', minWidth: 120 },
      { field: 'dictValue', title: '字典键值', minWidth: 120 },
      {
        field: 'listClass',
        title: '样式预览',
        width: 120,
        slots: { default: 'listClass' },
      },
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
        width: 150,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getDictDataPage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            dictType: dictType.value,
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
    :description="`字典类型：${dictType}`"
    :title="pageTitle"
  >
    <template #extra>
      <AButton @click="handleBack">返回</AButton>
    </template>

    <Grid>
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleCreate">新增</AButton>
        </ASpace>
      </template>

      <template #listClass="{ row }">
        <ATag v-if="row.listClass" :color="row.listClass">
          {{ row.dictLabel }}
        </ATag>
        <span v-else>{{ row.dictLabel }}</span>
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
          <APopconfirm title="确定要删除吗？" @confirm="handleDelete(row)">
            <AButton danger size="small" type="link">删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>

    <FormModal @success="onRefresh" />
  </Page>
</template>
