<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useAccessStore, useUserStore } from '@vben/stores';

import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUserApi,
  getUserDetailApi,
  getUserPageApi,
  getUserTenantListApi,
  switchToUserApi,
  updateUserStatusApi,
} from '#/api';

import AssignUserPermissionsModal from './components/AssignUserPermissionsModal.vue';
import ResetPasswordModal from './components/ResetPasswordModal.vue';
import UserDetailModal from './components/UserDetailModal.vue';
import UserFormModal from './components/UserFormModal.vue';
import { useGridColumns } from './data';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ARadioGroup = RadioGroup;
const ARadio = Radio;

const router = useRouter();
const userStore = useUserStore();
const accessStore = useAccessStore();

// 判断当前用户是否是管理员
const isAdmin = computed(() => {
  return userStore.userInfo?.username === 'admin';
});

// 租户选择相关
const tenantSelectVisible = ref(false);
const selectedUser = ref<any>(null);
const userTenants = ref<any[]>([]);
const selectedTenantId = ref<number | null>(null);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: UserFormModal,
  destroyOnClose: true,
});

const [PasswordModal, passwordModalApi] = useVbenModal({
  connectedComponent: ResetPasswordModal,
  destroyOnClose: true,
});

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: UserDetailModal,
  destroyOnClose: true,
});

const [PermissionModal, permissionModalApi] = useVbenModal({
  connectedComponent: AssignUserPermissionsModal,
  destroyOnClose: true,
});

// 搜索表单
const searchForm = ref({
  username: '',
  nickName: '',
  phoneNumber: '',
  status: undefined as number | undefined,
});

// 状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '在职', value: 1 },
  { label: '辞职', value: 2 },
  { label: '调出', value: 3 },
  { label: '退休', value: 4 },
];

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 搜索 */
function handleSearch() {
  gridApi.query();
}

/** 重置搜索 */
function handleReset() {
  searchForm.value = {
    username: '',
    nickName: '',
    phoneNumber: '',
    status: undefined,
  };
  gridApi.query();
}

/** 创建用户 */
function handleCreate() {
  formModalApi.open();
}

/** 编辑用户 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 查看用户详情 */
async function handleViewDetail(row: any) {
  try {
    // 调用API获取完整的用户详情（包含单位信息）
    const userDetail = await getUserDetailApi(row.id);
    detailModalApi.setData(userDetail).open();
  } catch (error) {
    console.error('获取用户详情失败:', error);
    message.error('获取用户详情失败');
  }
}

/** 双击行查看详情 */
function handleRowDblClick(params: any) {
  console.log('双击事件参数:', params);
  // VxeTable 的 cell-dblclick 事件参数格式
  const row = params.row || params;
  handleViewDetail(row);
}

/** 删除用户 */
async function handleDelete(row: any) {
  try {
    await deleteUserApi(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}

/** 重置密码 */
function handleResetPassword(row: any) {
  passwordModalApi.setData(row).open();
}

/** 分配权限 */
function handleAssignPermissions(row: any) {
  permissionModalApi.setData(row).open();
}

/** 切换到该用户 */
async function handleSwitchToUser(row: any) {
  try {
    // 获取用户的租户列表
    const tenants = await getUserTenantListApi(row.id);

    if (!tenants || tenants.length === 0) {
      message.error('该用户没有关联任何单位');
      return;
    }

    if (tenants.length === 1) {
      // 只有一个租户，直接切换
      confirmSwitchToUser(row, tenants[0].tenantId);
    } else {
      // 多个租户，显示选择弹窗
      selectedUser.value = row;
      userTenants.value = tenants;
      // 默认选择主租户
      const primaryTenant = tenants.find((t) => t.isPrimary);
      selectedTenantId.value = primaryTenant
        ? primaryTenant.tenantId
        : tenants[0].tenantId;
      tenantSelectVisible.value = true;
    }
  } catch (error) {
    console.error('获取用户租户列表失败:', error);
    message.error('获取用户单位信息失败');
  }
}

/** 确认切换到用户 */
function confirmSwitchToUser(user: any, tenantId: number) {
  const tenantName =
    userTenants.value.find((t) => t.tenantId === tenantId)?.tenantName ||
    '未知单位';

  Modal.confirm({
    title: '切换用户确认',
    content: `确定要切换到用户 "${user.nickname || user.username}" 的 "${tenantName}" 单位吗？切换后您将以该用户身份登录系统。`,
    okText: '确定切换',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await switchToUserApi(user.id, tenantId);

        // 更新 token
        if (result.accessToken) {
          accessStore.setAccessToken(result.accessToken);
        }

        // 更新用户信息
        if (result.userInfo) {
          userStore.setUserInfo(result.userInfo);
        }

        message.success(
          `已切换到用户: ${user.nickname || user.username} (${tenantName})`,
        );

        // 刷新页面以重新加载用户信息和权限
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error('切换用户失败:', error);
        message.error('切换用户失败');
      }
    },
  });
}

/** 确认租户选择 */
function handleTenantSelectOk() {
  if (!selectedTenantId.value) {
    message.warning('请选择要登录的单位');
    return;
  }

  tenantSelectVisible.value = false;
  confirmSwitchToUser(selectedUser.value, selectedTenantId.value);
}

/** 取消租户选择 */
function handleTenantSelectCancel() {
  tenantSelectVisible.value = false;
  selectedUser.value = null;
  userTenants.value = [];
  selectedTenantId.value = null;
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    // 添加双击事件监听
    onCellDblclick: handleRowDblClick,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getUserPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...searchForm.value,
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
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <PasswordModal @success="onRefresh" />
    <DetailModal />
    <PermissionModal @success="onRefresh" />

    <!-- 租户选择弹窗 -->
    <Modal
      v-model:open="tenantSelectVisible"
      title="选择登录单位"
      @ok="handleTenantSelectOk"
      @cancel="handleTenantSelectCancel"
    >
      <div class="py-4">
        <p class="mb-4 text-sm text-gray-600">
          用户 "{{ selectedUser?.nickname || selectedUser?.username }}"
          属于多个单位，请选择要登录的单位：
        </p>
        <ARadioGroup v-model:value="selectedTenantId" class="w-full">
          <div
            v-for="tenant in userTenants"
            :key="tenant.tenantId"
            class="mb-2"
          >
            <ARadio :value="tenant.tenantId">
              <span class="font-medium">{{ tenant.tenantName }}</span>
              <Tag v-if="tenant.isPrimary" color="blue" class="ml-2"
                >主单位</Tag
              >
              <span class="ml-2 text-xs text-gray-500">
                {{
                  tenant.status === 1
                    ? '在职'
                    : tenant.status === 2
                      ? '辞职'
                      : tenant.status === 3
                        ? '调出'
                        : '退休'
                }}
              </span>
            </ARadio>
          </div>
        </ARadioGroup>
      </div>
    </Modal>

    <!-- 搜索表单 -->
    <div class="mb-4 rounded bg-white p-4">
      <AForm layout="inline">
        <AFormItem label="用户名">
          <AInput
            :value="searchForm.username"
            placeholder="请输入用户名"
            allow-clear
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </AFormItem>
        <AFormItem label="昵称">
          <AInput
            :value="searchForm.nickName"
            placeholder="请输入昵称"
            allow-clear
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </AFormItem>
        <AFormItem label="手机号">
          <AInput
            :value="searchForm.phoneNumber"
            placeholder="请输入手机号"
            allow-clear
            style="width: 200px"
            @press-enter="handleSearch"
          />
        </AFormItem>
        <AFormItem label="状态">
          <ASelect
            :value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <ASelectOption
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem>
          <ASpace>
            <AButton type="primary" @click="handleSearch">搜索</AButton>
            <AButton @click="handleReset">重置</AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </div>

    <Grid>
      <template #toolbar-buttons>
        <AButton type="primary" @click="handleCreate">新增用户</AButton>
      </template>
      <template #status="{ row }">
        <ATag
          :color="
            row.primaryStatus === 1
              ? 'success'
              : row.primaryStatus === 2
                ? 'warning'
                : row.primaryStatus === 3
                  ? 'processing'
                  : 'default'
          "
        >
          {{
            row.primaryStatus === 1
              ? '在职'
              : row.primaryStatus === 2
                ? '辞职'
                : row.primaryStatus === 3
                  ? '调出'
                  : row.primaryStatus === 4
                    ? '退休'
                    : '未知'
          }}
        </ATag>
      </template>
      <template #actions="{ row }">
        <ASpace :size="4">
          <AButton type="link" size="small" @click="handleViewDetail(row)">
            查看
          </AButton>
          <AButton type="link" size="small" @click="handleEdit(row)">
            编辑
          </AButton>
          <AButton
            type="link"
            size="small"
            @click="handleAssignPermissions(row)"
          >
            分配权限
          </AButton>
          <AButton type="link" size="small" @click="handleResetPassword(row)">
            重置密码
          </AButton>
          <AButton
            v-if="isAdmin && row.username !== 'admin'"
            type="link"
            size="small"
            @click="handleSwitchToUser(row)"
          >
            登录为该用户
          </AButton>
          <APopconfirm
            title="确定要删除这个用户吗？"
            @confirm="handleDelete(row)"
          >
            <AButton type="link" size="small" danger>删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>
  </Page>
</template>
