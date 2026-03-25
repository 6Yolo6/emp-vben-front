<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { sendMessageApi } from '#/api/sys/message';
import {
  getMessageTemplateListApi,
  parseTemplateVariables,
  type MessageTemplateApi,
} from '#/api/sys/message-template';
import { getRoleListApi } from '#/api/sys/role';
import { getUserListApi } from '#/api/sys/user';

defineOptions({ name: 'MessageSendModal' });

const emit = defineEmits(['success']);

// 用户、角色和模板选项
const userOptions = ref<Array<{ label: string; value: number }>>([]);
const roleOptions = ref<Array<{ label: string; value: number }>>([]);
const templateOptions = ref<
  Array<{
    label: string;
    value: number;
    content: string;
    title: string;
    templateCode: string;
    variables?: string;
  }>
>([]);

// 当前选中的模板ID和变量
const selectedTemplateId = ref<number | null>(null);
const selectedTemplate = ref<(typeof templateOptions.value)[0] | null>(null);
const templateVariables = ref<MessageTemplateApi.TemplateVariable[]>([]);
const variablesValues = ref<Record<string, string>>({});

// 是否显示变量输入面板
const showVariablesPanel = computed(() => {
  return selectedTemplate.value && templateVariables.value.length > 0;
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
      component: 'Select',
      componentProps: {
        allowClear: true,
        fieldNames: { label: 'label', value: 'value' },
        options: templateOptions,
        placeholder: '选择消息模板（可选）',
        showSearch: true,
        onChange: (value: number) => {
          selectedTemplateId.value = value;
        },
      },
      fieldName: 'templateId',
      label: '消息模板',
      help: '选择模板后将自动填充标题和内容，并支持填充变量',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入消息标题',
      },
      fieldName: 'title',
      label: '消息标题',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入消息内容',
        rows: 5,
      },
      fieldName: 'content',
      label: '消息内容',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '系统通知', value: 1 },
          { label: '业务消息', value: 2 },
          { label: '预警消息', value: 3 },
        ],
      },
      defaultValue: 1,
      fieldName: 'messageType',
      label: '消息类型',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '指定用户', value: 1 },
          { label: '指定角色', value: 2 },
          { label: '全体用户', value: 3 },
        ],
      },
      defaultValue: 3,
      fieldName: 'receiverType',
      label: '接收人类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        fieldNames: { label: 'label', value: 'value' },
        mode: 'multiple',
        options: userOptions,
        placeholder: '请选择接收用户',
        showSearch: true,
      },
      dependencies: {
        show: (values) => {
          return values.receiverType === 1;
        },
        triggerFields: ['receiverType'],
      },
      fieldName: 'receiverIds',
      label: '接收用户',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        fieldNames: { label: 'label', value: 'value' },
        mode: 'multiple',
        options: roleOptions,
        placeholder: '请选择接收角色',
        showSearch: true,
      },
      dependencies: {
        show: (values) => {
          return values.receiverType === 2;
        },
        triggerFields: ['receiverType'],
      },
      fieldName: 'receiverRoleIds',
      label: '接收角色',
    },
  ],
});

// 加载用户列表
async function loadUsers() {
  try {
    const users = await getUserListApi();
    userOptions.value = users.map((user: any) => ({
      label: `${user.username} (${user.nickname || user.username})`,
      value: user.id,
    }));
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
}

// 加载角色列表
async function loadRoles() {
  try {
    const roles = await getRoleListApi();
    roleOptions.value = roles.map((role: any) => ({
      label: role.roleName,
      value: role.id,
    }));
  } catch (error) {
    console.error('加载角色列表失败:', error);
  }
}

// 加载消息模板列表
async function loadTemplates() {
  try {
    const templates = await getMessageTemplateListApi();
    templateOptions.value = templates.map((template: any) => ({
      label: template.templateName,
      value: template.id,
      // 支持多种字段名称以兼容不同的后端实现
      title: template.title || template.titleTemplate || template.templateName,
      content: template.content || template.contentTemplate || '',
      templateCode: template.templateCode || '',
      variables: template.variables,
    }));
    console.log('模板列表加载成功:', templateOptions.value);
  } catch (error) {
    console.error('加载消息模板失败:', error);
    message.error('加载消息模板失败，请稍后重试');
  }
}

/**
 * 将变量值替换到内容中
 * @param content 原始内容
 * @param variables 变量值对象
 */
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    // 支持 ${key} 和 {key} 两种格式
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}

/**
 * 处理模板选择变化
 */
watch(selectedTemplateId, async (templateId) => {
  // 清空变量值
  variablesValues.value = {};
  templateVariables.value = [];
  selectedTemplate.value = null;

  if (templateId) {
    const template = templateOptions.value.find((t) => t.value === templateId);
    if (template) {
      selectedTemplate.value = template;

      // 自动填充标题和内容
      await formApi.setFieldValue('title', template.title);
      await formApi.setFieldValue('content', template.content);

      // 解析模板变量
      const variables = parseTemplateVariables(template.templateCode, template.variables);
      templateVariables.value = variables;

      // 初始化变量值对象
      variables.forEach((v) => {
        variablesValues.value[v.key] = '';
      });
    }
  }
});

/**
 * 应用变量值到内容中
 */
async function applyVariablesToContent() {
  if (!selectedTemplate.value) return;

  const originalContent = selectedTemplate.value.content;
  const newContent = replaceVariables(originalContent, variablesValues.value);
  
  try {
    // 等待表单值设置完成
    await formApi.setFieldValue('content', newContent);
    console.log('变量已应用，新内容:', newContent);
    message.success('变量已应用到消息内容');
  } catch (error) {
    console.error('应用变量失败:', error);
    message.error('应用变量失败，请重试');
  }
}

/**
 * 重置模板内容（移除变量替换）
 */
async function resetTemplateContent() {
  if (!selectedTemplate.value) return;
  
  try {
    // 等待表单值设置完成
    await formApi.setFieldValue('content', selectedTemplate.value.content);
    console.log('已重置为原始内容:', selectedTemplate.value.content);
    message.success('已重置为模板原始内容');
  } catch (error) {
    console.error('重置内容失败:', error);
    message.error('重置内容失败，请重试');
  }
}

onMounted(() => {
  loadUsers();
  loadRoles();
  loadTemplates();
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    try {
      // 先验证表单
      const valid = await formApi.validate();
      if (!valid) {
        return;
      }

      modalApi.lock();

      // 获取表单值 - getValues() 返回 Promise,需要 await
      const values = await formApi.getValues();
      console.log('表单值:', values);

      // 构建发送数据
      const data: any = {
        title: values.title,
        content: values.content,
        messageType: values.messageType,
        receiverType: values.receiverType,
      };

      // 如果使用了模板且填充了变量，记录变量信息
      if (selectedTemplateId.value && Object.keys(variablesValues.value).length > 0) {
        const hasValues = Object.values(variablesValues.value).some((v) => v.trim() !== '');
        if (hasValues) {
          data.variables = variablesValues.value;
        }
      }

      // 根据接收人类型添加对应的ID列表
      if (values.receiverType === 1 && values.receiverIds && values.receiverIds.length > 0) {
        data.receiverIds = values.receiverIds;
      }

      if (values.receiverType === 2 && values.receiverRoleIds && values.receiverRoleIds.length > 0) {
        data.receiverRoleIds = values.receiverRoleIds;
      }

      console.log('发送数据:', data);
      await sendMessageApi(data);

      message.success('发送成功');
      emit('success');
      await modalApi.close();
    } catch (error: any) {
      console.error('发送消息失败:', error);
      message.error(error.message || '发送失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formApi.resetForm();
      selectedTemplateId.value = null;
      selectedTemplate.value = null;
      templateVariables.value = [];
      variablesValues.value = {};
    }
  },
});
</script>

<template>
  <Modal title="发送消息" class="w-2/3">
    <Form class="mx-4" />

    <!-- 模板变量填充面板 -->
    <div v-if="showVariablesPanel" class="mx-4 mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold text-blue-900">
          <span class="mr-2">📝</span>模板变量填充
        </h3>
        <div class="space-x-2">
          <button
            class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            @click="applyVariablesToContent"
          >
            应用变量
          </button>
          <button
            class="rounded bg-gray-400 px-3 py-1 text-sm text-white hover:bg-gray-500"
            @click="resetTemplateContent"
          >
            重置内容
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="variable in templateVariables" :key="variable.key" class="flex flex-col">
          <label class="mb-1 text-sm font-medium text-gray-700">
            {{ variable.name }}
            <span class="text-red-500">*</span>
            <span v-if="variable.description" class="ml-2 text-xs text-gray-500">
              ({{ variable.description }})
            </span>
          </label>
          <input
            v-model="variablesValues[variable.key]"
            :placeholder="`请输入${variable.name}`"
            class="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            type="text"
          />
        </div>
      </div>

      <div class="mt-3 rounded bg-blue-100 p-2 text-xs text-blue-800">
        💡 提示：填充好变量后，点击"应用变量"按钮将变量值替换到消息内容中
      </div>
    </div>
  </Modal>
</template>

