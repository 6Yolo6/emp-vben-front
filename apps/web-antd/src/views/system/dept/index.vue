<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Table, Tag } from 'ant-design-vue';

import { deleteDeptApi, getDeptTreeApi } from '#/api';

import DeptFormModal from './components/DeptFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATable = Table;
const ATag = Tag;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: DeptFormModal,
  destroyOnClose: true,
});

// 表格数据
const dataSource = ref([]);
const loading = ref(false);
const expandedKeys = ref<number[]>([]);

// 表格列配置
const columns = [
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName',
    width: 200,
  },
  {
    title: '负责人',
    dataIndex: 'leader',
    key: 'leader',
    width: 120,
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 150,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180,
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
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
    width: 200,
    fixed: 'right',
  },
];

/** 判断是否有子节点 */
function hasChildren(record: any) {
  return record.children && record.children.length > 0;
}

/** 加载数据 */
async function loadData() {
  try {
    loading.value = true;
    const result = await getDeptTreeApi();
    dataSource.value = result || [];
    // 默认展开所有节点
    expandedKeys.value = getAllKeys(dataSource.value);
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

/** 获取所有节点的 key */
function getAllKeys(data: any[]): number[] {
  const keys: number[] = [];
  function traverse(nodes: any[]) {
    nodes.forEach((node) => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  traverse(data);
  return keys;
}

/** 切换展开/收缩 */
function toggleExpand() {
  expandedKeys.value =
    expandedKeys.value.length > 0 ? [] : getAllKeys(dataSource.value);
}

/** 单个节点展开/收缩 */
function handleExpand(expanded: boolean, record: any) {
  if (expanded) {
    if (!expandedKeys.value.includes(record.id)) {
      expandedKeys.value.push(record.id);
    }
  } else {
    expandedKeys.value = expandedKeys.value.filter((key) => key !== record.id);
  }
}

/** 创建部门 */
function handleCreate() {
  formModalApi.open();
}

/** 添加下级部门 */
function handleAppend(row: any) {
  formModalApi.setData({ parentId: row.id }).open();
}

/** 编辑部门 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 删除部门 */
async function handleDelete(row: any) {
  try {
    await deleteDeptApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 初始化加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />

    <div class="p-4">
      <div class="mb-4 flex gap-2">
        <AButton type="primary" @click="handleCreate">新增部门</AButton>
        <AButton @click="toggleExpand">
          {{ expandedKeys.length > 0 ? '收缩全部' : '展开全部' }}
        </AButton>
      </div>

      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 1000 }"
        row-key="id"
        :expanded-row-keys="expandedKeys"
        @expand="handleExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <ATag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </ATag>
          </template>
          <template v-if="column.key === 'action'">
            <ASpace>
              <AButton type="link" size="small" @click="handleAppend(record)">
                新增下级
              </AButton>
              <AButton type="link" size="small" @click="handleEdit(record)">
                编辑
              </AButton>
              <APopconfirm
                title="确定要删除这个部门吗？"
                :disabled="hasChildren(record)"
                @confirm="handleDelete(record)"
              >
                <AButton
                  type="link"
                  size="small"
                  danger
                  :disabled="hasChildren(record)"
                >
                  删除
                </AButton>
              </APopconfirm>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>
  </Page>
</template>
