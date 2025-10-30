<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import {
  createTenantApi,
  getTenantDetailApi,
  updateTenantApi,
  type TenantApi,
} from '#/api/sys/tenant';

defineOptions({
  name: 'TenantFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑租户' : '新增租户';
});

// 表单配置
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: [

    {
      fieldName: 'tenantCode',
      label: '租户编码',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入租户编码',
      },
      dependencies: {
        triggerFields: ['id'],
        componentProps: (values: any) => ({
          disabled: !!values.id,
        }),
      },
    },
    {
      fieldName: 'tenantName',
      label: '租户名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入租户名称',
      },
    },
    {
      fieldName: 'tenantType',
      label: '租户类型',
      component: 'Input',
      componentProps: {
        placeholder: '请输入租户类型',
      },
    },
    {
      fieldName: 'contactName',
      label: '联系人',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系人',
      },
    },
    {
      fieldName: 'contactPhone',
      label: '联系电话',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系电话',
      },
    },
    {
      fieldName: 'contactEmail',
      label: '联系邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系邮箱',
      },
    },
    {
      fieldName: 'domain',
      label: '域名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入域名',
      },
    },
    {
      fieldName: 'expireTime',
      label: '过期时间',
      component: 'DatePicker',
      componentProps: {
        placeholder: '请选择过期时间',
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      fieldName: 'accountLimit',
      label: '账号限制',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入账号限制',
        min: 0,
      },
    },
    {
      fieldName: 'storageLimit',
      label: '存储限制(MB)',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入存储限制',
        min: 0,
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
      defaultValue: 1,
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
      formItemClass: 'col-span-2',
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

    modalApi.lock();
    try {
      const data = await formApi.getValues();

      if (formData.value?.id) {
        await updateTenantApi(formData.value.id, {
          ...data,
          id: formData.value.id,
        } as TenantApi.TenantUpdate);
      } else {
        await createTenantApi(data as TenantApi.TenantCreate);
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
        formData.value = await getTenantDetailApi(data.id);
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
