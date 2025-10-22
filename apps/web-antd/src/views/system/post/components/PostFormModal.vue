<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createPostApi, getPostDetailApi, updatePostApi } from '#/api';

defineOptions({
  name: 'PostFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

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
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'postName',
      label: '岗位名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入岗位名称',
      },
    },
    {
      fieldName: 'postCode',
      label: '岗位编码',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入岗位编码',
      },
    },
    {
      fieldName: 'postSort',
      label: '显示顺序',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入显示顺序',
        min: 0,
      },
      defaultValue: 0,
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
      const values = await formApi.getValues();

      if (formData.value?.id) {
        // 编辑
        await updatePostApi({ ...formData.value, ...values });
        message.success('更新成功');
      } else {
        // 新增
        await createPostApi(values);
        message.success('创建成功');
      }

      await modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }

    // 加载数据
    const data = modalApi.getData();
    if (!data || !data.id) {
      return;
    }

    modalApi.lock();
    try {
      formData.value = await getPostDetailApi(data.id);
      // 设置到 values
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal title="岗位信息" class="w-1/3">
    <Form class="mx-4" />
  </Modal>
</template>
