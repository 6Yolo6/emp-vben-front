# Vben Admin 组件使用指南

> 本文档用于记录 Vben Admin 及相关技术栈的组件使用方法和最佳实践  
> 随着项目开发持续更新

**最后更新**: 2025-10-21  
**维护人员**: 开发团队

---

## 目录

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

### 1.3 Vben Table

#### 基本用法

```vue
<template>
  <Page auto-content-height>
    <div class="p-4">
      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      />
    </div>
  </Page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Table } from 'ant-design-vue';

const ATable = Table;

const dataSource = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 150,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
];

async function loadData() {
  loading.value = true;
  try {
    const result = await getUserPageApi({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    dataSource.value = result.records;
    pagination.value.total = result.totalRow;
  } finally {
    loading.value = false;
  }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
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

### 2025-10-21

- 初始版本
- 添加 Vben Form、Modal、Table 使用说明
- 添加 Ant Design Vue 常用组件
- 添加 VxeTable 基础用法
- 添加请求封装说明

### 待补充

- [ ] 更多组件示例
- [ ] 高级用法
- [ ] 性能优化技巧
- [ ] 实战案例

---

**参考资料**:

- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Ant Design Vue 文档](https://antdv.com/)
- [VxeTable 文档](https://vxetable.cn/)
