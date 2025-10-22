<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, message, Popconfirm, Space, Table, Tag } from 'ant-design-vue';

import { deleteMenuApi, getMenuTreeApi } from '#/api';

import MenuFormModal from './components/MenuFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATable = Table;
const ATag = Tag;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: MenuFormModal,
  destroyOnClose: true,
});

// 表格数据
const dataSource = ref([]);
const loading = ref(false);
const expandedKeys = ref<number[]>([]);

// 表格列配置
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'menuName',
    key: 'name',
    width: 200,
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 80,
  },
  {
    title: '类型',
    dataIndex: 'menuType',
    key: 'menuType',
    width: 100,
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
    width: 80,
  },
  {
    title: '路由地址',
    dataIndex: 'path',
    key: 'path',
    width: 180,
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    key: 'component',
    width: 200,
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    key: 'permission',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '可见',
    dataIndex: 'visible',
    key: 'visible',
    width: 80,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
];

/** 获取类型颜色 */
function getTypeColor(type: number) {
  const colors = {
    M: 'blue',
    C: 'green',
    F: 'orange',
  };
  return colors[type] || 'default';
}

/** 获取类型文本 */
function getTypeText(type: number) {
  const texts = {
    M: '目录',
    C: '菜单',
    F: '按钮',
  };
  return texts[type] || '未知';
}

/** 加载数据 */
async function loadData() {
  try {
    loading.value = true;
    const result = await getMenuTreeApi();
    console.log(result);
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

/** 创建菜单 */
function handleCreate() {
  formModalApi.open();
}

/** 添加下级菜单 */
function handleAppend(row: any) {
  formModalApi.setData({ parentId: row.id }).open();
}

/** 编辑菜单 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 删除菜单 */
async function handleDelete(row: any) {
  try {
    await deleteMenuApi(row.id);
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
        <AButton type="primary" @click="handleCreate">新增菜单</AButton>
        <AButton @click="toggleExpand">
          {{ expandedKeys.length > 0 ? '收缩全部' : '展开全部' }}
        </AButton>
      </div>

      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 1200 }"
        row-key="id"
        :expanded-row-keys="expandedKeys"
        @expand="handleExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'menuName'">
            <div class="flex items-center gap-2">
              <IconifyIcon
                v-if="record.icon"
                :icon="record.icon"
                class="text-lg"
              />
              <span>{{ record.name }}</span>
            </div>
          </template>
          <template v-if="column.key === 'menuType'">
            <ATag :color="getTypeColor(record.menuType)">
              {{ getTypeText(record.menuType) }}
            </ATag>
          </template>
          <template v-if="column.key === 'status'">
            <ATag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </ATag>
          </template>
          <template v-if="column.key === 'visible'">
            <ATag :color="record.visible === 1 ? 'green' : 'red'">
              {{ record.visible === 1 ? '显示' : '隐藏' }}
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
                title="确定要删除这个菜单吗？"
                @confirm="handleDelete(record)"
              >
                <AButton type="link" size="small" danger>删除</AButton>
              </APopconfirm>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>
  </Page>
</template>
