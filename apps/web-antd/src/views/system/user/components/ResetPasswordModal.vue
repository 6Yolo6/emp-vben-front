<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { resetUserPasswordApi } from '#/api';

defineOptions({
  name: 'ResetPasswordModal',
});

const emit = defineEmits(['success']);
const userData = ref<any>();

// 表单配置
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'newPassword',
      label: '新密码',
      component: 'InputPassword',
      rules: 'required',
      componentProps: {
        placeholder: '请输入新密码',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: '确认密码',
      component: 'InputPassword',
      rules: 'required',
      componentProps: {
        placeholder: '请再次输入新密码',
      },
    },
  ],
  showDefaultActions: false,
});

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values = await formApi.getValues();

    // 验证两次密码是否一致
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    modalApi.lock();
    try {
      await resetUserPasswordApi(userData.value.id, values.newPassword);
      await modalApi.close();
      emit('success');
      message.success('密码重置成功');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      userData.value = undefined;
      await formApi.resetForm();
      return;
    }

    const data = modalApi.getData();
    if (data) {
      userData.value = data;
      await formApi.setValues({
        username: data.username,
      });
    }
  },
});
</script>

<template>
  <Modal title="重置密码" class="w-1/3">
    <Form class="mx-4" />
  </Modal>
</template>
