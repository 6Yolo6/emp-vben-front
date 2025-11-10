<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createDictType,
  updateDictType,
  type DictApi,
} from '#/api/sys/dict';

defineOptions({
  name: 'DictTypeFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑字典类型' : '新增字典类型';
});

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
      fieldName: 'dictName',
      label: '字典名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入字典名称',
      },
    },
    {
      fieldName: 'dictType',
      label: '字典类型',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入字典类型',
      },
      dependencies: {
        triggerFields: ['id'],
        componentProps: (values: any) => ({
          disabled: !!values.id,
        }),
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'RadioGroup',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
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

    modalApi.lock();
    try {
      const data = await formApi.getValues();

      if (formData.value?.id) {
        await updateDictType({ ...data, id: formData.value.id });
      } else {
        await createDictType(data);
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
      formApi.resetForm();
      return;
    }

    const data = modalApi.getData();
    if (data) {
      formData.value = data;
      await formApi.setValues(data);
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
    <Form class="mx-4" />
  </Modal>
</template>
