<script setup lang="ts">
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'ant-design-vue';

const AButton = Button;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ASpace = Space;
const ATable = Table;
import {
  clearConfigCacheApi,
  deleteConfigApi,
  deleteConfigBatchApi,
  getConfigPageApi,
  refreshConfigCacheApi,
  type ConfigApi,
} from '#/api/sys/config';
import ConfigFormModal from './components/ConfigFormModal.vue';

defineOptions({
  name: 'SystemConfig',
});

// 查询表单
const queryForm = ref<ConfigApi.ConfigQueryDTO>({
  configName: undefined,
  configKey: undefined,
  configType: undefined,
  pageNum: 1,
  pageSize: 10,
});

// 表格数据
const tableData = ref<ConfigApi.ConfigVO[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedRowKeys = ref<number[]>([]);

// 表单弹窗
const formModalRef = ref();

// 表格列定义
const columns = [
  {
    type: 'selection',
    width: 50,
  },
  {
    title: '参数名称',
    key: 'configName',
    width: 200,
  },
  {
    title: '参数键名',
    key: 'configKey',
    width: 200,
  },
  {
    title: '参数键值',
    key: 'configValue',
    width: 200,
    ellipsis: true,
  },
  {
    title: '参数类型',
    key: 'configType',
    width: 100,
    customRender: ({ record }: { record: ConfigApi.ConfigVO }) => {
      return record.configType === 0 ? '系统内置' : '用户自定义';
    },
  },
  {
    title: '备注',
    key: 'remark',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await getConfigPageApi(queryForm.value);
    tableData.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

// 查询
function handleQuery() {
  queryForm.value.pageNum = 1;
  loadData();
}

// 重置
function handleReset() {
  queryForm.value = {
    configName: undefined,
    configKey: undefined,
    configType: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  loadData();
}

// 新增
function handleAdd() {
  formModalRef.value?.open();
}

// 编辑
function handleEdit(record: ConfigApi.ConfigVO) {
  formModalRef.value?.open(record.id);
}

// 删除
function handleDelete(record: ConfigApi.ConfigVO) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除参数"${record.configName}"吗？`,
    onOk: async () => {
      await deleteConfigApi(record.id);
      message.success('删除成功');
      loadData();
    },
  });
}

// 批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条数据吗？`,
    onOk: async () => {
      await deleteConfigBatchApi(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      loadData();
    },
  });
}

// 刷新缓存
function handleRefreshCache() {
  Modal.confirm({
    title: '确认刷新',
    content: '确定要刷新参数缓存吗？',
    onOk: async () => {
      await refreshConfigCacheApi();
      message.success('刷新成功');
    },
  });
}

// 清空缓存
function handleClearCache() {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空参数缓存吗？',
    onOk: async () => {
      await clearConfigCacheApi();
      message.success('清空成功');
    },
  });
}

// 表格选择变化
function handleSelectionChange(keys: number[]) {
  selectedRowKeys.value = keys;
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  queryForm.value.pageNum = page;
  queryForm.value.pageSize = pageSize;
  loadData();
}

// 初始化
loadData();
</script>

<template>
  <Page
    auto-content-height
    description="系统参数配置管理，支持参数的增删改查和缓存管理"
    title="系统参数配置"
  >
    <!-- 查询表单 -->
    <div class="bg-card border-border mb-4 rounded-lg border p-4 shadow-sm">
      <a-form layout="inline" :model="queryForm">
        <a-form-item label="参数名称">
          <a-input
            v-model:value="queryForm.configName"
            allow-clear
            placeholder="请输入参数名称"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="参数键名">
          <a-input
            v-model:value="queryForm.configKey"
            allow-clear
            placeholder="请输入参数键名"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="参数类型">
          <a-select
            v-model:value="queryForm.configType"
            allow-clear
            placeholder="请选择参数类型"
            style="width: 150px"
          >
            <a-select-option :value="0">系统内置</a-select-option>
            <a-select-option :value="1">用户自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between">
      <a-space>
        <a-button type="primary" @click="handleAdd">新增</a-button>
        <a-button danger @click="handleBatchDelete">批量删除</a-button>
        <a-button @click="handleRefreshCache">刷新缓存</a-button>
        <a-button danger @click="handleClearCache">清空缓存</a-button>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="{
        current: queryForm.pageNum,
        pageSize: queryForm.pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
      }"
      :row-key="(record: ConfigApi.ConfigVO) => record.id"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: handleSelectionChange,
      }"
      :scroll="{ x: 1200 }"
      @change="
        (pagination: any) =>
          handlePageChange(pagination.current, pagination.pageSize)
      "
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button size="small" type="link" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button
              danger
              size="small"
              type="link"
              @click="handleDelete(record)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 表单弹窗 -->
    <ConfigFormModal ref="formModalRef" @success="loadData" />
  </Page>
</template>
