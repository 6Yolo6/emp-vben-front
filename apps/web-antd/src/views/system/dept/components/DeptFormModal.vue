<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createDeptApi,
  getDeptDetailApi,
  getDeptTreeApi,
  updateDeptApi,
} from '#/api';

defineOptions({
  name: 'DeptFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();
const deptTree = ref<any[]>([]);

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
      fieldName: 'parentId',
      label: '上级部门',
      component: 'TreeSelect',
      componentProps: computed(() => ({
        placeholder: '请选择上级部门',
        treeData: deptTree.value,
        fieldNames: {
          label: 'deptName',
          value: 'id',
          children: 'children',
        },
        treeDefaultExpandAll: true,
        allowClear: true,
      })),
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'name',
      label: '部门名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入部门名称',
      },
    },
    {
      fieldName: 'orderNum',
      label: '显示顺序',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入显示顺序',
        min: 0,
      },
      defaultValue: 0,
    },
    {
      fieldName: 'leader',
      label: '负责人',
      component: 'Input',
      componentProps: {
        placeholder: '请输入负责人',
      },
    },
    {
      fieldName: 'phone',
      label: '联系电话',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系电话',
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      formItemClass: 'col-span-2',
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
        await updateDeptApi({ ...formData.value, ...values });
        message.success('更新成功');
      } else {
        // 新增
        await createDeptApi(values);
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

    modalApi.lock();
    try {
      // 加载部门树并添加顶级节点
      const treeData = await getDeptTreeApi();
      deptTree.value = [
        {
          id: 0,
          deptName: '主部门',
          children: treeData || [],
        },
      ];

      // 加载数据
      const data = modalApi.getData();
      if (!data) {
        return;
      }

      if (data.id) {
        // 编辑模式
        formData.value = await getDeptDetailApi(data.id);
        await formApi.setValues(formData.value);
      } else if (data.parentId) {
        // 新增下级模式
        await formApi.setValues({ parentId: data.parentId });
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal title="部门信息" class="w-1/2">
    <Form class="mx-4" />
  </Modal>
</template>
