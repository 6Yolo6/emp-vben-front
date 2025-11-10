<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createDictData,
  updateDictData,
  type DictApi,
} from '#/api/sys/dict';

defineOptions({
  name: 'DictDataFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

const getTitle = computed(() => {
  return formData.value?.id ? '编辑字典数据' : '新增字典数据';
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
      fieldName: 'dictType',
      label: '字典类型',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'dictLabel',
      label: '字典标签',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入字典标签',
      },
    },
    {
      fieldName: 'dictValue',
      label: '字典键值',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入字典键值',
      },
    },
    {
      fieldName: 'dictSort',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        class: 'w-full',
      },
    },
    {
      fieldName: 'listClass',
      label: '样式属性',
      component: 'Select',
      componentProps: {
        placeholder: '请选择样式',
        allowClear: true,
        options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'error' },
          { label: '默认', value: 'default' },
        ],
      },
    },
    {
      fieldName: 'isDefault',
      label: '是否默认',
      component: 'RadioGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ],
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
        await updateDictData({ ...data, id: formData.value.id });
      } else {
        await createDictData(data);
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
