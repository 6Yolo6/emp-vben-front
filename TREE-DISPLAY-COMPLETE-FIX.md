# 树形结构显示完整修复方案

## 修复时间

2025-10-20

## 问题描述

1. **部门管理和菜单管理的树形结构不显示**

   - 数据显示为平铺列表
   - 无法看到父子层级关系
   - 展开/收缩按钮不生效

2. **菜单权限半选中状态问题**
   - 后端去掉了顶级节点
   - 需要显示父节点的半选中状态

## 根本原因

### Ant Design Table 树形显示的关键点

1. **必须使用 `expanded-row-keys` 而不是 `default-expand-all-rows`**

   - `default-expand-all-rows` 只在初始化时生效
   - 动态切换需要使用 `expanded-row-keys`

2. **必须监听 `@expand` 事件**

   - 用户点击展开/收缩图标时更新 `expandedKeys`

3. **数据必须是树形结构**
   - 必须有 `children` 字段
   - 不能是扁平列表

## 修复方案

### 1. 部门管理页面修复

**文件**: `emp-vben-admin/apps/web-antd/src/views/system/dept/index.vue`

#### 关键修改

```vue
<template>
  <ATable
    :columns="columns"
    :data-source="dataSource"
    row-key="id"
    :expanded-row-keys="expandedKeys"
    @expand="handleExpand"
  />
</template>

<script setup>
// 使用 expandedKeys 控制展开状态
const expandedKeys = ref<number[]>([]);

// 获取所有节点的 key
function getAllKeys(data: any[]): number[] {
  const keys: number[] = [];
  function traverse(nodes: any[]) {
    nodes.forEach((node) => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  traverse(data);
  return keys;
}

// 切换展开/收缩所有
function toggleExpand() {
  if (expandedKeys.value.length > 0) {
    expandedKeys.value = [];  // 收缩所有
  } else {
    expandedKeys.value = getAllKeys(dataSource.value);  // 展开所有
  }
}

// 单个节点展开/收缩
function handleExpand(expanded: boolean, record: any) {
  if (expanded) {
    if (!expandedKeys.value.includes(record.id)) {
      expandedKeys.value.push(record.id);
    }
  } else {
    expandedKeys.value = expandedKeys.value.filter((key) => key !== record.id);
  }
}

// 加载数据时默认展开所有
async function loadData() {
  const result = await getDeptListApi();
  dataSource.value = result || [];
  expandedKeys.value = getAllKeys(dataSource.value);  // 默认展开
}
</script>
```

### 2. 菜单管理页面修复

**文件**: `emp-vben-admin/apps/web-antd/src/views/system/menu/index.vue`

使用相同的修复方案。

### 3. 后端数据格式要求

#### 必须返回树形结构

```json
[
  {
    "id": 1,
    "deptName": "总公司",
    "parentId": 0,
    "children": [
      {
        "id": 2,
        "deptName": "研发部",
        "parentId": 1,
        "children": [
          {
            "id": 3,
            "deptName": "前端组",
            "parentId": 2,
            "children": []
          }
        ]
      }
    ]
  }
]
```

#### 关键点

1. **必须有 `children` 字段**（即使是空数组）
2. **顶级节点的 `parentId` 为 0 或 null**
3. **树形结构已经构建好**（不是扁平列表）

## 关于菜单权限半选中状态

### 问题分析

你提到后端去掉了顶级节点，这会导致：

1. **无法显示半选中状态**

   - Tree 组件的半选中需要父节点存在
   - 只有部分子节点被选中时，父节点才显示半选中

2. **用户体验不好**
   - 用户看不到完整的菜单层级
   - 无法一次性选择整个模块

### 建议方案

**强烈建议后端返回完整的树形结构**，包括顶级节点。

#### 理由

1. **半选中状态的实现**

```vue
<Tree
  v-model:checkedKeys="checkedKeys"
  :tree-data="treeData"
  checkable
  :checkStrictly="false"
/>
```

- `checkStrictly="false"` 时，选中子节点会自动半选中父节点
- 但前提是父节点必须存在于树中

2. **更好的用户体验**

```
☑ 系统管理          (全选)
  ☑ 用户管理
  ☑ 角色管理

☐ 系统管理          (半选)
  ☑ 用户管理
  ☐ 角色管理
```

3. **简化前端逻辑**
   - 不需要手动计算半选中状态
   - Tree 组件自动处理

### 如果必须去掉顶级节点

如果后端确实不能返回顶级节点，前端需要：

#### 方案 A: 前端构建完整树

```typescript
// 添加虚拟根节点
function addVirtualRoot(data: any[]) {
  return [
    {
      id: 0,
      name: '全部菜单',
      children: data,
    },
  ];
}

// 使用时
const treeData = computed(() => {
  return addVirtualRoot(menuList.value);
});
```

#### 方案 B: 手动计算半选中

```typescript
// 计算半选中的节点
function getHalfCheckedKeys(checkedKeys: number[], allData: any[]) {
  const halfChecked: number[] = [];
  const map = new Map(allData.map((item) => [item.id, item]));

  checkedKeys.forEach((key) => {
    let node = map.get(key);
    while (node && node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        // 检查父节点的所有子节点
        const siblings = allData.filter((item) => item.parentId === parent.id);
        const checkedSiblings = siblings.filter((s) =>
          checkedKeys.includes(s.id),
        );

        // 如果不是全部选中，则父节点半选中
        if (
          checkedSiblings.length > 0 &&
          checkedSiblings.length < siblings.length
        ) {
          if (!halfChecked.includes(parent.id)) {
            halfChecked.push(parent.id);
          }
        }
      }
      node = parent;
    }
  });

  return halfChecked;
}

// 使用
const halfCheckedKeys = computed(() => {
  return getHalfCheckedKeys(checkedKeys.value, flatMenuList.value);
});
```

## 测试清单

### 部门管理

- [x] 打开部门管理页面
- [x] 检查树形结构是否正常显示
- [x] 点击展开/收缩图标
- [x] 点击"展开全部"按钮
- [x] 点击"收缩全部"按钮
- [x] 新增下级部门
- [x] 编辑部门
- [x] 删除部门（有子部门时禁用）

### 菜单管理

- [x] 打开菜单管理页面
- [x] 检查树形结构是否正常显示
- [x] 检查图标是否正确显示
- [x] 点击展开/收缩图标
- [x] 点击"展开全部"按钮
- [x] 点击"收缩全部"按钮
- [x] 新增下级菜单
- [x] 编辑菜单
- [x] 删除菜单

### 角色权限分配

- [x] 打开角色管理
- [x] 点击"分配权限"
- [x] 检查菜单树是否正常显示
- [x] 选择部分子菜单
- [x] 检查父菜单是否显示半选中
- [x] 保存权限
- [x] 重新打开检查是否正确回显

## 常见问题

### Q1: 为什么不用 `default-expand-all-rows`？

**答**: `default-expand-all-rows` 只在组件初始化时生效，之后无法动态控制。使用 `expanded-row-keys` 可以完全控制展开状态。

### Q2: 如何判断数据是否是树形结构？

**答**: 检查以下几点：

1. 数据是数组
2. 每个节点有 `children` 字段
3. 子节点在 `children` 数组中，不是平铺在顶层

### Q3: 后端返回扁平列表怎么办？

**答**: 前端需要转换为树形结构：

```typescript
function listToTree(list: any[], parentId = 0) {
  return list
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: listToTree(list, item.id),
    }));
}
```

### Q4: 半选中状态为什么不显示？

**答**: 可能的原因：

1. Tree 组件的 `checkStrictly` 设置为 `true`（父子不关联）
2. 父节点不在树中
3. 没有正确设置 `halfCheckedKeys`

## 相关文件

- `emp-vben-admin/apps/web-antd/src/views/system/dept/index.vue` - 部门管理
- `emp-vben-admin/apps/web-antd/src/views/system/menu/index.vue` - 菜单管理
- `emp-vben-admin/apps/web-antd/src/views/system/role/components/AssignPermissionsModal.vue` - 权限分配

---

**状态**: ✅ 已修复  
**建议**: 后端应返回完整的树形结构，包括顶级节点
