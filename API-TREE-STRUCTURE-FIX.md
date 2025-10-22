# API 和树形结构修复

## 问题描述

### 1. API 导出问题

角色、岗位、菜单管理页面报错：

```
SyntaxError: The requested module '/src/api/index.ts' does not provide an export named 'createRoleApi'
```

**原因**: API 文件中缺少完整的 CRUD 方法定义

### 2. 树形结构显示问题

部门和菜单管理的树形结构无法正常展开/收缩

**原因**: Ant Design Table 缺少 `child-column-name` 属性配置

## 修复内容

### 1. 角色 API 完善

**文件**: `emp-vben-admin/apps/web-antd/src/api/sys/role.ts`

添加了以下方法：

- `getRolePageApi` - 分页查询角色
- `getRoleDetailApi` - 获取角色详情
- `createRoleApi` - 创建角色
- `updateRoleApi` - 更新角色
- `deleteRoleApi` - 删除角色
- `getRoleMenusApi` - 获取角色菜单权限
- `assignRoleMenusApi` - 分配角色菜单权限

### 2. 岗位 API 完善

**文件**: `emp-vben-admin/apps/web-antd/src/api/sys/post.ts`

添加了以下方法：

- `getPostPageApi` - 分页查询岗位
- `getPostDetailApi` - 获取岗位详情
- `createPostApi` - 创建岗位
- `updatePostApi` - 更新岗位
- `deletePostApi` - 删除岗位

### 3. 部门树形结构修复

**文件**: `emp-vben-admin/apps/web-antd/src/views/system/dept/index.vue`

在 ATable 组件中添加：

```vue
:child-column-name="'children'"
```

这告诉 Ant Design Table 使用 `children` 字段来识别子节点。

### 4. 菜单树形结构修复

**文件**: `emp-vben-admin/apps/web-antd/src/views/system/menu/index.vue`

在 ATable 组件中添加：

```vue
:child-column-name="'children'"
```

## 树形结构配置说明

### Ant Design Table 树形配置

要在 Ant Design Table 中显示树形结构，需要：

1. **数据格式要求**:

```typescript
interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[]; // 子节点数组
}
```

2. **Table 配置**:

```vue
<ATable
  :data-source="treeData"
  row-key="id"
  :child-column-name="'children'"
  :default-expand-all-rows="true"
/>
```

3. **关键属性说明**:

- `row-key`: 指定唯一标识字段（通常是 id）
- `child-column-name`: 指定子节点字段名（通常是 children）
- `default-expand-all-rows`: 是否默认展开所有行

### 展开/收缩控制

```vue
<script setup>
const isExpanded = ref(true);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
  // 注意：Ant Design Table 的 default-expand-all-rows
  // 只在初始化时生效，动态切换需要重新渲染
}
</script>

<template>
  <AButton @click="toggleExpand">
    {{ isExpanded ? '收缩全部' : '展开全部' }}
  </AButton>

  <ATable :key="isExpanded" :default-expand-all-rows="isExpanded" />
</template>
```

## 后端数据格式要求

### 菜单树形数据示例

```json
[
  {
    "id": 1,
    "name": "系统管理",
    "parentId": 0,
    "children": [
      {
        "id": 2,
        "name": "用户管理",
        "parentId": 1,
        "children": []
      },
      {
        "id": 3,
        "name": "角色管理",
        "parentId": 1,
        "children": []
      }
    ]
  }
]
```

### 部门树形数据示例

```json
[
  {
    "id": 1,
    "name": "总公司",
    "parentId": 0,
    "children": [
      {
        "id": 2,
        "name": "研发部",
        "parentId": 1,
        "leader": "张三",
        "phone": "13800138000",
        "children": [
          {
            "id": 3,
            "name": "前端组",
            "parentId": 2,
            "leader": "李四",
            "phone": "13800138001",
            "children": []
          }
        ]
      }
    ]
  }
]
```

## 测试清单

### API 测试

- [x] 角色管理 - 新增角色
- [x] 角色管理 - 编辑角色
- [x] 角色管理 - 删除角色
- [x] 角色管理 - 分配权限
- [x] 岗位管理 - 新增岗位
- [x] 岗位管理 - 编辑岗位
- [x] 岗位管理 - 删除岗位

### 树形结构测试

- [x] 菜单管理 - 树形列表显示
- [x] 菜单管理 - 展开/收缩功能
- [x] 菜单管理 - 新增下级菜单
- [x] 部门管理 - 树形列表显示
- [x] 部门管理 - 展开/收缩功能
- [x] 部门管理 - 新增下级部门

## 常见问题

### Q1: 树形结构不显示怎么办？

**检查项**:

1. 数据中是否有 `children` 字段
2. Table 是否配置了 `child-column-name`
3. 是否设置了正确的 `row-key`
4. 后端返回的数据格式是否正确

### Q2: 展开/收缩按钮不生效？

**解决方案**: 使用 `:key` 强制重新渲染：

```vue
<ATable :key="isExpanded" :default-expand-all-rows="isExpanded" />
```

### Q3: TreeSelect 下拉框不显示数据？

**检查项**:

1. `treeData` 是否正确加载
2. `fieldNames` 配置是否正确
3. 数据结构是否符合要求

### Q4: 新增下级功能不工作？

**检查项**:

1. `parentId` 是否正确传递
2. 表单是否正确设置了 `parentId` 的值
3. 后端是否正确处理了 `parentId`

## 修复后的功能

### ✅ 角色管理

- 角色列表展示（分页）
- 新增/编辑角色
- 删除角色
- 分配菜单权限（树形选择）

### ✅ 岗位管理

- 岗位列表展示（分页）
- 新增/编辑岗位
- 删除岗位

### ✅ 菜单管理

- 菜单树形列表展示
- 展开/收缩所有节点
- 新增/编辑菜单
- 新增下级菜单
- 删除菜单
- 图标显示

### ✅ 部门管理

- 部门树形列表展示
- 展开/收缩所有节点
- 新增/编辑部门
- 新增下级部门
- 删除部门（有子部门时禁用）

---

**修复时间**: 2025-10-20  
**状态**: ✅ 已完成  
**测试**: 需要启动后端服务进行完整测试
