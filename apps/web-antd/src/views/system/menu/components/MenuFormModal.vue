<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createMenuApi,
  getMenuDetailApi,
  getMenuTreeApi,
  updateMenuApi,
} from '#/api';

defineOptions({
  name: 'MenuFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();
const menuTree = ref<any[]>([]);

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
      label: '上级菜单',
      component: 'TreeSelect',
      componentProps: computed(() => ({
        placeholder: '请选择上级菜单',
        treeData: menuTree.value,
        fieldNames: {
          label: 'menuName',
          value: 'id',
          children: 'children',
        },
        treeDefaultExpandAll: true,
        allowClear: true,
      })),
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'menuType',
      label: '菜单类型',
      component: 'RadioGroup',
      rules: 'required',
      componentProps: {
        options: [
          { label: '目录', value: 'M' },
          { label: '菜单', value: 'C' },
          { label: '按钮', value: 'F' },
        ],
      },
      defaultValue: 2,
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'menuName',
      label: '菜单名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入菜单名称',
      },
    },
    {
      fieldName: 'icon',
      label: '菜单图标',
      component: 'Input',
      componentProps: {
        placeholder: '请输入图标名称',
      },
      dependencies: {
        triggerFields: ['menuType'],
        show: (values) => values.menuType !== 'F',
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
      fieldName: 'path',
      label: '路由地址',
      component: 'Input',
      componentProps: {
        placeholder: '请输入路由地址',
      },
      dependencies: {
        triggerFields: ['menuType'],
        show: (values) => values.menuType !== 'F',
      },
    },
    {
      fieldName: 'component',
      label: '组件路径',
      component: 'Input',
      componentProps: {
        placeholder: '请输入组件路径',
      },
      dependencies: {
        triggerFields: ['menuType'],
        show: (values) => values.menuType === 'C',
      },
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'permission',
      label: '权限标识',
      component: 'Input',
      componentProps: {
        placeholder: '请输入权限标识',
      },
      dependencies: {
        triggerFields: ['menuType'],
        show: (values) => values.menuType === 'F',
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
      fieldName: 'visible',
      label: '是否显示',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '显示', value: 1 },
          { label: '隐藏', value: 0 },
        ],
      },
      defaultValue: 1,
      dependencies: {
        triggerFields: ['menuType'],
        show: (values) => values.menuType !== 'F',
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
        await updateMenuApi({ ...formData.value, ...values });
        message.success('更新成功');
      } else {
        // 新增
        await createMenuApi(values);
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
      // 加载菜单树并添加顶级节点
      const treeData = await getMenuTreeApi();
      menuTree.value = [
        {
          id: 0,
          menuName: '主类目',
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
        formData.value = await getMenuDetailApi(data.id);
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
  <Modal title="菜单信息" class="w-2/3">
    <Form class="mx-4" />
  </Modal>
</template>
