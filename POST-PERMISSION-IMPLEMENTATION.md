# 岗位权限功能实现计划

## 背景

根据任务16的要求，需要完善岗位管理的权限分配功能，包括：

1. 岗位分配角色
2. 岗位分配菜单权限
3. 数据权限配置

## 后端API支持

### 1. 岗位角色API

```java
// 查询岗位的角色
GET /system/post/{id}/roles
Response: List<Long> roleIds

// 分配岗位角色
POST /system/post/{id}/roles
Request: List<Long> roleIds
```

### 2. 岗位菜单权限API

```java
// 查询岗位的菜单权限
GET /system/post/{id}/menus
Response: List<Long> menuIds

// 分配岗位菜单权限
POST /system/post/{id}/menus
Request: List<Long> menuIds
```

### 3. 数据权限枚举

```java
public enum DataScopeEnum {
    ALL(1, "全部数据权限"),
    DEPT(2, "本部门数据权限"),
    DEPT_AND_CHILD(3, "本部门及以下数据权限"),
    SELF(4, "仅本人数据权限"),
    CUSTOM(5, "自定义数据权限");
}
```

## 前端实现计划

### 第一步：创建岗位分配角色弹窗

#### 文件：`AssignPostRolesModal.vue`

**功能**：

- 显示所有角色列表
- 勾选岗位已分配的角色
- 支持搜索角色
- 保存角色分配

**组件结构**：

```vue
<template>
  <Modal title="分配角色" @ok="handleSubmit">
    <div class="mb-4">
      <Input placeholder="搜索角色" v-model:value="searchText" />
    </div>
    <CheckboxGroup v-model:value="selectedRoles">
      <Checkbox v-for="role in filteredRoles" :key="role.id" :value="role.id">
        {{ role.name }}
      </Checkbox>
    </CheckboxGroup>
  </Modal>
</template>
```

**API调用**：

```typescript
// 加载岗位角色
const postRoles = await getPostRolesApi(postId);

// 加载所有角色
const allRoles = await getRoleListApi();

// 保存角色分配
await assignPostRolesApi(postId, selectedRoles);
```

### 第二步：创建岗位分配菜单权限弹窗

#### 文件：`AssignPostMenusModal.vue`

**功能**：

- 显示菜单树
- 勾选岗位已分配的菜单
- 支持父子联动
- 支持半选状态
- 保存菜单权限

**组件结构**：

```vue
<template>
  <Modal title="分配菜单权限" @ok="handleSubmit">
    <Tree
      checkable
      :tree-data="menuTree"
      :checked-keys="checkedKeys"
      :half-checked-keys="halfCheckedKeys"
      @check="handleCheck"
      :field-names="{ title: 'name', key: 'id', children: 'children' }"
    />
  </Modal>
</template>
```

**API调用**：

```typescript
// 加载岗位菜单
const postMenus = await getPostMenusApi(postId);

// 加载菜单树
const menuTree = await getMenuTreeApi();

// 保存菜单权限
await assignPostMenusApi(postId, checkedKeys);
```

### 第三步：完善岗位表单的数据权限配置

#### 修改文件：`PostFormModal.vue`

**添加字段**：

```typescript
{
  fieldName: 'dataScope',
  label: '数据权限',
  component: 'RadioGroup',
  componentProps: {
    options: [
      { label: '全部数据', value: 1 },
      { label: '本部门数据', value: 2 },
      { label: '本部门及以下数据', value: 3 },
      { label: '仅本人数据', value: 4 },
      { label: '自定义数据', value: 5 },
    ],
  },
  defaultValue: 1,
},
{
  fieldName: 'deptIds',
  label: '数据权限范围',
  component: 'TreeSelect',
  componentProps: {
    placeholder: '请选择部门',
    treeData: deptTree,
    multiple: true,
    treeCheckable: true,
    showCheckedStrategy: 'SHOW_PARENT',
    fieldNames: {
      label: 'name',
      value: 'id',
      children: 'children',
    },
  },
  dependencies: {
    triggerFields: ['dataScope'],
    show: (values: any) => values.dataScope === 5, // 自定义时显示
  },
},
```

### 第四步：修改岗位列表页面

#### 修改文件：`post/index.vue`

**添加操作按钮**：

```vue
<template #actions="{ row }">
  <ASpace :size="4">
    <AButton type="link" size="small" @click="handleEdit(row)"> 编辑 </AButton>
    <AButton type="link" size="small" @click="handleAssignRoles(row)">
      分配角色
    </AButton>
    <AButton type="link" size="small" @click="handleAssignMenus(row)">
      分配权限
    </AButton>
    <APopconfirm title="确定要删除这个岗位吗？" @confirm="handleDelete(row)">
      <AButton type="link" size="small" danger>删除</AButton>
    </APopconfirm>
  </ASpace>
</template>
```

**添加处理函数**：

```typescript
/** 分配角色 */
function handleAssignRoles(row: any) {
  rolesModalApi.setData(row).open();
}

/** 分配菜单权限 */
function handleAssignMenus(row: any) {
  menusModalApi.setData(row).open();
}
```

## API接口定义

### 1. 岗位角色API

#### 文件：`api/sys/post.ts`

```typescript
// 查询岗位角色
export async function getPostRolesApi(id: number) {
  return requestClient.get<number[]>(`/system/post/${id}/roles`);
}

// 分配岗位角色
export async function assignPostRolesApi(id: number, roleIds: number[]) {
  return requestClient.post(`/system/post/${id}/roles`, roleIds);
}

// 查询岗位菜单
export async function getPostMenusApi(id: number) {
  return requestClient.get<number[]>(`/system/post/${id}/menus`);
}

// 分配岗位菜单
export async function assignPostMenusApi(id: number, menuIds: number[]) {
  return requestClient.post(`/system/post/${id}/menus`, menuIds);
}
```

### 2. 岗位模型更新

#### 文件：`api/model/postModel.ts`

```typescript
export interface Post {
  id?: number;
  code: string;
  name: string;
  sort?: number;
  status?: number;
  dataScope?: number; // 新增：数据权限范围
  deptIds?: number[]; // 新增：自定义数据权限部门
  remark?: string;
  createTime?: string;
  updateTime?: string;
}
```

## 实现步骤

### 第一天：岗位分配角色

1. ✅ 创建 `AssignPostRolesModal.vue`
2. ✅ 实现角色列表展示
3. ✅ 实现角色选择和保存
4. ✅ 在岗位列表页面添加"分配角色"按钮
5. ✅ 测试功能

### 第二天：岗位分配菜单权限

1. ✅ 创建 `AssignPostMenusModal.vue`
2. ✅ 实现菜单树展示
3. ✅ 实现菜单选择和保存
4. ✅ 处理半选状态
5. ✅ 在岗位列表页面添加"分配权限"按钮
6. ✅ 测试功能

### 第三天：数据权限配置

1. ✅ 修改 `PostFormModal.vue`
2. ✅ 添加数据权限范围字段
3. ✅ 添加自定义部门选择
4. ✅ 测试数据权限配置
5. ✅ 验证后端数据权限过滤

## 测试计划

### 功能测试

1. 岗位分配角色

   - 查看岗位已分配的角色
   - 添加新角色
   - 移除角色
   - 保存后验证

2. 岗位分配菜单权限

   - 查看岗位已分配的菜单
   - 勾选新菜单
   - 取消勾选菜单
   - 验证父子联动
   - 保存后验证

3. 数据权限配置
   - 设置全部数据权限
   - 设置本部门数据权限
   - 设置本部门及以下数据权限
   - 设置仅本人数据权限
   - 设置自定义数据权限
   - 验证数据权限过滤效果

### 集成测试

1. 用户分配岗位后，验证权限生效
2. 岗位权限变更后，验证用户权限自动更新
3. 岗位删除前，验证关联检查
4. 数据权限过滤验证

## 注意事项

### 1. 权限缓存刷新

岗位权限变更后，需要刷新相关用户的权限缓存：

- 岗位角色变更 → 刷新该岗位所有用户的权限
- 岗位菜单变更 → 刷新该岗位所有用户的菜单
- 数据权限变更 → 刷新该岗位所有用户的数据权限

### 2. 半选状态处理

菜单树的半选状态需要特殊处理：

- 只提交完全选中的节点
- 不提交半选节点
- 加载时需要计算半选状态

### 3. 数据权限范围

- 全部数据：不做任何过滤
- 本部门：只能看本部门数据
- 本部门及以下：可以看本部门和下级部门数据
- 仅本人：只能看自己创建的数据
- 自定义：可以看指定部门的数据

### 4. 后端支持

确保后端已实现：

- 岗位角色关联表 `sys_post_role`
- 岗位菜单关联表（如果需要）
- 数据权限过滤逻辑
- 权限缓存刷新机制

## 相关文档

- [任务16：RBAC权限模型](../.kiro/specs/phase1-foundation/tasks.md#16)
- [用户管理完成总结](./VBEN-USER-MANAGEMENT-COMPLETED.md)
- [迁移进度](./VBEN-MIGRATION-PROGRESS.md)
- [数据权限枚举](../rear-emp-platform/emp-common/src/main/java/com/ldjt/emp/common/enums/DataScopeEnum.java)

---

**创建时间**：2025-10-21  
**状态**：📋 计划已制定  
**预计完成**：3个工作日
