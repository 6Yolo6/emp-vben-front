<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Form, Input, message, Modal, Select, Textarea } from 'ant-design-vue';

const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const AModal = Modal;
const ASelect = Select;
const ASelectOption = Select.Option;
const ATextarea = Input.TextArea;
import {
  createConfigApi,
  getConfigByIdApi,
  updateConfigApi,
  type ConfigApi,
} from '#/api/sys/config';

const emit = defineEmits<{
  success: [];
}>();

const visible = ref(false);
const loading = ref(false);
const isEdit = ref(false);
const title = ref('新增系统参数');

const formRef = ref();
const formData = reactive<
  ConfigApi.ConfigCreateDTO | ConfigApi.ConfigUpdateDTO
>({
  configName: '',
  configKey: '',
  configValue: '',
  configType: 1,
  remark: '',
});

const rules = {
  configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
  configType: [
    { required: true, message: '请选择参数类型', trigger: 'change' },
  ],
};

// 打开弹窗
async function open(id?: number) {
  visible.value = true;
  isEdit.value = !!id;
  title.value = id ? '编辑系统参数' : '新增系统参数';

  // 重置表单
  Object.assign(formData, {
    configName: '',
    configKey: '',
    configValue: '',
    configType: 1,
    remark: '',
  });

  if (id) {
    loading.value = true;
    try {
      const data = await getConfigByIdApi(id);
      Object.assign(formData, data);
    } finally {
      loading.value = false;
    }
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEdit.value) {
      await updateConfigApi(formData as ConfigApi.ConfigUpdateDTO);
      message.success('更新成功');
    } else {
      await createConfigApi(formData as ConfigApi.ConfigCreateDTO);
      message.success('创建成功');
    }

    visible.value = false;
    emit('success');
  } catch (error) {
    // 表单验证失败
  } finally {
    loading.value = false;
  }
}

// 取消
function handleCancel() {
  visible.value = false;
}

defineExpose({
  open,
});
</script>

<template>
  <a-modal
    v-model:open="visible"
    :confirm-loading="loading"
    :title="title"
    :width="600"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <a-form
      ref="formRef"
      :label-col="{ span: 6 }"
      :model="formData"
      :rules="rules"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="参数名称" name="configName">
        <a-input
          v-model:value="formData.configName"
          placeholder="请输入参数名称"
        />
      </a-form-item>

      <a-form-item label="参数键名" name="configKey">
        <a-input
          v-model:value="formData.configKey"
          placeholder="请输入参数键名"
        />
      </a-form-item>

      <a-form-item label="参数键值" name="configValue">
        <a-textarea
          v-model:value="formData.configValue"
          :rows="4"
          placeholder="请输入参数键值"
        />
      </a-form-item>

      <a-form-item label="参数类型" name="configType">
        <a-select
          v-model:value="formData.configType"
          placeholder="请选择参数类型"
        >
          <a-select-option :value="0">系统内置</a-select-option>
          <a-select-option :value="1">用户自定义</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-textarea
          v-model:value="formData.remark"
          :rows="3"
          placeholder="请输入备注"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
