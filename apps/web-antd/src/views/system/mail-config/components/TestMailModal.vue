<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { type MailApi, testMailConfigApi } from '#/api/sys/mail';

defineOptions({ name: 'TestMailModal' });

const emit = defineEmits(['success']);

const formData = ref<MailApi.MailConfigVO | undefined>();

// 表单配置
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1',
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'configName',
      label: '配置名称',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入测试收件人邮箱',
      },
      fieldName: 'toEmail',
      label: '收件人邮箱',
      rules: 'required',
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    modalApi.lock();
    try {
      const values = await formApi.validate();

      if (!formData.value?.id) {
        message.error('配置ID不存在');
        return;
      }

      await testMailConfigApi(formData.value.id, values.toEmail);
      
      await modalApi.close();
      emit('success');
      message.success('测试邮件已发送，请检查收件箱');
    } catch (error: any) {
      console.error('测试失败:', error);
      message.error(error.message || '测试邮件发送失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }

    modalApi.lock();
    try {
      const data = modalApi.getData();
      if (data) {
        formData.value = data;
        await formApi.setValues({
          configName: data.configName,
          toEmail: '',
        });
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal title="测试邮件" class="w-1/2">
    <Form class="mx-4" />
  </Modal>
</template>
