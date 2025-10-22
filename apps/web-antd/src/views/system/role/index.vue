<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Popconfirm, Space, Table, Tag } from 'ant-design-vue';

import { deleteRoleApi, getRolePageApi } from '#/api';

import AssignCustomDeptsModal from './components/AssignCustomDeptsModal.vue';
import AssignPermissionsModal from './components/AssignPermissionsModal.vue';
import RoleFormModal from './components/RoleFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATable = Table;
const ATag = Tag;

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: RoleFormModal,
  destroyOnClose: true,
});

const [PermissionModal, permissionModalApi] = useVbenModal({
  connectedComponent: AssignPermissionsModal,
  destroyOnClose: true,
});

const [CustomDeptsModal, customDeptsModalApi] = useVbenModal({
  connectedComponent: AssignCustomDeptsModal,
  destroyOnClose: true,
});

// 表格数据
const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 150,
  },
  {
    title: '角色标识',
    dataIndex: 'roleKey',
    key: 'roleKey',
    width: 150,
  },
  {
    title: '显示顺序',
    dataIndex: 'roleSort',
    key: 'roleSort',
    width: 100,
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
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  },
  {
    title: '操作',
    key: 'action',
    width: 260,
    fixed: 'right',
  },
];

/** 加载数据 */
async function loadData() {
  try {
    loading.value = true;
    const result = await getRolePageApi({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });

    dataSource.value = result.records || [];
    pagination.value.total = result.totalRow || 0;
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

/** 分页变化 */
function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

/** 创建角色 */
function handleCreate() {
  formModalApi.open();
}

/** 编辑角色 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 删除角色 */
async function handleDelete(row: any) {
  try {
    await deleteRoleApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 分配权限 */
function handleAssignPermissions(row: any) {
  permissionModalApi.setData(row).open();
}

/** 分配自定义部门 */
function handleAssignCustomDepts(row: any) {
  customDeptsModalApi.setData(row).open();
}

// 初始化加载数据
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <PermissionModal @success="onRefresh" />
    <CustomDeptsModal @success="onRefresh" />

    <div class="p-4">
      <div class="mb-4">
        <AButton type="primary" @click="handleCreate"> 新增角色 </AButton>
      </div>

      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1000 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <ATag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '停用' }}
            </ATag>
          </template>
          <template v-if="column.key === 'action'">
            <ASpace>
              <AButton type="link" size="small" @click="handleEdit(record)">
                编辑
              </AButton>
              <AButton
                type="link"
                size="small"
                @click="handleAssignPermissions(record)"
              >
                分配权限
              </AButton>
              <AButton
                v-if="record.dataScope === 5"
                type="link"
                size="small"
                @click="handleAssignCustomDepts(record)"
              >
                自定义部门
              </AButton>
              <APopconfirm
                title="确定要删除这个角色吗？"
                @confirm="handleDelete(record)"
              >
                <AButton type="link" size="small" danger> 删除 </AButton>
              </APopconfirm>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>
  </Page>
</template>
