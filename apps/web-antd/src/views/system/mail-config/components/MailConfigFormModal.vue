<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createMailConfigApi,
  getMailConfigApi,
  type MailApi,
  updateMailConfigApi,
} from '#/api/sys/mail';

defineOptions({ name: 'MailConfigFormModal' });

const emit = defineEmits(['success']);

const formData = ref<MailApi.MailConfigVO | undefined>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑邮件配置' : '新增邮件配置';
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
        placeholder: '请输入配置名称',
      },
      fieldName: 'configName',
      label: '配置名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '例如: smtp.163.com',
      },
      fieldName: 'smtpHost',
      label: 'SMTP服务器',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '例如: 465',
        class: 'w-full',
      },
      fieldName: 'smtpPort',
      label: 'SMTP端口',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱账号',
      },
      fieldName: 'username',
      label: '用户名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码或授权码',
      },
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '发件人显示名称',
      },
      fieldName: 'fromName',
      label: '发件人名称',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '启用',
        unCheckedChildren: '禁用',
        checkedValue: 1,
        unCheckedValue: 0,
      },
      defaultValue: 1,
      fieldName: 'sslEnable',
      label: '启用SSL',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
        checkedValue: 1,
        unCheckedValue: 0,
      },
      defaultValue: 0,
      fieldName: 'isDefault',
      label: '默认配置',
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
      
      const data: MailApi.MailConfigDTO = {
        configName: values.configName,
        smtpHost: values.smtpHost,
        smtpPort: values.smtpPort,
        username: values.username,
        password: values.password,
        fromName: values.fromName,
        sslEnable: values.sslEnable,
        isDefault: values.isDefault,
        status: values.status,
      };

      if (formData.value?.id) {
        await updateMailConfigApi({ ...data, id: formData.value.id });
      } else {
        await createMailConfigApi(data);
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
        formData.value = await getMailConfigApi(data.id);
        await formApi.setValues({
          ...formData.value,
          password: '', // 密码不回显
        });
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
