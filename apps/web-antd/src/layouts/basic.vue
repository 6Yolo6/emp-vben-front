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
  Dropdown,
  Menu,
  MenuItem,
  MenuDivider,
  message,
} from 'ant-design-vue';

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
const currentTenantId = ref<number | null>(null);
const currentTenantName = computed(() => {
  const tenant = userTenants.value.find(
    (t) => t.tenantId === currentTenantId.value,
  );
  return tenant?.tenantName || '未选择单位';
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
    const tenants = await getUserTenantsApi();
    userTenants.value = tenants || [];

    // 从localStorage获取当前租户ID
    const storedTenantId = localStorage.getItem('currentTenantId');
    if (storedTenantId) {
      currentTenantId.value = Number(storedTenantId);
    } else if (tenants && tenants.length > 0) {
      // 默认选择第一个租户
      currentTenantId.value = tenants[0].tenantId;
    }
  } catch (error) {
    console.error('加载租户列表失败:', error);
  }
}

// 切换租户
async function handleSwitchTenant(tenantId: number) {
  if (tenantId === currentTenantId.value) {
    return;
  }

  try {
    await switchTenantApi(tenantId);
    currentTenantId.value = tenantId;
    localStorage.setItem('currentTenantId', String(tenantId));

    message.success(`已切换到 ${currentTenantName.value}`);

    // 刷新页面以重新加载数据
    window.location.reload();
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

// 切换回管理员账号
async function handleSwitchBackToAdmin() {
  try {
    const result = await switchBackToOriginalApi();

    // 更新 token
    if (result.accessToken) {
      accessStore.setAccessToken(result.accessToken);
    }

    // 更新用户信息
    if (result.userInfo) {
      userStore.setUserInfo(result.userInfo);
    }

    message.success('已切换回管理员账号');

    // 刷新页面
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('切换回管理员失败:', error);
    message.error('切换失败');
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
  loadUserTenants();
  loadSavedAccounts();
});

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
        tag-text="Pro"
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
    <template #toolbar-actions>
      <!-- 切换回管理员账号 -->
      <AButton
        v-if="isSwitchedUser"
        type="primary"
        size="small"
        @click="handleSwitchBackToAdmin"
        class="mr-2"
      >
        切换回管理员
      </AButton>

      <!-- 快速切换单位 -->
      <Dropdown v-if="userTenants.length > 1" placement="bottomRight">
        <div class="hover:bg-accent flex cursor-pointer items-center px-2">
          <span class="mr-1 text-sm">🏢</span>
          <span class="text-sm">{{ currentTenantName }}</span>
          <span class="ml-1 text-xs">▼</span>
        </div>
        <template #overlay>
          <Menu>
            <MenuItem
              v-for="tenant in userTenants"
              :key="tenant.tenantId"
              @click="handleSwitchTenant(tenant.tenantId)"
            >
              <div class="flex items-center justify-between">
                <span>{{ tenant.tenantName }}</span>
                <span
                  v-if="tenant.tenantId === currentTenantId"
                  class="text-primary ml-2"
                  >✓</span
                >
              </div>
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
