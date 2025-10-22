# Vben Admin 迁移实施计划

## 项目信息

- **迁移方案**：方案1 - 完全重写
- **开始时间**：2025-10-16
- **预计完成**：2025-10-30（15个工作日）
- **项目名称**：emp-vben-admin

## 阶段一：项目初始化（第1天）

### 1.1 下载 Vben Admin

```bash
# 方式1：使用 degit（推荐）
npx degit vbenjs/vue-vben-admin emp-vben-admin

# 方式2：克隆仓库
git clone https://github.com/vbenjs/vue-vben-admin.git emp-vben-admin

# 进入项目目录
cd emp-vben-admin

# 安装依赖（使用 pnpm）
pnpm install

# 启动项目
pnpm dev
```

### 1.2 项目结构调整

```
emp-vben-admin/
├── src/
│   ├── api/              # API接口
│   │   ├── sys/         # 系统管理API
│   │   │   ├── user.ts
│   │   │   ├── role.ts
│   │   │   ├── post.ts
│   │   │   ├── dept.ts
│   │   │   └── menu.ts
│   │   └── model/       # 数据模型
│   ├── views/           # 页面
│   │   ├── sys/        # 系统管理
│   │   │   ├── user/
│   │   │   ├── role/
│   │   │   ├── post/
│   │   │   ├── dept/
│   │   │   └── menu/
│   │   └── dashboard/  # 首页
│   ├── router/          # 路由
│   │   └── routes/
│   │       └── modules/
│   │           └── system.ts
│   ├── store/           # 状态管理
│   └── utils/           # 工具函数
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
└── package.json
```

### 1.3 清理示例代码

删除不需要的示例页面和路由：

- `src/views/demo/` - 删除所有demo页面
- `src/router/routes/modules/demo.ts` - 删除demo路由
- 保留 `dashboard`、`system` 等基础模块

### 1.4 配置环境变量

```bash
# .env.development
VITE_GLOB_APP_TITLE=EMP管理系统
VITE_PORT=3000
VITE_PROXY=[["/api","http://localhost:8080"]]
VITE_DROP_CONSOLE=false
```

```bash
# .env.production
VITE_GLOB_APP_TITLE=EMP管理系统
VITE_PUBLIC_PATH=/
VITE_DROP_CONSOLE=true
VITE_BUILD_COMPRESS=gzip
```

## 阶段二：基础配置（第2-3天）

### 2.1 配置后端代理

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### 2.2 配置 Axios

```typescript
// src/utils/http/axios/index.ts
import { defHttp } from '@/utils/http/axios';

// 配置请求拦截器
defHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 配置响应拦截器
defHttp.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code === 200) {
      return data;
    } else {
      // 错误处理
      return Promise.reject(new Error(message));
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);
```

### 2.3 定义数据模型

```typescript
// src/api/model/userModel.ts
export interface User {
  id?: number;
  username: string;
  nickName?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  sex?: number;
  avatar?: string;
  status?: number;
  deptId?: number;
  postIds?: number[];
  roleIds?: number[];
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface UserPageParams {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  nickName?: string;
  phoneNumber?: string;
  status?: number;
  deptId?: number;
}

export interface UserPageResult {
  records: User[];
  totalRow: number;
  pageNum: number;
  pageSize: number;
}
```

### 2.4 创建API接口

```typescript
// src/api/sys/user.ts
import { defHttp } from '@/utils/http/axios';
import type { User, UserPageParams, UserPageResult } from '../model/userModel';

enum Api {
  UserPage = '/system/user/page',
  UserList = '/system/user/list',
  UserDetail = '/system/user',
  UserCreate = '/system/user',
  UserUpdate = '/system/user',
  UserDelete = '/system/user',
  UserStatus = '/system/user',
  UserPassword = '/system/user',
  UserRoles = '/system/user',
  UserPosts = '/system/user',
}

export function getUserPage(params: UserPageParams) {
  return defHttp.get<UserPageResult>({ url: Api.UserPage, params });
}

export function getUserList() {
  return defHttp.get<User[]>({ url: Api.UserList });
}

export function getUserDetail(id: number) {
  return defHttp.get<User>({ url: `${Api.UserDetail}/${id}` });
}

export function createUser(data: User) {
  return defHttp.post({ url: Api.UserCreate, data });
}

export function updateUser(id: number, data: User) {
  return defHttp.put({ url: `${Api.UserUpdate}/${id}`, data });
}

export function deleteUser(id: number) {
  return defHttp.delete({ url: `${Api.UserDelete}/${id}` });
}

export function updateUserStatus(id: number, status: number) {
  return defHttp.put({
    url: `${Api.UserStatus}/${id}/status`,
    params: { status },
  });
}

export function resetUserPassword(id: number, newPassword: string) {
  return defHttp.put({
    url: `${Api.UserPassword}/${id}/password`,
    params: { newPassword },
  });
}

export function getUserRoles(id: number) {
  return defHttp.get<number[]>({ url: `${Api.UserRoles}/${id}/roles` });
}

export function assignUserRoles(id: number, roleIds: number[]) {
  return defHttp.post({ url: `${Api.UserRoles}/${id}/roles`, data: roleIds });
}

export function getUserPosts(id: number) {
  return defHttp.get<number[]>({ url: `${Api.UserPosts}/${id}/posts` });
}

export function assignUserPosts(id: number, postIds: number[]) {
  return defHttp.post({ url: `${Api.UserPosts}/${id}/posts`, data: postIds });
}
```

### 2.5 配置路由

```typescript
// src/router/routes/modules/system.ts
import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';

const system: AppRouteModule = {
  path: '/system',
  name: 'System',
  component: LAYOUT,
  redirect: '/system/user',
  meta: {
    orderNo: 10,
    icon: 'ion:settings-outline',
    title: '系统管理',
  },
  children: [
    {
      path: 'user',
      name: 'UserManagement',
      component: () => import('@/views/sys/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'ion:person-outline',
      },
    },
    {
      path: 'role',
      name: 'RoleManagement',
      component: () => import('@/views/sys/role/index.vue'),
      meta: {
        title: '角色管理',
        icon: 'ion:people-outline',
      },
    },
    {
      path: 'post',
      name: 'PostManagement',
      component: () => import('@/views/sys/post/index.vue'),
      meta: {
        title: '岗位管理',
        icon: 'ion:briefcase-outline',
      },
    },
    {
      path: 'dept',
      name: 'DeptManagement',
      component: () => import('@/views/sys/dept/index.vue'),
      meta: {
        title: '部门管理',
        icon: 'ion:business-outline',
      },
    },
    {
      path: 'menu',
      name: 'MenuManagement',
      component: () => import('@/views/sys/menu/index.vue'),
      meta: {
        title: '菜单管理',
        icon: 'ion:menu-outline',
      },
    },
  ],
};

export default system;
```

## 阶段三：页面迁移（第4-10天）

### 3.1 用户管理页面（第4-5天）

#### 创建页面文件

```vue
<!-- src/views/sys/user/index.vue -->
<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate">新增用户</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <UserModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { BasicTable, useTable, TableAction } from '@/components/Table';
import { getUserPage, deleteUser } from '@/api/sys/user';
import { useModal } from '@/components/Modal';
import UserModal from './UserModal.vue';

const [registerModal, { openModal }] = useModal();
const [registerTable, { reload }] = useTable({
  title: '用户列表',
  api: getUserPage,
  columns: [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
    },
  ],
  formConfig: {
    labelWidth: 120,
    schemas: [
      {
        field: 'username',
        label: '用户名',
        component: 'Input',
        colProps: { span: 8 },
      },
      {
        field: 'nickName',
        label: '昵称',
        component: 'Input',
        colProps: { span: 8 },
      },
      {
        field: 'phoneNumber',
        label: '手机号',
        component: 'Input',
        colProps: { span: 8 },
      },
    ],
  },
  useSearchForm: true,
  showTableSetting: true,
  bordered: true,
  actionColumn: {
    width: 120,
    title: '操作',
    dataIndex: 'action',
    fixed: undefined,
  },
});

function handleCreate() {
  openModal(true, {
    isUpdate: false,
  });
}

function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
  });
}

async function handleDelete(record: Recordable) {
  await deleteUser(record.id);
  reload();
}

function handleSuccess() {
  reload();
}
</script>
```

#### 创建表单弹窗

```vue
<!-- src/views/sys/user/UserModal.vue -->
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '@/components/Modal';
import { BasicForm, useForm } from '@/components/Form/index';
import { createUser, updateUser } from '@/api/sys/user';

const emit = defineEmits(['success', 'register']);

const isUpdate = ref(true);
const rowId = ref('');

const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  labelWidth: 100,
  baseColProps: { span: 24 },
  schemas: [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      required: true,
      dynamicDisabled: ({ values }) => !!values.id,
    },
    {
      field: 'nickName',
      label: '昵称',
      component: 'Input',
      required: true,
    },
    {
      field: 'password',
      label: '密码',
      component: 'InputPassword',
      required: true,
      ifShow: ({ values }) => !values.id,
    },
    {
      field: 'email',
      label: '邮箱',
      component: 'Input',
    },
    {
      field: 'phoneNumber',
      label: '手机号',
      component: 'Input',
    },
    {
      field: 'sex',
      label: '性别',
      component: 'RadioButtonGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 },
          { label: '未知', value: 0 },
        ],
      },
    },
    {
      field: 'status',
      label: '状态',
      component: 'RadioButtonGroup',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '停用', value: 0 },
        ],
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
    },
  ],
  showActionButtonGroup: false,
});

const [registerModal, { setModalProps, closeModal }] = useModalInner(
  async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      setFieldsValue({
        ...data.record,
      });
    }
  },
);

const getTitle = computed(() => (!unref(isUpdate) ? '新增用户' : '编辑用户'));

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });

    if (unref(isUpdate)) {
      await updateUser(unref(rowId), values);
    } else {
      await createUser(values);
    }

    closeModal();
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
```

### 3.2 其他页面迁移（第6-10天）

按照相同的模式迁移：

- 角色管理（1天）
- 岗位管理（1天）
- 部门管理（1天）
- 菜单管理（1天）
- 权限系统（1天）

## 阶段四：权限系统（第11-12天）

### 4.1 动态路由

```typescript
// src/store/modules/permission.ts
import { defineStore } from 'pinia';
import { getUserMenuTree } from '@/api/sys/menu';
import { transformMenuToRoute } from '@/router/helper/menuHelper';

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: () => ({
    routes: [],
    dynamicAddedRoute: false,
  }),
  actions: {
    async buildRoutesAction() {
      const menuList = await getUserMenuTree();
      const routes = transformMenuToRoute(menuList);
      this.routes = routes;
      return routes;
    },
  },
});
```

### 4.2 按钮权限

```typescript
// src/directives/permission.ts
import { usePermission } from '@/hooks/web/usePermission';

export function setupPermissionDirective(app) {
  app.directive('auth', {
    mounted(el, binding) {
      const { hasPermission } = usePermission();
      const value = binding.value;
      if (!hasPermission(value)) {
        el.parentNode?.removeChild(el);
      }
    },
  });
}
```

## 阶段五：测试优化（第13-15天）

### 5.1 功能测试

- 用户管理CRUD
- 角色管理CRUD
- 岗位管理CRUD
- 部门管理CRUD
- 菜单管理CRUD
- 权限验证

### 5.2 性能优化

- 路由懒加载
- 组件懒加载
- 图片懒加载
- 代码分割

### 5.3 兼容性测试

- Chrome
- Firefox
- Edge
- Safari

## 迁移检查清单

### 项目初始化

- [ ] 下载 Vben Admin
- [ ] 安装依赖
- [ ] 启动项目
- [ ] 清理示例代码
- [ ] 配置环境变量

### 基础配置

- [ ] 配置后端代理
- [ ] 配置 Axios
- [ ] 定义数据模型
- [ ] 创建API接口
- [ ] 配置路由

### 页面迁移

- [ ] 用户管理
- [ ] 角色管理
- [ ] 岗位管理
- [ ] 部门管理
- [ ] 菜单管理

### 权限系统

- [ ] 动态路由
- [ ] 动态菜单
- [ ] 按钮权限
- [ ] 数据权限

### 测试优化

- [ ] 功能测试
- [ ] 性能优化
- [ ] 兼容性测试
- [ ] 文档编写

## 注意事项

### 1. 数据格式适配

Vben Admin 的表格组件期望的分页数据格式：

```typescript
{
  items: [],      // 数据列表
  total: 0,       // 总数
}
```

需要适配后端返回的格式：

```typescript
{
  records: [],    // 数据列表
  totalRow: 0,    // 总数
}
```

### 2. 图标使用

Vben Admin 使用 Iconify，需要适配图标名称：

```typescript
// Element Plus
<el-icon><User /></el-icon>

// Vben Admin
<Icon icon="ion:person-outline" />
```

### 3. 表单验证

Vben Admin 使用自己的表单验证规则，需要适配。

## 下一步行动

### 立即执行

1. 在项目根目录创建 `emp-vben-admin` 文件夹
2. 下载 Vben Admin 到该文件夹
3. 安装依赖并启动项目
4. 验证项目可以正常运行

### 命令

```bash
# 在项目根目录执行
npx degit vbenjs/vue-vben-admin emp-vben-admin
cd emp-vben-admin
pnpm install
pnpm dev
```

---

**创建时间**：2025-10-16  
**状态**：📋 计划已制定，准备开始  
**预计完成**：2025-10-30
