<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createMailTemplateApi,
  getMailTemplateApi,
  type MailApi,
  updateMailTemplateApi,
} from '#/api/sys/mail';

defineOptions({ name: 'MailTemplateFormModal' });

const emit = defineEmits(['success']);

const formData = ref<MailApi.MailTemplateVO | undefined>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑邮件模板' : '新增邮件模板';
});

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
        placeholder: '请输入模板编码，如：USER_REGISTER',
      },
      fieldName: 'templateCode',
      label: '模板编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入模板名称',
      },
      fieldName: 'templateName',
      label: '模板名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮件主题',
      },
      fieldName: 'subject',
      label: '邮件主题',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: 'HTML格式', value: 1 },
          { label: '纯文本', value: 2 },
        ],
      },
      defaultValue: 1,
      fieldName: 'templateType',
      label: '模板类型',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder:
          '请输入邮件内容，支持变量 [(${variableName})]，如：[(${username})]',
        rows: 10,
      },
      fieldName: 'content',
      label: '邮件内容',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '变量名称，多个用逗号分隔，如：username,email',
      },
      fieldName: 'variables',
      label: '模板变量',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    modalApi.lock();
    try {
      const values = await formApi.validate();

      const data: MailApi.MailTemplateDTO = {
        templateCode: values.templateCode,
        templateName: values.templateName,
        subject: values.subject,
        content: values.content,
        templateType: values.templateType,
        variables: values.variables,
        status: values.status,
      };

      if (formData.value?.id) {
        await updateMailTemplateApi({ ...data, id: formData.value.id });
      } else {
        await createMailTemplateApi(data);
      }

      await modalApi.close();
      emit('success');
      message.success('操作成功');
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
      if (data && data.id) {
        formData.value = await getMailTemplateApi(data.id);
        await formApi.setValues(formData.value);
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-2/3">
    <Form class="mx-4" />
  </Modal>
</template>
