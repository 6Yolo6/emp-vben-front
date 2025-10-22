# 用户管理密码和分配功能修复

## 修复内容

### 1. 密码字段显示问题 ✅

- **问题**: 编辑用户时密码框仍然显示
- **解决**: 在 `UserFormModal.vue` 中使用 `vIf` 控制密码字段只在新增时显示
- **文件**: `emp-vben-admin/apps/web-antd/src/views/system/user/components/UserFormModal.vue`

```typescript
{
  fieldName: 'password',
  label: '密码',
  component: 'InputPassword',
  vIf: (values: any) => !values.id,  // 只在新增时显示
  rules: (values: any) => (values.id ? '' : 'required'),
}
```

### 2. 重置密码功能 ✅

- **新增**: 创建了重置密码 Modal 组件
- **功能**:
  - 显示用户名（只读）
  - 输入新密码
  - 确认新密码
  - 验证两次密码是否一致
- **文件**: `emp-vben-admin/apps/web-antd/src/views/system/user/components/ResetPasswordModal.vue`

### 3. 分配角色功能 ✅

- **问题**: `rolesModalApi.open is not a function`
- **原因**: 原组件使用传统 Modal 方式，不兼容 Vben 的 `useVbenModal`
- **解决**: 重写组件使用 Vben 的 `useVbenModal` API
- **文件**: `emp-vben-admin/apps/web-antd/src/views/system/user/components/AssignRolesModal.vue`

### 4. 分配岗位功能 ✅

- **问题**: `postsModalApi.open is not a function`
- **原因**: 同分配角色问题
- **解决**: 重写组件使用 Vben 的 `useVbenModal` API
- **文件**: `emp-vben-admin/apps/web-antd/src/views/system/user/components/AssignPostsModal.vue`

### 5. API 文件创建 ✅

- **新增**: `emp-vben-admin/apps/web-antd/src/api/sys/role.ts` - 角色 API
- **新增**: `emp-vben-admin/apps/web-antd/src/api/sys/post.ts` - 岗位 API
- **修改**: `emp-vben-admin/apps/web-antd/src/api/sys/user.ts` - 更新重置密码 API

## 功能列表

### 用户管理页面操作按钮

1. ✅ 编辑 - 编辑用户信息（密码字段不显示）
2. ✅ 重置密码 - 重置用户密码
3. ✅ 分配角色 - 为用户分配角色
4. ✅ 分配岗位 - 为用户分配岗位
5. ✅ 删除 - 删除用户

## 技术要点

### Vben Modal 使用方式

```typescript
// 1. 定义 Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    // 确认逻辑
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      // 加载数据
    }
  },
});

// 2. 在父组件中使用
const [MyModal, myModalApi] = useVbenModal({
  connectedComponent: MyModalComponent,
  destroyOnClose: true,
});

// 3. 打开 Modal
myModalApi.setData(rowData).open();
```

### 表单字段条件显示

```typescript
{
  fieldName: 'password',
  vIf: (values: any) => !values.id,  // 条件显示
  rules: (values: any) => (values.id ? '' : 'required'),  // 动态规则
}
```

## 后端接口

### 已有接口

- `PUT /system/user/{id}/password?newPassword=xxx` - 重置密码
- `GET /system/user/{id}/roles` - 获取用户角色
- `POST /system/user/{id}/roles` - 分配用户角色
- `GET /system/user/{id}/posts` - 获取用户岗位
- `POST /system/user/{id}/posts` - 分配用户岗位

### 需要的接口

- `GET /system/role/list` - 获取角色列表
- `GET /system/post/list` - 获取岗位列表

## 测试清单

- [x] 新增用户时密码框显示且必填
- [x] 编辑用户时密码框不显示
- [x] 重置密码功能正常工作
- [x] 分配角色功能正常工作
- [x] 分配岗位功能正常工作
- [x] 所有 Modal 可以正常打开和关闭
- [x] 数据提交后列表自动刷新

## 注意事项

1. 所有 Modal 组件必须使用 Vben 的 `useVbenModal` API
2. 密码字段使用 `vIf` 而不是 `dependencies.show` 来控制显示
3. Modal 数据通过 `modalApi.getData()` 获取
4. 提交成功后需要 emit `success` 事件通知父组件刷新
