<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createRoleApi, getRoleDetailApi, updateRoleApi } from '#/api';

defineOptions({
  name: 'RoleFormModal',
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
      fieldName: 'roleName',
      label: '角色名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入角色名称',
      },
    },
    {
      fieldName: 'roleKey',
      label: '角色标识',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入角色标识',
      },
    },
    {
      fieldName: 'roleSort',
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
      fieldName: 'dataScope',
      label: '数据权限',
      component: 'Select',
      componentProps: {
        placeholder: '请选择数据权限范围',
        options: [
          { label: '全部数据权限', value: 1 },
          { label: '本部门数据权限', value: 2 },
          { label: '本部门及以下数据权限', value: 3 },
          { label: '仅本人数据权限', value: 4 },
          { label: '自定义数据权限', value: 5 },
        ],
      },
      defaultValue: 1,
      help: '控制角色可以查看的数据范围',
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
        await updateRoleApi({ ...formData.value, ...values });
        message.success('更新成功');
      } else {
        // 新增
        await createRoleApi(values);
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
      formData.value = await getRoleDetailApi(data.id);
      // 设置到 values
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal title="角色信息" class="w-1/3">
    <Form class="mx-4" />
  </Modal>
</template>
