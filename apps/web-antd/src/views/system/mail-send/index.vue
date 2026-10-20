<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Space,
  Tabs,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  getMailTemplateListApi,
  type MailApi,
  sendMailApi,
  sendTemplateMailApi,
} from '#/api/sys/mail';

const AButton = Button;
const ASpace = Space;
const ACard = Card;
const ATabs = Tabs;
const ATabPane = Tabs.TabPane;
const AAlert = Alert;
const ADescriptions = Descriptions;
const ADescriptionsItem = Descriptions.Item;

const activeTab = ref('normal');
const normalLoading = ref(false);
const templateLoading = ref(false);
const templateList = ref<MailApi.MailTemplateVO[]>([]);
const selectedTemplate = ref<MailApi.MailTemplateVO | null>(null);
const previewVisible = ref(false);

// 计算模板选项
const templateOptions = computed(() => {
  return templateList.value
    .filter((t) => t.status === 1)
    .map((t) => ({
      label: `${t.templateName} (${t.templateCode})`,
      value: t.templateCode,
    }));
});

// 计算模板变量提示
const templateVariablesHint = computed(() => {
  if (!selectedTemplate.value?.variables) {
    return '此模板无需变量';
  }
  const vars = selectedTemplate.value.variables.split(',').map((v) => v.trim());
  return `需要的变量: ${vars.join(', ')}`;
});

// 生成示例JSON
const exampleJson = computed(() => {
  if (!selectedTemplate.value?.variables) {
    return '{}';
  }
  const vars = selectedTemplate.value.variables.split(',').map((v) => v.trim());
  const example: Record<string, string> = {};
  vars.forEach((v) => {
    example[v] = `示例${v}值`;
  });
  return JSON.stringify(example, null, 2);
});

// 加载模板列表
onMounted(async () => {
  try {
    templateList.value = await getMailTemplateListApi();
  } catch (error) {
    console.error('加载模板列表失败:', error);
  }
});

// 普通邮件表单
const [NormalForm, normalFormApi] = useVbenForm({
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
        mode: 'tags',
        placeholder: '请输入收件人邮箱，按回车添加多个',
      },
      fieldName: 'toEmails',
      label: '收件人',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'tags',
        placeholder: '请输入抄送人邮箱，按回车添加多个',
      },
      fieldName: 'ccEmails',
      label: '抄送',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮件主题',
      },
      fieldName: 'subject',
      label: '主题',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: 'HTML格式', value: true },
          { label: '纯文本', value: false },
        ],
      },
      defaultValue: true,
      fieldName: 'isHtml',
      label: '邮件格式',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入邮件内容',
        rows: 10,
      },
      fieldName: 'content',
      label: '内容',
      rules: 'required',
    },
  ],
});

// 处理模板选择变化
function handleTemplateChange(templateCode: string) {
  if (templateCode) {
    const template = templateList.value.find(
      (t) => t.templateCode === templateCode,
    );
    selectedTemplate.value = template || null;
  } else {
    selectedTemplate.value = null;
  }
}

// 模板邮件表单
const [TemplateForm, templateFormApi] = useVbenForm({
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
        placeholder: '请选择邮件模板',
        options: templateOptions,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().includes(input.toLowerCase());
        },
        onChange: handleTemplateChange,
      },
      fieldName: 'templateCode',
      label: '邮件模板',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'tags',
        placeholder: '请输入收件人邮箱，按回车添加多个',
      },
      fieldName: 'toEmails',
      label: '收件人',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'tags',
        placeholder: '请输入抄送人邮箱，按回车添加多个',
      },
      fieldName: 'ccEmails',
      label: '抄送',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入模板变量，JSON格式',
        rows: 6,
      },
      fieldName: 'variables',
      label: '模板变量',
    },
  ],
});


// 发送普通邮件
async function handleSendNormal() {
  try {
    normalLoading.value = true;
    const values = await normalFormApi.validate();
    await sendMailApi({
      ...values,
      toEmails: Array.isArray(values.toEmails)
        ? values.toEmails
        : [values.toEmails],
      ccEmails: values.ccEmails
        ? Array.isArray(values.ccEmails)
          ? values.ccEmails
          : [values.ccEmails]
        : undefined,
    });
    message.success('邮件发送成功');
    normalFormApi.resetForm();
  } catch (error: any) {
    console.error('发送失败:', error);
    message.error(error.message || '邮件发送失败');
  } finally {
    normalLoading.value = false;
  }
}

// 发送模板邮件
async function handleSendTemplate() {
  try {
    templateLoading.value = true;
    const values = await templateFormApi.validate();

    // 解析模板变量
    let variables = {};
    if (values.variables) {
      try {
        variables = JSON.parse(values.variables);
      } catch (e) {
        message.error('模板变量格式错误，请输入有效的JSON');
        return;
      }
    }

    await sendTemplateMailApi({
      templateCode: values.templateCode,
      toEmails: Array.isArray(values.toEmails)
        ? values.toEmails
        : [values.toEmails],
      ccEmails: values.ccEmails
        ? Array.isArray(values.ccEmails)
          ? values.ccEmails
          : [values.ccEmails]
        : undefined,
      variables,
    });
    message.success('邮件发送成功');
    templateFormApi.resetForm();
    selectedTemplate.value = null;
  } catch (error: any) {
    console.error('发送失败:', error);
    message.error(error.message || '邮件发送失败');
  } finally {
    templateLoading.value = false;
  }
}

// 填充示例变量
function handleFillExample() {
  templateFormApi.setFieldValue('variables', exampleJson.value);
  message.success('已填充示例变量');
}

// 预览模板
function handlePreview() {
  if (!selectedTemplate.value) {
    message.warning('请先选择模板');
    return;
  }
  previewVisible.value = true;
}

// 重置表单
function handleReset() {
  if (activeTab.value === 'normal') {
    normalFormApi.resetForm();
  } else {
    templateFormApi.resetForm();
    selectedTemplate.value = null;
  }
}
</script>

<template>
  <Page
    auto-content-height
    description="发送邮件通知，支持普通邮件和模板邮件"
    title="发送邮件"
  >
    <ACard>
      <ATabs v-model:activeKey="activeTab">
        <ATabPane key="normal" tab="普通邮件">
          <NormalForm class="mx-4" />
          <ASpace class="mt-4 mx-4">
            <AButton
              type="primary"
              :loading="normalLoading"
              @click="handleSendNormal"
            >
              发送邮件
            </AButton>
            <AButton @click="handleReset"> 重置 </AButton>
          </ASpace>
        </ATabPane>

        <ATabPane key="template" tab="模板邮件">
          <TemplateForm class="mx-4" />

          <!-- 模板信息提示 -->
          <div v-if="selectedTemplate" class="mx-4 mt-4">
            <AAlert :message="templateVariablesHint" type="info" show-icon>
              <template #description>
                <div class="mt-2">
                  <div>
                    <strong>邮件主题:</strong> {{ selectedTemplate.subject }}
                  </div>
                  <div class="mt-1">
                    <strong>模板类型:</strong>
                    {{ selectedTemplate.templateType === 1 ? 'HTML' : '纯文本' }}
                  </div>
                </div>
              </template>
            </AAlert>
          </div>

          <ASpace class="mt-4 mx-4">
            <AButton
              type="primary"
              :loading="templateLoading"
              @click="handleSendTemplate"
            >
              发送邮件
            </AButton>
            <AButton
              v-if="selectedTemplate"
              type="default"
              @click="handlePreview"
            >
              预览模板
            </AButton>
            <AButton
              v-if="selectedTemplate?.variables"
              type="dashed"
              @click="handleFillExample"
            >
              填充示例变量
            </AButton>
            <AButton @click="handleReset"> 重置 </AButton>
          </ASpace>
        </ATabPane>
      </ATabs>
    </ACard>

    <!-- 模板预览弹窗 -->
    <Modal
      v-model:open="previewVisible"
      title="模板预览"
      width="800px"
      :footer="null"
    >
      <ADescriptions v-if="selectedTemplate" bordered :column="1">
        <ADescriptionsItem label="模板编码">
          {{ selectedTemplate.templateCode }}
        </ADescriptionsItem>
        <ADescriptionsItem label="模板名称">
          {{ selectedTemplate.templateName }}
        </ADescriptionsItem>
        <ADescriptionsItem label="邮件主题">
          {{ selectedTemplate.subject }}
        </ADescriptionsItem>
        <ADescriptionsItem label="模板类型">
          {{ selectedTemplate.templateType === 1 ? 'HTML格式' : '纯文本' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="模板变量">
          {{ selectedTemplate.variables || '无' }}
        </ADescriptionsItem>
        <ADescriptionsItem label="邮件内容">
          <div
            v-if="selectedTemplate.templateType === 1"
            v-html="selectedTemplate.content"
            class="border p-4 rounded bg-gray-50"
          ></div>
          <pre
            v-else
            class="border p-4 rounded bg-gray-50 whitespace-pre-wrap"
            >{{ selectedTemplate.content }}</pre
          >
        </ADescriptionsItem>
      </ADescriptions>
    </Modal>
  </Page>
</template>
