<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createTemplateApi,
  getTemplateDetailApi,
  type MessageTemplateApi,
  updateTemplateApi,
} from '#/api/sys/message-template';

defineOptions({ name: 'MessageTemplateFormModal' });

const emit = defineEmits(['success']);

const formData = ref<MessageTemplateApi.MessageTemplateVO | undefined>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑消息模板' : '新增消息模板';
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
        placeholder: '请输入模板编码',
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
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '系统通知', value: 1 },
          { label: '业务消息', value: 2 },
          { label: '预警消息', value: 3 },
        ],
      },
      defaultValue: 1,
      fieldName: 'messageType',
      label: '消息类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入消息标题,支持变量 ${variableName}',
      },
      fieldName: 'title',
      label: '消息标题',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入消息内容,支持变量 ${variableName}',
        rows: 6,
      },
      fieldName: 'content',
      label: '消息内容',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '变量名称,多个用逗号分隔,如: userName,orderNo',
      },
      fieldName: 'variables',
      label: '模板变量',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
      fieldName: 'remark',
      label: '备注',
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    modalApi.lock();
    try {
      const values = await formApi.validate();
      
      const data: MessageTemplateApi.MessageTemplateDTO = {
        templateCode: values.templateCode,
        templateName: values.templateName,
        messageType: values.messageType,
        title: values.title,
        content: values.content,
        variables: values.variables,
        status: values.status,
        remark: values.remark,
      };

      if (formData.value?.id) {
        await updateTemplateApi(formData.value.id, data);
      } else {
        await createTemplateApi(data);
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
        formData.value = await getTemplateDetailApi(data.id);
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
