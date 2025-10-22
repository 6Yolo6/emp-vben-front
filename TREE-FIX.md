# 树形结构显示修复方案

## 问题分析

### 1. Ant Design Table 树形显示要求

Ant Design Table 要显示树形结构，需要满足：

1. **数据格式**：必须有 `children` 字段
2. **配置属性**：需要正确的 Table 属性配置
3. **展开控制**：需要使用 `expandedRowKeys` 而不是 `default-expand-all-rows`

### 2. 当前问题

- 树形结构不显示
- 展开/收缩按钮不生效
- 数据显示为平铺列表

## 解决方案

### 方案 1: 使用 expandedRowKeys（推荐）

```vue
<template>
  <ATable
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="false"
    row-key="id"
    :expanded-row-keys="expandedKeys"
    @expand="handleExpand"
  >
  </ATable>
</template>

<script setup>
const expandedKeys = ref<number[]>([]);

// 展开/收缩所有
function toggleExpand() {
  if (expandedKeys.value.length > 0) {
    expandedKeys.value = [];
  } else {
    expandedKeys.value = getAllKeys(dataSource.value);
  }
}

// 获取所有节点的 key
function getAllKeys(data: any[]): number[] {
  const keys: number[] = [];
  function traverse(nodes: any[]) {
    nodes.forEach(node => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  traverse(data);
  return keys;
}

// 单个节点展开/收缩
function handleExpand(expanded: boolean, record: any) {
  if (expanded) {
    expandedKeys.value.push(record.id);
  } else {
    expandedKeys.value = expandedKeys.value.filter(key => key !== record.id);
  }
}
</script>
```

### 方案 2: 后端数据格式要求

后端必须返回树形结构，而不是扁平列表：

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
        "children": []
      }
    ]
  }
]
```

## 关于菜单权限的半选中状态

### 问题

你提到菜单后端去掉了顶级节点，需要显示半选中状态。

### 建议

**应该返回完整的树形结构**，原因：

1. **半选中状态需要父节点**

   - Tree 组件的半选中（indeterminate）需要知道父节点
   - 只有子节点被选中时，父节点才能显示半选中

2. **用户体验更好**

   - 用户可以看到完整的菜单层级
   - 可以一次性选择整个模块

3. **实现方式**

```vue
<Tree
  v-model:checkedKeys="checkedKeys"
  :tree-data="treeData"
  checkable
  checkStrictly
  :half-checked-keys="halfCheckedKeys"
/>
```

### 如果必须去掉顶级节点

如果后端确实不返回顶级节点，前端需要：

1. **手动构建树形结构**

```typescript
function buildTree(flatList: any[]) {
  const map = new Map();
  const roots: any[] = [];

  // 第一遍：创建所有节点
  flatList.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // 第二遍：建立父子关系
  flatList.forEach((item) => {
    const node = map.get(item.id);
    if (item.parentId === 0 || !map.has(item.parentId)) {
      roots.push(node);
    } else {
      const parent = map.get(item.parentId);
      parent.children.push(node);
    }
  });

  return roots;
}
```

2. **半选中状态处理**

```typescript
// 计算半选中的节点
function getHalfCheckedKeys(checkedKeys: number[], allData: any[]) {
  const halfChecked: number[] = [];
  const map = new Map(allData.map((item) => [item.id, item]));

  checkedKeys.forEach((key) => {
    let node = map.get(key);
    while (node && node.parentId) {
      const parent = map.get(node.parentId);
      if (parent && !checkedKeys.includes(parent.id)) {
        if (!halfChecked.includes(parent.id)) {
          halfChecked.push(parent.id);
        }
      }
      node = parent;
    }
  });

  return halfChecked;
}
```

## 完整示例代码

见下一个文件...
