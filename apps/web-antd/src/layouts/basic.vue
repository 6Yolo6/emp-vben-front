<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, MdiGithub } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  MenuItem,
  MenuDivider,
  message,
} from 'ant-design-vue';

const AButton = Button;
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = MenuItem;

import { $t } from '#/locales';
import {
  switchTenantApi,
  getUserTenantsApi,
  switchBackToOriginalApi,
} from '#/api';
import {
  getMyMessagePageApi,
  batchMarkAsReadApi,
  markAsReadApi,
} from '#/api/sys/message';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';
import { useMessageNotification, unreadCount } from '#/composables/useMessageNotification';

const notifications = ref<NotificationItem[]>([]);

// 使用消息通知 composable
const { refreshUnreadCount } = useMessageNotification();

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const router = useRouter();
const { destroyWatermark, updateWatermark } = useWatermark();
// 使用 WebSocket 实时未读数量
const showDot = computed(() => unreadCount.value > 0);

// 用户租户列表
const userTenants = ref<any[]>([]);

// 当前租户ID - 优先从 userInfo 获取，其次从 localStorage
const currentTenantId = computed(() => {
  return userStore.userInfo?.tenantId || null;
});

// 当前租户名称
const currentTenantName = computed(() => {
  // 优先从 userInfo 获取
  if (userStore.userInfo?.tenantName) {
    return userStore.userInfo.tenantName;
  }

  // 其次从租户列表中查找
  const tenant = userTenants.value.find(
    (t) => t.tenantId === currentTenantId.value,
  );
  return tenant?.tenantName || '未知单位';
});

// 保存的账号列表（用于快速切换）
const savedAccounts = ref<any[]>([]);

// 检查是否是从其他用户切换过来的
const isSwitchedUser = computed(() => {
  // 可以通过检查session或其他方式判断
  return false; // TODO: 实现检查逻辑
});

const menus = computed(() => [
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

async function handleMakeAll() {
  // 标记所有未读消息为已读
  const unreadIds = notifications.value
    .filter((item) => !item.isRead)
    .map((item) => Number(item.id));

  if (unreadIds.length > 0) {
    try {
      // 调用批量标记已读API
      await batchMarkAsReadApi(unreadIds);
      notifications.value.forEach((item) => (item.isRead = true));
      message.success('已全部标记为已读');
      
      // 刷新未读数量
      refreshUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
}

// 加载站内消息
async function loadMessages() {
  try {
    const result = await getMyMessagePageApi({
      pageNum: 1,
      pageSize: 10,
    });

    // 转换为通知格式
    notifications.value = (result.records || []).map((msg: any) => ({
      id: msg.id,
      avatar: `https://avatar.vercel.sh/${msg.senderName}`,
      date: msg.createTime ? msg.createTime.replace('T', ' ').slice(0, 19) : '',
      isRead: msg.isRead === 1,
      message: msg.content,
      title: msg.title,
    }));
  } catch (error) {
    console.error('加载消息失败:', error);
  }
}

// 点击通知项 - 跳转到消息详情
async function handleNotificationClick(item: NotificationItem) {
  // 标记为已读
  if (!item.isRead) {
    try {
      await markAsReadApi(Number(item.id));
      item.isRead = true;
      
      // 刷新未读数量
      refreshUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }

  // 跳转到站内消息页面,并带上消息ID
  router.push({
    path: '/system/message',
    query: { messageId: item.id },
  });
}

// 查看所有消息 - 跳转到站内消息页面
function handleViewAllMessages() {
  router.push('/system/message');
}

// 定时刷新消息（每30秒）
let messageRefreshTimer: number | null = null;

function startMessageRefresh() {
  // 清除旧的定时器
  if (messageRefreshTimer) {
    clearInterval(messageRefreshTimer);
  }

  // 每30秒刷新一次消息
  messageRefreshTimer = window.setInterval(() => {
    loadMessages();
  }, 30000);
}

function stopMessageRefresh() {
  if (messageRefreshTimer) {
    clearInterval(messageRefreshTimer);
    messageRefreshTimer = null;
  }
}

// 加载用户租户列表
async function loadUserTenants() {
  try {
    // 清除旧的 localStorage 租户ID（不再使用）
    localStorage.removeItem('currentTenantId');

    const tenants = await getUserTenantsApi();
    console.log('用户租户列表:', tenants);
    console.log('当前登录租户ID:', userStore.userInfo?.tenantId);
    console.log('当前登录租户名称:', userStore.userInfo?.tenantName);
    userTenants.value = tenants || [];
    console.log('租户数量:', userTenants.value.length);
    console.log('是否显示切换按钮:', userTenants.value.length > 1);
  } catch (error) {
    console.error('加载租户列表失败:', error);
    userTenants.value = [];
  }
}

// 切换租户
async function handleSwitchTenant(tenantId: number) {
  if (tenantId === currentTenantId.value) {
    return;
  }

  try {
    const backendUserInfo = await switchTenantApi(tenantId);

    console.log('切换租户返回的数据:', backendUserInfo);

    // 将后端返回的用户信息转换为 Vben 格式
    const userInfo = {
      userId: backendUserInfo.userId?.toString() || '',
      username: backendUserInfo.username || '',
      realName: backendUserInfo.nickname || backendUserInfo.username || '',
      avatar: backendUserInfo.avatar || '',
      desc: backendUserInfo.remark || '',
      homePath: '/dashboard',
      roles: backendUserInfo.roles || [],
      // 租户信息
      tenantId: backendUserInfo.tenantId,
      tenantCode: backendUserInfo.tenantCode,
      tenantName: backendUserInfo.tenantName,
    };

    // 更新用户信息
    userStore.setUserInfo(userInfo);

    const tenantName =
      backendUserInfo.tenantName ||
      userTenants.value.find((t) => t.tenantId === tenantId)?.tenantName;

    message.success(`已切换到 ${tenantName}`);

    // 重新加载租户列表
    await loadUserTenants();

    // 使用路由跳转到首页来刷新数据
    const currentPath = router.currentRoute.value.path;
    if (currentPath === '/') {
      // 如果已经在首页，先跳转到一个临时路由再跳回来
      await router.push('/dashboard');
      await router.push('/');
    } else {
      // 跳转到首页
      await router.push('/');
    }
  } catch (error) {
    console.error('切换租户失败:', error);
    message.error('切换单位失败');
  }
}

// 切换账号（跳转到登录页）
function handleSwitchAccount() {
  router.push('/login');
}

// 快速登录
async function handleQuickLogin(account: any) {
  try {
    await authStore.authLogin({
      username: account.username,
      password: account.password, // 注意：实际应用中不应该保存密码
    });
  } catch (error) {
    console.error('快速登录失败:', error);
    message.error('登录失败，请重新输入密码');
    router.push('/login');
  }
}

// 加载保存的账号列表
function loadSavedAccounts() {
  const accounts = localStorage.getItem('savedAccounts');
  if (accounts) {
    try {
      savedAccounts.value = JSON.parse(accounts);
    } catch (error) {
      console.error('解析保存的账号失败:', error);
    }
  }
}

onMounted(() => {
  loadSavedAccounts();
  loadMessages(); // 加载站内消息
  startMessageRefresh(); // 启动定时刷新

  // 延迟加载租户列表，确保 userInfo 已经加载
  let retryCount = 0;
  const maxRetries = 50; // 最多重试5秒

  const checkAndLoadTenants = () => {
    console.log('检查 userInfo:', {
      userInfo: userStore.userInfo,
      hasTenantId: userStore.userInfo?.tenantId,
      retryCount,
    });

    if (userStore.userInfo && userStore.userInfo.tenantId) {
      console.log('userInfo 已就绪，加载租户列表');
      loadUserTenants();
    } else if (retryCount < maxRetries) {
      retryCount++;
      console.log(`userInfo 未就绪，等待... (${retryCount}/${maxRetries})`);
      setTimeout(checkAndLoadTenants, 100);
    } else {
      console.error('userInfo 加载超时，请检查登录状态');
    }
  };

  setTimeout(checkAndLoadTenants, 100);
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopMessageRefresh();
});

// 监听 userInfo 变化，重新加载租户列表
watch(
  () => userStore.userInfo?.tenantId,
  (newTenantId, oldTenantId) => {
    console.log('tenantId 变化:', { newTenantId, oldTenantId });
    if (newTenantId && newTenantId !== oldTenantId) {
      console.log('租户ID已更新，重新加载租户列表');
      loadUserTenants();
    }
  },
);

watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        :description="currentTenantName"
        tag-text=""
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
        @read="handleNotificationClick"
        @view-all="handleViewAllMessages"
      />
    </template>
    <!-- 租户切换按钮 - 使用 header-right-45 插槽，显示在通知按钮之前 -->
    <template #header-right-45>
      <ADropdown
        v-if="userTenants.length > 1"
        placement="bottomRight"
        :trigger="['click']"
      >
        <AButton size="small" class="mr-1">
          <span class="mr-1">🏢</span>
          <span>{{ currentTenantName }}</span>
          <span class="ml-1">▼</span>
        </AButton>
        <template #overlay>
          <AMenu>
            <AMenuItem
              v-for="tenant in userTenants"
              :key="tenant.tenantId"
              @click="handleSwitchTenant(tenant.tenantId)"
            >
              <div class="flex min-w-[150px] items-center justify-between">
                <span>{{ tenant.tenantName }}</span>
                <span
                  v-if="tenant.tenantId === currentTenantId"
                  class="text-primary ml-2"
                  >✓</span
                >
              </div>
            </AMenuItem>
          </AMenu>
        </template>
      </ADropdown>
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal :open="accessStore.loginExpired" :avatar>
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
