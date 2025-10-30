<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw, onMounted, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getAllTenantsApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const tenantOptions = ref<BasicOption[]>([]);
const loadingTenants = ref(false);

// 加载所有租户列表
const loadAllTenants = async () => {
  try {
    loadingTenants.value = true;
    // console.log('开始加载所有租户列表...');
    const response = await getAllTenantsApi();
    // console.log('租户列表响应:', response);

    // 处理响应数据结构：response.data.data 或 response.data
    let tenants: any[] = [];
    if (Array.isArray(response)) {
      tenants = response;
    } else if (response && typeof response === 'object') {
      // 可能是 {data: {data: []}} 或 {data: []}
      const data = (response as any).data;
      if (Array.isArray(data)) {
        tenants = data;
      } else if (data && Array.isArray(data.data)) {
        tenants = data.data;
      }
    }

    // console.log('提取的租户数组:', tenants);
    const options = tenants.map((tenant: any) => ({
      label: tenant.tenantName,
      value: tenant.tenantCode,
    }));
    // 使用 JSON 序列化和反序列化来创建纯对象
    tenantOptions.value = JSON.parse(JSON.stringify(options));
    // console.log('租户选项:', tenantOptions.value);
    // console.log(
    //   '租户选项类型:',
    //   Array.isArray(tenantOptions.value),
    //   tenantOptions.value.length,
    // );
  } catch (error) {
    console.error('加载租户列表失败:', error);
    tenantOptions.value = [];
  } finally {
    loadingTenants.value = false;
  }
};

// 组件挂载后立即加载租户列表
onMounted(() => {
  // console.log('Login组件已挂载，开始加载租户');
  loadAllTenants();
});

// 表单配置
const formSchema = computed((): VbenFormSchema[] => {
  const options = tenantOptions.value;
  
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        placeholder: '请选择单位',
        options: options,
        allowClear: true,
      },
      fieldName: 'tenantCode',
      label: '选择单位',
      rules: z.string().min(1, { message: '请选择单位' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authStore.authLogin"
  />
</template>
