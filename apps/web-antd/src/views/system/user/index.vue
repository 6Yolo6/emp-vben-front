<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
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
import { getDictDataByType, type DictApi } from '#/api/sys/dict';

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

// 状态选项 - 暂时使用硬编码，避免字典加载影响页面
const statusOptions = ref<Array<{ label: string; value: number | undefined }>>([
  { label: '全部', value: undefined },
  { label: '在职', value: 1 },
  { label: '辞职', value: 2 },
  { label: '调出', value: 3 },
  { label: '退休', value: 4 },
]);

// 状态字典映射 - 用于显示标签和颜色
const statusDict = ref<Map<number, DictApi.DictData>>(new Map());

// 加载状态字典
async function loadStatusDict() {
  try {
    const data = await getDictDataByType('sys_user_status');
    if (data && Array.isArray(data)) {
      // 构建状态选项
      statusOptions.value = [
        { label: '全部', value: undefined },
        ...data.map((item: DictApi.DictData) => ({
          label: item.dictLabel,
          value: Number(item.dictValue),
        })),
      ];

      // 构建状态字典映射
      data.forEach((item: DictApi.DictData) => {
        statusDict.value.set(Number(item.dictValue), item);
      });
    }
  } catch (error) {
    console.error('加载状态字典失败:', error);
    // 字典加载失败时使用默认值
    statusOptions.value = [
      { label: '全部', value: undefined },
      { label: '在职', value: 1 },
      { label: '辞职', value: 2 },
      { label: '调出', value: 3 },
      { label: '退休', value: 4 },
    ];
  }
}

// 获取状态标签
function getStatusLabel(status: number): string {
  return statusDict.value.get(status)?.dictLabel || '未知';
}

// 获取状态颜色
function getStatusColor(status: number): string {
  const item = statusDict.value.get(status);
  if (!item?.listClass) return 'default';

  // 映射字典颜色到 ant-design 的 tag 颜色
  const colorMap: Record<string, string> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    default: 'default',
    primary: 'blue',
  };

  return colorMap[item.listClass] || 'default';
}

// 页面加载时获取字典（不阻塞页面渲染）
// 暂时注释掉，避免影响其他页面
// onMounted(() => {
//   // 使用 setTimeout 确保不阻塞页面渲染
//   setTimeout(() => {
//     loadStatusDict();
//   }, 0);
// });

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
      :open="tenantSelectVisible"
      title="选择登录单位"
      @ok="handleTenantSelectOk"
      @cancel="handleTenantSelectCancel"
    >
      <div class="py-4">
        <p class="mb-4 text-sm text-gray-600">
          用户 "{{ selectedUser?.nickname || selectedUser?.username }}"
          属于多个单位，请选择要登录的单位：
        </p>
        <ARadioGroup :value="selectedTenantId" class="w-full">
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
    <div class="bg-card border-border mb-4 rounded border p-4">
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
        <ATag :color="getStatusColor(row.primaryStatus)">
          {{ getStatusLabel(row.primaryStatus) }}
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
