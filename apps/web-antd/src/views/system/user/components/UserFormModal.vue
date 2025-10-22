<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createUserApi,
  getDeptTreeApi,
  getUserDetailApi,
  updateUserApi,
} from '#/api';

defineOptions({
  name: 'UserFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();
const deptTree = ref<any[]>([]);

const getTitle = computed(() => {
  return formData.value?.id ? '编辑用户' : '新增用户';
});

// 加载部门树
async function loadDeptTree() {
  try {
    const tree = await getDeptTreeApi();
    deptTree.value = tree;
  } catch (error) {
    console.error('加载部门树失败:', error);
  }
}

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
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户名',
      },
      dependencies: {
        triggerFields: ['id'],
        componentProps: (values: any) => ({
          disabled: !!values.id,
        }),
      },
    },
    {
      fieldName: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: 'required',
      componentProps: {
        placeholder: '请输入密码',
      },
      dependencies: {
        triggerFields: ['id'],
        show: (values: any) => !values.id,
      },
    },
    {
      fieldName: 'nickname',
      label: '昵称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入昵称',
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
    },
    {
      fieldName: 'mobile',
      label: '手机号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
      },
    },
    {
      fieldName: 'deptId',
      label: '所属部门',
      component: 'TreeSelect',
      componentProps: {
        placeholder: '请选择部门',
        treeData: deptTree,
        fieldNames: {
          label: 'deptName',
          value: 'id',
          children: 'children',
        },
        showSearch: true,
        treeNodeFilterProp: 'deptName',
        allowClear: true,
      },
    },
    {
      fieldName: 'sex',
      label: '性别',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ],
      },
      defaultValue: 0,
      dependencies: {
        triggerFields: ['id'],
        show: (values: any) => !values.id, // 只在新增时显示
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
      dependencies: {
        triggerFields: ['id'],
        show: (values: any) => !values.id, // 只在新增时显示
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
      const data = await formApi.getValues();
      console.log('表单提交数据（处理前）:', data);

      // 编辑时，只提交 UserUpdateDTO 中定义的字段
      if (formData.value?.id) {
        // 根据后端 UserUpdateDTO 定义，只提交这些字段
        const updateData = {
          nickname: data.nickname,
          email: data.email,
          mobile: data.mobile,
          deptId: data.deptId,
          remark: data.remark,
        };
        console.log('编辑用户提交数据:', updateData);
        await updateUserApi(formData.value.id, updateData);
      } else {
        // 新增时提交 UserCreateDTO 中定义的字段
        const createData = {
          username: data.username,
          nickname: data.nickname,
          password: data.password,
          email: data.email,
          mobile: data.mobile,
          deptId: data.deptId,
          status: data.status,
          remark: data.remark,
        };
        console.log('新增用户提交数据:', createData);
        await createUserApi(createData);
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
      // 加载部门树
      await loadDeptTree();

      // 加载用户数据
      const data = modalApi.getData();
      if (data && data.id) {
        formData.value = await getUserDetailApi(data.id);
        // 编辑时不加载密码字段
        const { password, ...formValues } = formData.value;
        // 设置到 values
        await formApi.setValues(formValues);
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-1/3">
    <Form class="mx-4" />
  </Modal>
</template>
