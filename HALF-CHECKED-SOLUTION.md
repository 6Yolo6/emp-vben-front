# 树形权限半选中状态完整解决方案

## 问题分析

### 后端现状

后端 `getRoleMenuIds` 方法**只返回叶子节点**（没有子节点的菜单ID），这是正确的做法。

```java
// 只返回叶子节点（不是父节点的菜单ID）
// 这样Tree组件会自动根据叶子节点的选中状态来显示父节点的半选或全选状态
return allMenuIds.stream()
        .filter(menuId -> !parentMenuIds.contains(menuId))
        .collect(Collectors.toList());
```

### 前端问题

前端 Tree 组件配置了 `check-strictly`（父子不关联），导致：

1. 无法显示父节点的半选中状态
2. 选中子节点时父节点不会自动半选中
3. 用户体验不好

## 解决方案

### ✅ 建议：保持后端不变，修改前端

**原因**：

1. 后端逻辑符合最佳实践
2. 只存储叶子节点可以减少数据冗余
3. 前端 Tree 组件完全支持这种模式

### 前端修改方案

**文件**: `emp-vben-admin/apps/web-antd/src/views/system/role/components/AssignPermissionsModal.vue`

#### 1. 修改 Tree 组件配置

```vue
<Tree
  v-model:checkedKeys="checkedKeys"
  :tree-data="treeData"
  :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
  checkable
  :check-strictly="false"  <!-- 关键：父子关联 -->
  :height="400"
  default-expand-all  <!-- 默认展开所有节点 -->
  @check="handleCheck"  <!-- 监听选中事件 -->
/>
```

**关键配置说明**：

- `:check-strictly="false"` - 父子节点关联，选中子节点会自动半选中父节点
- `default-expand-all` - 默认展开所有节点，方便用户查看
- `@check="handleCheck"` - 监听选中事件，获取半选中的节点

#### 2. 添加半选中状态管理

```typescript
const checkedKeys = ref<number[]>([]); // 完全选中的节点
const halfCheckedKeys = ref<number[]>([]); // 半选中的节点

// 处理树节点选中事件
function handleCheck(checkedKeysValue: any, info: any) {
  checkedKeys.value = checkedKeysValue;
  halfCheckedKeys.value = info.halfCheckedKeys || [];
}
```

#### 3. 保存时包含半选中节点

```typescript
async onConfirm() {
  // 保存时需要包含所有选中的节点（包括半选中的父节点）
  const allCheckedKeys = [...checkedKeys.value, ...halfCheckedKeys.value];
  await assignRoleMenusApi(roleData.value.id, allCheckedKeys);
  message.success('分配成功');
}
```

## 工作原理

### 1. 加载时（后端 → 前端）

```
后端返回: [3, 4, 6]  // 只有叶子节点

Tree 组件自动计算:
- 完全选中: [3, 4, 6]
- 半选中: [1, 2]  // 父节点自动半选中

显示效果:
☐ 1. 系统管理 (半选)
  ☑ 2. 用户管理 (半选)
    ☑ 3. 查看用户
    ☑ 4. 新增用户
  ☐ 5. 角色管理
    ☑ 6. 查看角色
```

### 2. 保存时（前端 → 后端）

```
用户选中状态:
- 完全选中: [3, 4, 6]
- 半选中: [1, 2]

前端发送: [3, 4, 6, 1, 2]  // 包含所有选中的节点

后端保存: [3, 4, 6, 1, 2]  // 保存所有节点
```

### 3. 下次加载时

```
后端查询: [3, 4, 6, 1, 2]
后端过滤: [3, 4, 6]  // 只返回叶子节点

Tree 组件再次自动计算半选中状态
```

## 为什么这样设计？

### 优点

1. **数据一致性**

   - 后端只存储实际选中的节点
   - 父节点的状态由子节点决定

2. **减少数据冗余**

   - 不需要存储可以计算出来的父节点状态
   - 数据库存储更高效

3. **自动同步**

   - Tree 组件自动计算父节点状态
   - 不需要手动维护父子关系

4. **用户体验好**
   - 半选中状态清晰可见
   - 选中子节点自动半选中父节点
   - 符合用户直觉

### 对比其他方案

#### 方案 A: 后端返回所有节点（不推荐）

```java
// 返回所有选中的节点，包括父节点
return allMenuIds;  // [1, 2, 3, 4, 6]
```

**缺点**：

- 前端无法区分哪些是完全选中，哪些是半选中
- Tree 组件会把所有节点都显示为完全选中
- 用户体验差

#### 方案 B: 返回两个列表（复杂）

```java
// 返回两个列表
return Map.of(
  "checked", leafNodes,      // [3, 4, 6]
  "halfChecked", parentNodes // [1, 2]
);
```

**缺点**：

- API 设计复杂
- 前端需要额外处理
- 维护成本高

#### 方案 C: 只返回叶子节点（推荐）✅

```java
// 只返回叶子节点
return leafNodes;  // [3, 4, 6]
```

**优点**：

- API 简单清晰
- Tree 组件自动处理
- 符合最佳实践

## 完整代码示例

### 前端组件

```vue
<template>
  <Modal title="分配权限" class="w-2/3">
    <div class="p-4">
      <Spin :spinning="loading">
        <Tree
          v-model:checkedKeys="checkedKeys"
          :tree-data="treeData"
          :field-names="{ title: 'menuName', key: 'id', children: 'children' }"
          checkable
          :check-strictly="false"
          :height="400"
          default-expand-all
          @check="handleCheck"
        />
      </Spin>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { message, Spin, Tree } from 'ant-design-vue';
import { getMenuTreeApi } from '#/api/sys/menu';
import { getRoleMenusApi, assignRoleMenusApi } from '#/api/sys/role';

const loading = ref(false);
const treeData = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);
const halfCheckedKeys = ref<number[]>([]);
const roleData = ref<any>();

// 处理树节点选中事件
function handleCheck(checkedKeysValue: any, info: any) {
  checkedKeys.value = checkedKeysValue;
  halfCheckedKeys.value = info.halfCheckedKeys || [];
}

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [menuTree, roleMenus] = await Promise.all([
      getMenuTreeApi(),
      getRoleMenusApi(roleData.value.id),
    ]);
    treeData.value = menuTree;
    // 后端只返回叶子节点，Tree组件会自动计算父节点的半选状态
    checkedKeys.value = roleMenus;
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.lock();
    try {
      // 保存时需要包含所有选中的节点（包括半选中的父节点）
      const allCheckedKeys = [...checkedKeys.value, ...halfCheckedKeys.value];
      await assignRoleMenusApi(roleData.value.id, allCheckedKeys);
      await modalApi.close();
      emit('success');
      message.success('分配成功');
    } catch (error) {
      console.error('分配失败:', error);
      message.error('分配失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      roleData.value = undefined;
      treeData.value = [];
      checkedKeys.value = [];
      halfCheckedKeys.value = [];
      return;
    }

    const data = modalApi.getData();
    if (data) {
      roleData.value = data;
      await loadData();
    }
  },
});
</script>
```

## 测试清单

### 功能测试

- [ ] 打开权限分配弹窗
- [ ] 检查树形结构是否正常显示
- [ ] 检查已选权限是否正确回显
- [ ] 检查父节点是否显示半选中状态
- [ ] 选中一个子节点，检查父节点是否自动半选中
- [ ] 选中所有子节点，检查父节点是否变为全选
- [ ] 取消选中部分子节点，检查父节点是否变为半选中
- [ ] 保存权限
- [ ] 重新打开检查是否正确保存

### 边界情况测试

- [ ] 角色没有任何权限
- [ ] 角色有所有权限
- [ ] 只选中叶子节点
- [ ] 只选中父节点（应该自动选中所有子节点）
- [ ] 混合选中父节点和子节点

## 常见问题

### Q1: 为什么不直接返回所有节点？

**答**: 返回所有节点会导致前端无法区分完全选中和半选中，Tree 组件会把所有节点都显示为完全选中。

### Q2: 半选中的父节点需要保存吗？

**答**: 需要。虽然父节点的状态可以由子节点计算出来，但保存时需要包含所有选中的节点，这样下次加载时后端才能正确过滤出叶子节点。

### Q3: check-strictly 是什么意思？

**答**:

- `check-strictly="true"` - 父子节点不关联，各自独立
- `check-strictly="false"` - 父子节点关联，选中子节点会影响父节点

### Q4: 如果后端不改，前端能实现吗？

**答**: 可以，但需要前端手动计算半选中状态，代码复杂且容易出错。最好的方案是后端只返回叶子节点，前端配置 `check-strictly="false"`。

## 总结

**最佳实践**：

1. ✅ 后端只返回叶子节点
2. ✅ 前端配置 `check-strictly="false"`
3. ✅ 保存时包含所有选中的节点（包括半选中的父节点）
4. ✅ Tree 组件自动处理半选中状态

这种方案简单、高效、易维护，是业界标准做法。

---

**状态**: ✅ 已修复  
**修改文件**: `emp-vben-admin/apps/web-antd/src/views/system/role/components/AssignPermissionsModal.vue`
