<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, ref, watch } from 'vue';
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
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const notifications = ref<NotificationItem[]>([
  {
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const router = useRouter();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

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

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
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
