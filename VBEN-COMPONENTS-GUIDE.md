# Vben Admin 完整开发指南

> 从传统 Vue 项目迁移到 Vben Admin 企业级前端框架的完整学习文档  
> 包含组件使用、开发规范、最佳实践等内容

**文档版本**: v2.0  
**最后更新**: 2025-01-15  
**维护人员**: 开发团队  
**适用人群**: Vue 3 开发者、前端架构师、技术团队

---

## 📚 目录

- [框架概述](#框架概述)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [一、Vben 核心组件](#一vben-核心组件)
  - [1.1 Vben Form](#11-vben-form)
  - [1.2 Vben Modal](#12-vben-modal)
  - [1.3 Vben Table](#13-vben-table)
- [二、Ant Design Vue 组件](#二ant-design-vue-组件)
  - [2.1 Table 表格](#21-table-表格)
  - [2.2 Form 表单](#22-form-表单)
  - [2.3 Modal 弹窗](#23-modal-弹窗)
  - [2.4 Tree 树形控件](#24-tree-树形控件)
  - [2.5 其他常用组件](#25-其他常用组件)
- [三、VxeTable 组件](#三vxetable-组件)
  - [3.1 基础表格](#31-基础表格)
  - [3.2 树形表格](#32-树形表格)
  - [3.3 虚拟滚动](#33-虚拟滚动)
- [四、请求封装](#四请求封装)
  - [4.1 @vben/request](#41-vbenrequest)
  - [4.2 拦截器配置](#42-拦截器配置)
- [五、路由与权限](#五路由与权限)
  - [5.1 路由配置](#51-路由配置)
  - [5.2 权限控制](#52-权限控制)
- [六、状态管理](#六状态管理)
  - [6.1 Pinia Store](#61-pinia-store)
- [七、工具函数](#七工具函数)
- [八、最佳实践](#八最佳实践)
- [九、常见问题](#九常见问题)

---

## 框架概述

### 什么是 Vben Admin？

Vben Admin 是一个基于 Vue 3、Vite、TypeScript 的现代化中后台前端解决方案，提供了开箱即用的企业级功能。

### 核心特性

- ✅ **现代技术栈**: Vue 3 + Vite 5 + TypeScript
- ✅ **UI 组件库**: Ant Design Vue 4.x
- ✅ **Monorepo 架构**: pnpm workspace 管理
- ✅ **权限系统**: 完整的 RBAC 权限控制
- ✅ **动态路由**: 基于后端数据的动态路由
- ✅ **国际化**: 内置 i18n 支持
- ✅ **主题配置**: 灵活的主题定制
- ✅ **Mock 方案**: 开发阶段的数据模拟

### 为什么选择 Vben Admin？

| 对比项   | 传统 Vue 项目 | Vben Admin     |
| -------- | ------------- | -------------- |
| 项目结构 | 需自行设计    | 规范化、模块化 |
| 权限系统 | 需自行实现    | 开箱即用       |
| 组件封装 | 需自行封装    | 丰富的业务组件 |
| 开发效率 | 基础          | 提升 30-50%    |
| 代码质量 | 依赖团队      | 统一规范       |
| 维护成本 | 较高          | 较低           |

### 官方资源

- 📖 官方文档: https://doc.vben.pro/
- 💻 GitHub: https://github.com/vbenjs/vue-vben-admin
- 🎨 在线预览: https://vben.pro/
- 💬 Discord: https://discord.gg/fXemNNaA

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 安装步骤

#### 1. 下载项目

```bash
# 方式1: 使用 degit (推荐)
npx degit vbenjs/vue-vben-admin emp-vben-admin

# 方式2: 克隆仓库
git clone https://github.com/vbenjs/vue-vben-admin.git emp-vben-admin
```

#### 2. 安装依赖

```bash
cd emp-vben-admin

# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

#### 3. 启动项目

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 常用命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm typecheck

# 清理缓存
pnpm clean
```

---

## 核心概念

### Monorepo 架构

Vben Admin 使用 pnpm workspace 管理多包项目:

```
emp-vben-admin/
├── apps/              # 应用目录
│   └── web-antd/     # 主应用 (Ant Design Vue)
├── packages/          # 共享包
│   ├── @vben/        # 核心包
│   ├── common-ui/    # 通用 UI 组件
│   ├── hooks/        # 通用 Hooks
│   ├── request/      # 请求封装
│   └── utils/        # 工具函数
└── internal/          # 内部工具
    ├── vite-config/  # Vite 配置
    └── tsconfig/     # TypeScript 配置
```

**优势**:

- 代码复用性高
- 依赖管理统一
- 构建效率提升
- 版本控制简单

---

## 一、Vben 核心组件

### 1.1 Vben Form

#### 基本用法

```vue
<template>
  <Modal title="用户信息">
    <Form class="mx-4" />
  </Modal>
</template>

<script lang="ts" setup>
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  // 通用配置
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },

  // 布局配置
  wrapperClass: 'grid-cols-2', // 两列布局
  layout: 'horizontal', // 水平布局

  // 表单项配置
  schema: [
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      rules: 'required|email',
      componentProps: {
        placeholder: '请输入邮箱',
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
  ],

  // 不显示默认按钮
  showDefaultActions: false,
});
</script>
```

#### 常用组件类型

| 组件类型      | 说明       | 示例                         |
| ------------- | ---------- | ---------------------------- |
| Input         | 输入框     | `component: 'Input'`         |
| InputNumber   | 数字输入框 | `component: 'InputNumber'`   |
| Textarea      | 文本域     | `component: 'Textarea'`      |
| Select        | 下拉选择   | `component: 'Select'`        |
| RadioGroup    | 单选框组   | `component: 'RadioGroup'`    |
| CheckboxGroup | 复选框组   | `component: 'CheckboxGroup'` |
| DatePicker    | 日期选择   | `component: 'DatePicker'`    |
| TreeSelect    | 树形选择   | `component: 'TreeSelect'`    |

#### 表单验证规则

```typescript
// 内置规则
rules: 'required'; // 必填
rules: 'required|email'; // 必填且邮箱格式
rules: 'required|min:6'; // 必填且最小长度6
rules: 'required|max:20'; // 必填且最大长度20
rules: 'required|min:6|max:20'; // 组合规则

// 自定义规则
rules: [
  { required: true, message: '请输入用户名' },
  { min: 3, max: 20, message: '长度在3-20之间' },
  {
    validator: (rule, value) => {
      if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        return Promise.reject('只能包含字母、数字和下划线');
      }
      return Promise.resolve();
    },
  },
];
```

#### 表单API方法

```typescript
// 设置表单值
await formApi.setValues({
  username: 'admin',
  email: 'admin@example.com',
});

// 获取表单值
const values = await formApi.getValues();

// 验证表单
const { valid, errors } = await formApi.validate();

// 重置表单
formApi.resetFields();

// 设置字段值
formApi.setFieldValue('username', 'newValue');

// 获取字段值
const username = formApi.getFieldValue('username');

// 显示/隐藏字段
formApi.updateSchema({
  fieldName: 'email',
  componentProps: {
    show: false,
  },
});
```

#### 动态表单

```typescript
const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      componentProps: {
        options: [
          { label: '个人', value: 1 },
          { label: '企业', value: 2 },
        ],
      },
    },
    {
      fieldName: 'companyName',
      label: '企业名称',
      component: 'Input',
      // 根据类型字段动态显示
      dependencies: {
        triggerFields: ['type'],
        show: (values) => values.type === 2,
      },
    },
  ],
});
```

#### 表单布局

```typescript
// 单列布局
wrapperClass: 'grid-cols-1'

// 两列布局
wrapperClass: 'grid-cols-2'

// 三列布局
wrapperClass: 'grid-cols-3'

// 某个字段占满整行
{
  fieldName: 'remark',
  label: '备注',
  component: 'Textarea',
  formItemClass: 'col-span-2', // 占2列
}
```

---

### 1.2 Vben Modal

#### 基本用法

```vue
<template>
  <Page>
    <FormModal @success="onRefresh" />

    <AButton @click="handleCreate">新增</AButton>
  </Page>
</template>

<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import UserFormModal from './components/UserFormModal.vue';

// 创建Modal实例
const [FormModal, modalApi] = useVbenModal({
  connectedComponent: UserFormModal,
  destroyOnClose: true, // 关闭时销毁
});

// 打开弹窗
function handleCreate() {
  modalApi.open();
}

// 打开弹窗并传递数据
function handleEdit(row: any) {
  modalApi.setData(row).open();
}

// 刷新列表
function onRefresh() {
  loadData();
}
</script>
```

#### Modal组件定义

```vue
<template>
  <Modal title="用户信息" class="w-1/2">
    <Form class="mx-4" />
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';

defineOptions({
  name: 'UserFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

// 表单配置
const [Form, formApi] = useVbenForm({
  schema: [
    // ... 表单项配置
  ],
  showDefaultActions: false,
});

// Modal配置
const [Modal, modalApi] = useVbenModal({
  // 确认回调
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock(); // 锁定弹窗
    try {
      const values = await formApi.getValues();

      if (formData.value?.id) {
        // 编辑
        await updateUserApi({ ...formData.value, ...values });
        message.success('更新成功');
      } else {
        // 新增
        await createUserApi(values);
        message.success('创建成功');
      }

      await modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock(); // 解锁弹窗
    }
  },

  // 打开/关闭回调
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }

    // 加载数据
    const data = modalApi.getData();
    if (!data || !data.id) return;

    modalApi.lock();
    try {
      formData.value = await getUserDetailApi(data.id);
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>
```

#### Modal API方法

```typescript
// 打开弹窗
modalApi.open();

// 关闭弹窗
modalApi.close();

// 设置数据
modalApi.setData({ id: 1, name: 'test' });

// 获取数据
const data = modalApi.getData();

// 锁定弹窗(禁用确认按钮)
modalApi.lock();

// 解锁弹窗
modalApi.unlock();

// 链式调用
modalApi.setData(data).open();
```

#### Modal尺寸

```vue
<!-- 小尺寸 -->
<Modal title="标题" class="w-1/3"></Modal>
```

---

### 1.3 Vben VxeGrid (推荐)

#### 基本用法

使用 `useVbenVxeGrid` 是 Vben Admin 中最推荐的表格实现方式，它集成了 VxeTable 的强大功能。

```vue
<template>
  <Page auto-content-height title="字典管理" description="字典类型管理">
    <Grid>
      <!-- 工具栏按钮 -->
      <template #toolbar-buttons>
        <ASpace>
          <AButton type="primary" @click="handleCreate">新增</AButton>
          <AButton @click="handleRefresh">刷新</AButton>
        </ASpace>
      </template>

      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <ATag :color="row.status === 1 ? 'success' : 'error'">
          {{ row.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <ASpace>
          <AButton size="small" type="link" @click="handleEdit(row)">
            编辑
          </AButton>
          <APopconfirm title="确定要删除吗？" @confirm="handleDelete(row)">
            <AButton danger size="small" type="link">删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </Grid>

    <FormModal @success="onRefresh" />
  </Page>
</template>

<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';
import { Button, message, Popconfirm, Space, Tag } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictTypePage, deleteDictType } from '#/api/sys/dict';
import DictTypeFormModal from './components/DictTypeFormModal.vue';

const AButton = Button;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

// 创建表格实例
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'seq', width: 60, title: '序号' },
      { field: 'dictName', title: '字典名称', minWidth: 150 },
      { field: 'dictType', title: '字典类型', minWidth: 150 },
      {
        field: 'status',
        title: '状态',
        width: 100,
        slots: { default: 'status' },
      },
      { field: 'remark', title: '备注', minWidth: 200 },
      {
        field: 'createTime',
        title: '创建时间',
        width: 180,
        formatter: ({ cellValue }) => {
          if (!cellValue) return '';
          return cellValue.replace('T', ' ').slice(0, 19);
        },
      },
      {
        field: 'action',
        title: '操作',
        width: 220,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getDictTypePage({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });

          return {
            total: result.totalRow,
            items: result.records,
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    exportConfig: {},
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      zoom: true,
      slots: {
        buttons: 'toolbar-buttons',
      },
    },
  },
});

// 创建弹窗实例
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: DictTypeFormModal,
  destroyOnClose: true,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 新增 */
function handleCreate() {
  formModalApi.open();
}

/** 编辑 */
function handleEdit(row: any) {
  formModalApi.setData(row).open();
}

/** 删除 */
async function handleDelete(row: any) {
  try {
    await deleteDictType(row.id);
    message.success('删除成功');
    onRefresh();
  } catch (error) {
    console.error('删除失败:', error);
  }
}
</script>
```

#### Grid API 方法

```typescript
// 刷新表格数据
gridApi.query();

// 获取表格数据
const data = gridApi.getData();

// 获取选中行
const selectedRows = gridApi.getCheckboxRecords();

// 清空选中
gridApi.clearCheckboxRow();

// 设置选中行
gridApi.setCheckboxRow(rows, checked);
```

#### 列配置选项

```typescript
{
  field: 'fieldName',        // 字段名
  title: '列标题',           // 列标题
  width: 150,                // 固定宽度
  minWidth: 150,             // 最小宽度
  fixed: 'left',             // 固定列: 'left' | 'right'
  align: 'center',           // 对齐方式
  slots: { default: 'slotName' }, // 自定义插槽
  formatter: ({ cellValue }) => {  // 格式化函数
    return cellValue;
  },
  sortable: true,            // 可排序
  filters: [],               // 筛选器
}
```

#### 重要配置说明

1. **Page 组件必须添加 `auto-content-height`**：确保表格高度自适应
2. **proxyConfig.ajax.query 返回格式**：必须返回 `{ total, items }` 格式
3. **FormModal 必须放在 Page 内部**：避免多个根元素导致页面空白
4. **路由配置添加 `keepAlive: false`**：避免页面缓存问题

```typescript
// 路由配置示例
{
  name: 'SystemDict',
  path: '/system/dict',
  component: () => import('#/views/system/dict/index.vue'),
  meta: {
    title: '字典管理',
    keepAlive: false,  // 禁用缓存
  },
}
```

---

## 二、Ant Design Vue 组件

### 2.1 Table 表格

#### 自定义列渲染

```vue
<template>
  <ATable :columns="columns" :data-source="dataSource">
    <template #bodyCell="{ column, record }">
      <!-- 状态列 -->
      <template v-if="column.key === 'status'">
        <ATag :color="record.status === 1 ? 'green' : 'red'">
          {{ record.status === 1 ? '正常' : '停用' }}
        </ATag>
      </template>

      <!-- 操作列 -->
      <template v-if="column.key === 'action'">
        <ASpace>
          <AButton type="link" size="small" @click="handleEdit(record)">
            编辑
          </AButton>
          <APopconfirm title="确定要删除吗？" @confirm="handleDelete(record)">
            <AButton type="link" size="small" danger>删除</AButton>
          </APopconfirm>
        </ASpace>
      </template>
    </template>
  </ATable>
</template>
```

#### 表格配置选项

```typescript
const columns = [
  {
    title: '列标题',
    dataIndex: 'fieldName', // 数据字段名
    key: 'uniqueKey', // 唯一标识
    width: 150, // 列宽
    fixed: 'left', // 固定列: 'left' | 'right'
    align: 'center', // 对齐方式
    ellipsis: true, // 超出省略
    sorter: true, // 排序
  },
];

const tableConfig = {
  rowKey: 'id', // 行唯一标识
  loading: false, // 加载状态
  bordered: true, // 显示边框
  size: 'middle', // 尺寸: 'small' | 'middle' | 'large'
  scroll: { x: 1000, y: 500 }, // 滚动配置
};
```

---

### 2.2 Form 表单

#### 基本用法

```vue
<template>
  <AForm
    :model="formData"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
    @finish="handleSubmit"
  >
    <AFormItem label="用户名" name="username">
      <AInput v-model:value="formData.username" />
    </AFormItem>

    <AFormItem label="邮箱" name="email">
      <AInput v-model:value="formData.email" />
    </AFormItem>

    <AFormItem :wrapper-col="{ offset: 6, span: 18 }">
      <AButton type="primary" html-type="submit">提交</AButton>
    </AFormItem>
  </AForm>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { Form, Input, Button } from 'ant-design-vue';

const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const AButton = Button;

const formData = reactive({
  username: '',
  email: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '长度在3-20之间' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
  ],
};

function handleSubmit(values: any) {
  console.log('提交:', values);
}
</script>
```

---

### 2.3 Modal 弹窗

#### 基本用法

```vue
<template>
  <AButton @click="visible = true">打开弹窗</AButton>

  <AModal
    v-model:open="visible"
    title="标题"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <p>弹窗内容</p>
  </AModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Modal, Button } from 'ant-design-vue';

const AModal = Modal;
const AButton = Button;

const visible = ref(false);

function handleOk() {
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}
</script>
```

#### 确认对话框

```typescript
import { Modal } from 'ant-design-vue';

// 确认对话框
Modal.confirm({
  title: '确认删除',
  content: '确定要删除这条记录吗？',
  onOk() {
    // 确认操作
  },
});

// 信息提示
Modal.info({
  title: '提示',
  content: '操作成功',
});

// 成功提示
Modal.success({
  title: '成功',
  content: '保存成功',
});

// 错误提示
Modal.error({
  title: '错误',
  content: '操作失败',
});
```

---

### 2.4 Tree 树形控件

#### 基本用法

```vue
<template>
  <ATree
    v-model:checkedKeys="checkedKeys"
    checkable
    :tree-data="treeData"
    :field-names="{ title: 'name', key: 'id', children: 'children' }"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Tree } from 'ant-design-vue';

const ATree = Tree;

const treeData = ref([
  {
    id: 1,
    name: '父节点1',
    children: [
      { id: 11, name: '子节点1-1' },
      { id: 12, name: '子节点1-2' },
    ],
  },
  {
    id: 2,
    name: '父节点2',
    children: [{ id: 21, name: '子节点2-1' }],
  },
]);

const checkedKeys = ref<number[]>([11, 21]);
</script>
```

#### 树形配置

```typescript
const treeConfig = {
  checkable: true, // 显示复选框
  selectable: true, // 可选择
  multiple: false, // 多选
  showLine: true, // 显示连接线
  showIcon: false, // 显示图标
  defaultExpandAll: true, // 默认展开所有
  checkStrictly: false, // 父子节点不关联
};
```

---

### 2.5 其他常用组件

#### Button 按钮

```vue
<AButton type="primary">主要按钮</AButton>
<AButton type="default">默认按钮</AButton>
<AButton type="dashed">虚线按钮</AButton>
<AButton type="link">链接按钮</AButton>
<AButton type="text">文本按钮</AButton>
<AButton danger>危险按钮</AButton>
<AButton loading>加载中</AButton>
<AButton disabled>禁用按钮</AButton>
```

#### Input 输入框

```vue
<AInput v-model:value="value" placeholder="请输入" />
<AInputPassword v-model:value="password" placeholder="请输入密码" />
<AInputNumber v-model:value="number" :min="0" :max="100" />
<ATextarea v-model:value="text" :rows="4" />
```

#### Select 选择器

```vue
<ASelect v-model:value="value" :options="options" placeholder="请选择" />

<script setup>
const options = [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 },
];
</script>
```

#### Message 消息提示

```typescript
import { message } from 'ant-design-vue';

message.success('成功提示');
message.error('错误提示');
message.warning('警告提示');
message.info('信息提示');
message.loading('加载中...');
```

---

## 三、VxeTable 组件

### 3.1 基础表格

```vue
<template>
  <VxeGrid v-bind="gridOptions" />
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const gridOptions = reactive({
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '名称', width: 150 },
    { field: 'status', title: '状态', width: 100 },
  ],
  data: [],
  loading: false,
});
</script>
```

### 3.2 树形表格

```vue
<template>
  <VxeGrid v-bind="gridOptions" :tree-config="{ children: 'children' }" />
</template>
```

### 3.3 虚拟滚动

```vue
<template>
  <VxeGrid v-bind="gridOptions" :scroll-y="{ enabled: true }" height="600" />
</template>
```

参考文档: [Vxe Table 官方文档](https://vxetable.cn/#/component/grid/colResizable/mode)

---

## 四、请求封装

### 4.1 @vben/request

#### 基本用法

```typescript
import { requestClient } from '#/api/request';

// GET请求
const user = await requestClient.get<User>('/api/user/1');

// POST请求
const result = await requestClient.post<Result>('/api/user', {
  username: 'admin',
  email: 'admin@example.com',
});

// PUT请求
await requestClient.put('/api/user/1', userData);

// DELETE请求
await requestClient.delete('/api/user/1');

// 带参数的GET请求
const list = await requestClient.get<User[]>('/api/users', {
  params: {
    page: 1,
    size: 20,
  },
});
```

---

## 五、路由与权限

### 5.1 路由配置

```typescript
// router/routes/modules/system.ts
export default {
  path: '/system',
  name: 'System',
  component: () => import('#/layouts/index.vue'),
  meta: {
    title: '系统管理',
    icon: 'ion:settings-outline',
  },
  children: [
    {
      path: 'user',
      name: 'SystemUser',
      component: () => import('#/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
      },
    },
  ],
};
```

---

## 六、状态管理

### 6.1 Pinia Store

```typescript
// store/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userInfo: null,
  }),

  actions: {
    setToken(token: string) {
      this.token = token;
    },

    setUserInfo(info: any) {
      this.userInfo = info;
    },
  },
});
```

---

## 七、工具函数

### 树形数据处理

```typescript
// 构建树形结构
function buildTree(items: any[], parentId: number = 0): any[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

// 获取所有叶子节点
function getLeafNodes(tree: any[]): any[] {
  const leaves: any[] = [];

  function traverse(nodes: any[]) {
    nodes.forEach((node) => {
      if (!node.children || node.children.length === 0) {
        leaves.push(node);
      } else {
        traverse(node.children);
      }
    });
  }

  traverse(tree);
  return leaves;
}
```

---

## 八、最佳实践

### 8.1 组件命名

- 页面组件: `UserManagement.vue`
- 弹窗组件: `UserFormModal.vue`
- 业务组件: `UserTable.vue`

### 8.2 代码组织

```vue
<script lang="ts" setup>
// 1. 导入
import { ref, onMounted } from 'vue';

// 2. 组件定义
defineOptions({ name: 'UserManagement' });

// 3. 响应式数据
const dataSource = ref([]);

// 4. 方法定义
async function loadData() {}

// 5. 生命周期
onMounted(() => {});
</script>
```

### 8.3 错误处理

```typescript
try {
  await createUserApi(userData);
  message.success('创建成功');
} catch (error) {
  console.error('创建失败:', error);
}
```

---

## 九、常见问题

### Q1: 如何处理表格数据格式？

```typescript
// 后端返回格式
{
  records: [],
  totalRow: 0,
  pageNum: 1,
  pageSize: 20
}

// 前端使用
dataSource.value = result.records;
pagination.value.total = result.totalRow;
```

### Q2: 如何实现树形数据的半选状态？

只返回叶子节点ID,Tree组件会自动处理父节点的半选状态。

### Q3: 如何防止登录过期弹出多个弹窗？

使用标志位控制:

```typescript
let isShowLoginExpiredModal = false;

if (!isShowLoginExpiredModal) {
  isShowLoginExpiredModal = true;
  // 显示弹窗
}
```

---

## 更新日志

### 2025-11-03

- 添加 `useVbenVxeGrid` 完整使用示例
- 添加字典管理实战案例
- 补充 Grid API 方法说明
- 添加重要配置注意事项
- 更新最佳实践

### 2025-10-21

- 初始版本
- 添加 Vben Form、Modal、Table 使用说明
- 添加 Ant Design Vue 常用组件
- 添加 VxeTable 基础用法
- 添加请求封装说明

### 待补充

- [ ] 更多高级用法示例
- [ ] 性能优化技巧
- [ ] 复杂表单场景

---

**参考资料**:

- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Ant Design Vue 文档](https://antdv.com/)
- [VxeTable 文档](https://vxetable.cn/)


---

## 十、布局与主题

### 10.1 BasicLayout 插槽系统

BasicLayout 提供了多个插槽用于自定义布局内容。

#### 可用插槽

| 插槽名称 | 说明 | 示例 |
|---------|------|------|
| `#logo` | Logo 区域 | 自定义 Logo |
| `#menu` | 侧边菜单 | 自定义菜单 |
| `#user-dropdown` | 用户下拉菜单 | 用户信息展示 |
| `#notification` | 通知图标 | 消息通知 |
| `#header-right-{index}` | 头部右侧工具栏 | 自定义按钮 |
| `#header-left-{index}` | 头部左侧工具栏 | 自定义按钮 |
| `#extra` | 额外内容 | 全局弹窗等 |

#### 头部工具栏插槽

头部工具栏支持动态插槽，通过 index 控制显示顺序：

```vue
<template>
  <BasicLayout>
    <!-- 租户切换按钮 - 显示在通知按钮(index 50)之前 -->
    <template #header-right-45>
      <ADropdown placement="bottomRight" :trigger="['click']">
        <AButton size="small" class="mr-1">
          <span class="mr-1">🏢</span>
          <span>{{ currentTenantName }}</span>
          <span class="ml-1">▼</span>
        </AButton>
        <template #overlay>
          <AMenu>
            <AMenuItem
              v-for="tenant in userTenants"
              :key="tenant.tenantId"
              @click="handleSwitchTenant(tenant.tenantId)"
            >
              {{ tenant.tenantName }}
            </AMenuItem>
          </AMenu>
        </template>
      </ADropdown>
    </template>
  </BasicLayout>
</template>
```

#### 内置工具栏顺序

| Index | 组件 | 说明 |
|-------|------|------|
| 50 | global-search | 全局搜索 |
| 60 | preferences | 偏好设置 |
| 70 | theme-toggle | 主题切换 |
| 80 | language-toggle | 语言切换 |
| 90 | fullscreen | 全屏 |
| 100 | notification | 通知 |
| 150 | user-dropdown | 用户下拉 |

### 10.2 主题适配

#### 使用语义化类名

Vben 提供了一套语义化的 CSS 类名，会自动适应浅色/深色主题：

```vue
<!-- ❌ 错误：使用固定颜色 -->
<div class="bg-white text-black border-gray-200">
  内容
</div>

<!-- ✅ 正确：使用语义化类名 -->
<div class="bg-card text-foreground border-border">
  内容
</div>
```

#### 常用主题类名

| 类名 | 说明 | 浅色主题 | 深色主题 |
|------|------|----------|----------|
| `bg-background` | 页面背景 | 白色 | 深灰 |
| `bg-card` | 卡片背景 | 白色 | 深灰 |
| `bg-popover` | 弹出层背景 | 白色 | 深灰 |
| `text-foreground` | 主要文字 | 黑色 | 白色 |
| `text-muted-foreground` | 次要文字 | 灰色 | 浅灰 |
| `border-border` | 边框 | 浅灰 | 深灰 |
| `border-input` | 输入框边框 | 灰色 | 深灰 |

#### 实战示例：搜索表单

```vue
<template>
  <!-- 搜索表单 - 自动适应主题 -->
  <div class="bg-card border-border mb-4 rounded border p-4">
    <AForm layout="inline">
      <AFormItem label="用户名">
        <AInput placeholder="请输入用户名" style="width: 200px" />
      </AFormItem>
      <AFormItem>
        <ASpace>
          <AButton type="primary" @click="handleSearch">搜索</AButton>
          <AButton @click="handleReset">重置</AButton>
        </ASpace>
      </AFormItem>
    </AForm>
  </div>
</template>
```

---

## 十一、认证与登录

### 11.1 登录过期处理

#### 设置过期标识

在多个地方设置登录过期标识，确保用户看到正确的提示：

```typescript
// 1. 路由守卫中设置
// router/guard.ts
if (!accessStore.accessToken) {
  const isExpired = from.path !== LOGIN_PATH && from.matched.length > 0;
  
  if (isExpired) {
    localStorage.setItem('login_expired', '1');
  }
  
  return {
    path: LOGIN_PATH,
    query: {
      ...(isExpired ? { expired: '1' } : {}),
    },
  };
}

// 2. API 拦截器中设置
// api/request.ts
async function doReAuthenticate() {
  localStorage.setItem('login_expired', '1');
  await authStore.logout();
}

// 3. 主动退出时清除
// store/auth.ts
async function logout() {
  localStorage.removeItem('login_expired');
  await router.replace({ path: LOGIN_PATH });
}
```

#### 登录页面检测过期

```vue
<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :title="isExpired ? '登录已过期 ⏰' : `${$t('authentication.welcomeBack')} 👋🏻`"
    :sub-title="isExpired ? '您的登录已过期，请重新登录以继续使用' : $t('authentication.loginSubtitle')"
    @submit="authStore.authLogin"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 检查是否过期
const isExpired = computed(() => {
  return route.query.expired === '1' || localStorage.getItem('login_expired') === '1';
});

// 登录成功后清除标识
watch(() => authStore.loginLoading, (loading, oldLoading) => {
  if (oldLoading && !loading) {
    localStorage.removeItem('login_expired');
  }
});
</script>
```

### 11.2 租户切换

#### 获取用户租户列表

```typescript
// api/core/auth.ts
export async function getUserTenantsApi() {
  return requestClient.get<TenantInfo[]>('/auth/user-tenants');
}

export async function switchTenantApi(tenantId: number) {
  return requestClient.post<UserInfo>('/auth/switch-tenant', null, {
    params: { tenantId },
  });
}
```

#### 实现租户切换

```vue
<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@vben/stores';
import { getUserTenantsApi, switchTenantApi } from '#/api';

const userStore = useUserStore();
const userTenants = ref<any[]>([]);

// 当前租户信息
const currentTenantId = computed(() => userStore.userInfo?.tenantId);
const currentTenantName = computed(() => userStore.userInfo?.tenantName || '未知单位');

// 加载租户列表
async function loadUserTenants() {
  try {
    localStorage.removeItem('currentTenantId'); // 清除旧的缓存
    const tenants = await getUserTenantsApi();
    userTenants.value = tenants || [];
  } catch (error) {
    console.error('加载租户列表失败:', error);
  }
}

// 切换租户
async function handleSwitchTenant(tenantId: number) {
  if (tenantId === currentTenantId.value) return;

  try {
    const backendUserInfo = await switchTenantApi(tenantId);
    
    // 转换为 Vben 格式
    const userInfo = {
      userId: backendUserInfo.userId?.toString() || '',
      username: backendUserInfo.username || '',
      realName: backendUserInfo.nickname || '',
      avatar: backendUserInfo.avatar || '',
      roles: backendUserInfo.roles || [],
      tenantId: backendUserInfo.tenantId,
      tenantCode: backendUserInfo.tenantCode,
      tenantName: backendUserInfo.tenantName,
    };

    userStore.setUserInfo(userInfo);
    message.success(`已切换到 ${backendUserInfo.tenantName}`);
    
    // 刷新页面
    await router.push('/');
  } catch (error) {
    message.error('切换单位失败');
  }
}

// 监听 userInfo 变化
watch(
  () => userStore.userInfo,
  (newUserInfo) => {
    if (newUserInfo && newUserInfo.tenantId) {
      loadUserTenants();
    }
  },
  { immediate: true }
);
</script>
```

---

## 十二、API 数据转换

### 12.1 字段映射对照

| 后端字段 | Vben 字段 | 说明 |
|---------|----------|------|
| `userId` | `userId` | 用户ID（转为字符串） |
| `username` | `username` | 用户名 |
| `nickname` | `realName` | 真实姓名 |
| `avatar` | `avatar` | 头像 |
| `remark` | `desc` | 描述 |
| `roles` | `roles` | 角色列表 |
| `tenantId` | `tenantId` | 租户ID |
| `tenantCode` | `tenantCode` | 租户编码 |
| `tenantName` | `tenantName` | 租户名称 |

---

## 十三、调试技巧

### 13.1 控制台调试

```typescript
// 添加详细的日志输出
console.log('用户租户列表:', tenants);
console.log('当前登录租户ID:', userStore.userInfo?.tenantId);
console.log('当前登录租户名称:', userStore.userInfo?.tenantName);
console.log('租户数量:', userTenants.value.length);
console.log('是否显示切换按钮:', userTenants.value.length > 1);
```

### 13.2 响应式数据检查

```typescript
// 使用 watch 监听数据变化
watch(
  () => userStore.userInfo,
  (newValue, oldValue) => {
    console.log('userInfo 变化:', { newValue, oldValue });
  },
  { immediate: true, deep: true }
);
```

### 13.3 常见问题排查

#### 问题：userInfo 为 undefined

```typescript
// 解决方案：延迟加载或使用 watch
onMounted(() => {
  // 方案1：延迟检查
  const checkAndLoad = () => {
    if (userStore.userInfo && userStore.userInfo.tenantId) {
      loadData();
    } else {
      setTimeout(checkAndLoad, 100);
    }
  };
  checkAndLoad();
});

// 方案2：使用 watch
watch(
  () => userStore.userInfo?.tenantId,
  (tenantId) => {
    if (tenantId) {
      loadData();
    }
  },
  { immediate: true }
);
```

#### 问题：插槽不生效

```typescript
// 检查插槽名称是否正确
// ❌ 错误
<template #toolbar-actions>

// ✅ 正确
<template #header-right-45>
```

#### 问题：主题切换后样式不变

```typescript
// 检查是否使用了固定颜色类
// ❌ 错误
class="bg-white text-black"

// ✅ 正确
class="bg-card text-foreground"
```

---

## 📈 项目进度

### ✅ 已完成功能

#### 基础功能模块
- [x] 用户管理 (CRUD + 权限分配 + 数据权限)
- [x] 角色管理 (CRUD + 权限分配 + 数据范围)
- [x] 菜单管理 (树形结构 + 权限控制)
- [x] 部门管理 (树形结构)
- [x] 岗位管理 (CRUD)
- [x] 字典管理 (类型 + 数据)
- [x] 配置管理 (系统配置)

#### 高级功能模块
- [x] 文件管理 (上传 + MinIO 集成)
- [x] 站内消息 (发送 + 接收 + 通知 + 双击查看)
- [x] 消息模板 (模板管理)
- [x] 租户管理 (多租户支持 + 租户切换)

#### 认证与权限
- [x] 登录认证 (JWT + 权限验证)
- [x] 登录过期处理 (友好提示)
- [x] 动态路由 (基于权限)
- [x] 数据权限 (自定义数据范围)
- [x] 租户隔离 (数据隔离)

#### 用户体验优化
- [x] 主题切换 (浅色/深色自适应)
- [x] 时间格式化显示
- [x] 消息通知 (右上角通知图标)
- [x] 双击查看详情
- [x] Modal 数据传递优化

### 🚧 进行中功能

- [ ] WebSocket 实时通知
- [ ] 操作日志记录
- [ ] 系统监控面板

### 📋 待开发功能

- [ ] 定时任务管理
- [ ] 代码生成器
- [ ] 接口文档集成
- [ ] 数据备份恢复
- [ ] 多语言支持完善

### 🎯 技术债务

- [ ] 单元测试覆盖
- [ ] E2E 测试
- [ ] 性能优化
- [ ] 代码规范检查

---

## 📝 更新日志

### 2025-11-17

- ✅ 完成消息通知功能
- ✅ 修复 Modal 数据传递问题 (`modalApi.setData(data).open()`)
- ✅ 添加时间格式化显示
- ✅ 完善双击查看功能
- ✅ 合并学习指南到组件指南
- ✅ 更新项目进度文档

### 2025-11-04

- 添加 BasicLayout 插槽系统详细说明
- 添加主题适配最佳实践
- 添加登录过期处理完整方案
- 添加租户切换实现示例
- 添加 API 数据转换规范
- 添加调试技巧和常见问题排查

### 2025-11-03

- 添加 `useVbenVxeGrid` 完整使用示例
- 添加字典管理实战案例
- 补充 Grid API 方法说明
- 添加重要配置注意事项
- 更新最佳实践

### 2025-10-21

- 初始版本
- 添加 Vben Form、Modal、Table 使用说明
- 添加 Ant Design Vue 常用组件
- 添加 VxeTable 基础用法
- 添加请求封装说明


---

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📚 参考资料

### 官方文档

- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Ant Design Vue 文档](https://antdv.com/)
- [VxeTable 文档](https://vxetable.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [TailwindCSS 文档](https://tailwindcss.com/)

### 示例项目

- [yudao-ui-admin-vben](https://github.com/yudaocode/yudao-ui-admin-vben)
- [Vben Admin 示例](https://github.com/vbenjs/vue-vben-admin)

---

**文档维护**: 持续更新中  
**技术支持**: 开发团队
