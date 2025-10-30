# 用户权限管理 - 完整文档

## 更新时间
2025-10-29

## 📋 目录
1. [功能概述](#功能概述)
2. [快速开始](#快速开始)
3. [实现方案](#实现方案)
4. [技术细节](#技术细节)
5. [使用指南](#使用指南)
6. [API文档](#api文档)

---

## 功能概述

实现了用户权限的查看和直接分配功能：
- ✅ 树形结构展示用户权限
- ✅ 智能权限分配（角色权限只读，直接权限可编辑）
- ✅ 多租户数据隔离
- ✅ PostgreSQL 数据库支持

---

## 快速开始

### 1. 数据库初始化

执行 SQL 脚本创建 `sys_user_menu` 表：

```bash
# PostgreSQL
psql -U postgres -d your_database -f rear-emp-platform/sql/create_sys_user_menu.sql
```

### 2. 使用功能

#### 查看用户权限
1. 进入"系统管理" -> "用户管理"
2. 点击"查看"按钮或双击用户行
3. 在"权限信息"部分查看树形权限列表
4. 不同颜色标签表示权限来源：
   - 🟠 橙色 = 直接分配
   - 🟢 绿色 = 岗位权限
   - 🔵 蓝色 = 角色权限

#### 分配用户权限
1. 点击"分配权限"按钮
2. 看到已有的角色权限（灰色，不可取消）
3. 勾选额外需要的权限
4. 点击"确定"保存

---

## 实现方案

### 1. 权限展示（UserDetailModal）

**树形结构显示**
- 使用 Ant Design Tree 组件
- 按菜单层级展示权限
- 使用颜色标签区分权限来源：
  - 🟠 橙色 = 直接分配
  - 🟢 绿色 = 岗位权限
  - 🔵 蓝色 = 角色权限

### 2. 权限分配（AssignUserPermissionsModal）

**智能权限管理**
- 显示所有菜单的树形结构
- 自动勾选并禁用角色/岗位权限（灰色显示，不可取消）
- 可以额外勾选直接分配的权限
- 保存时只保存直接分配的权限

**用户体验**
- 清晰提示：灰色勾选的是角色权限，不能取消
- 可以看到已有的所有权限
- 可以增加额外的直接权限
- 不会影响角色/岗位权限

### 3. 权限优先级

```
最终权限 = 角色权限 ∪ 岗位权限 ∪ 直接权限
```

- 角色权限：通过用户角色获得
- 岗位权限：通过岗位关联的角色获得（本质也是角色权限）
- 直接权限：直接分配给用户的额外权限

### 4. 核心功能

#### 查看权限
```vue
<a-tree
  :tree-data="buildPermissionTree(permissions)"
  default-expand-all
>
  <template #title="{ title, sourceType, sourceName }">
    {{ title }}
    <a-tag :color="getPermissionColor(sourceType)">
      {{ sourceName }}
    </a-tag>
  </template>
</a-tree>
```

#### 分配权限
```vue
<a-tree
  v-model:checkedKeys="selectedMenuIds"
  checkable
  :tree-data="menuTree"
  :disabled-keys="disabledMenuIds"
  default-expand-all
>
  <template #title="{ id, menuName }">
    {{ menuName }}
    <span v-if="disabledMenuIds.includes(id)">
      (角色权限)
    </span>
  </template>
</a-tree>
```

### 5. 数据流程

#### 加载权限分配对话框
```typescript
async function loadData() {
  // 1. 加载菜单树
  const tree = await getMenuTreeApi();
  
  // 2. 加载用户直接分配的权限
  const directMenuIds = await getUserDirectMenusApi(userId);
  
  // 3. 加载用户所有权限（包括角色权限）
  const allPermissions = await getUserPermissionsApi(userId);
  
  // 4. 提取角色/岗位权限作为禁用项
  const roleMenuIds = allPermissions.permissions
    .filter(p => p.sourceType === 'role' || p.sourceType === 'post')
    .map(p => p.menuId);
  
  // 5. 合并显示（角色权限 + 直接权限）
  selectedMenuIds.value = [...roleMenuIds, ...directMenuIds];
  disabledMenuIds.value = roleMenuIds;
}
```

#### 保存权限
```typescript
async function onConfirm() {
  // 只保存直接分配的权限（排除角色权限）
  const directMenuIds = selectedMenuIds.value.filter(
    id => !disabledMenuIds.value.includes(id)
  );
  
  await assignUserPermissionsApi(userId, directMenuIds);
}
```

### 6. 界面效果

#### 权限查看
```
系统管理 [直接分配]
├─ 用户管理 [角色]
├─ 角色管理 [岗位]
└─ 菜单管理 [直接分配]
```

#### 权限分配
```
提示：灰色勾选的权限是通过角色/岗位获得的，不能取消。
您可以额外勾选其他权限作为直接分配的权限。

☑ 系统管理 (角色权限) [灰色，不可取消]
  ☑ 用户管理 (角色权限) [灰色，不可取消]
  ☐ 角色管理 [可勾选]
  ☑ 菜单管理 [已勾选，可取消]
```

### 7. 技术要点

#### 禁用节点
```typescript
// Ant Design Tree 支持 disabled-keys 属性
<Tree :disabled-keys="disabledMenuIds" />
```

#### 权限合并
```typescript
// 确保角色权限始终被选中
function handleCheck(checkedKeys: any) {
  const checked = checkedKeys.checked || checkedKeys;
  const allChecked = [...new Set([...checked, ...disabledMenuIds.value])];
  selectedMenuIds.value = allChecked;
}
```

#### 权限过滤
```typescript
// 保存时只保存直接权限
const directMenuIds = selectedMenuIds.value.filter(
  id => !disabledMenuIds.value.includes(id)
);
```

### 8. 优势

1. **直观清晰** - 树形结构更符合菜单层级关系
2. **防止误操作** - 角色权限不能取消，避免误删
3. **灵活扩展** - 可以在角色权限基础上增加额外权限
4. **权限可见** - 一眼看到所有权限来源

### 9. 使用场景

#### 场景1：查看用户权限
1. 点击"查看"按钮
2. 在权限信息部分看到树形权限列表
3. 不同颜色标签表示不同来源

#### 场景2：增加额外权限
1. 点击"分配权限"按钮
2. 看到已有的角色权限（灰色，不可取消）
3. 勾选额外需要的权限
4. 保存后，新权限以橙色标签显示

#### 场景3：移除直接权限
1. 点击"分配权限"按钮
2. 取消勾选之前直接分配的权限
3. 角色权限保持不变（灰色，不可取消）
4. 保存后，该权限被移除

### 10. 注意事项

1. **角色权限优先** - 角色/岗位权限不能通过直接分配取消
2. **权限叠加** - 直接权限是在角色权限基础上的补充
3. **岗位即角色** - 岗位权限本质是岗位关联的角色权限
4. **树形展示** - 更美观，更符合菜单层级关系

## 修改的文件

- ✅ `UserDetailModal.vue` - 改为树形结构显示权限
- ✅ `AssignUserPermissionsModal.vue` - 显示所有权限，禁用角色权限

---

## API文档

### 获取用户权限信息
```
GET /system/user/{id}/permissions
```

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "permissions": [
      {
        "menuId": 1,
        "menuName": "系统管理",
        "menuType": "M",
        "perms": null,
        "path": "/system",
        "sourceType": "role",
        "sourceName": "角色"
      },
      {
        "menuId": 10,
        "menuName": "用户管理",
        "menuType": "C",
        "perms": "system:user:list",
        "path": "/system/user",
        "sourceType": "direct",
        "sourceName": "直接分配"
      }
    ]
  }
}
```

### 获取用户直接分配的菜单ID
```
GET /system/user/{id}/direct-menus
```

**响应示例：**
```json
{
  "code": 200,
  "data": [10, 11, 12]
}
```

### 分配用户权限
```
POST /system/user/{id}/permissions
Content-Type: application/json

[10, 11, 12]
```

---

## 修改的文件清单

### 后端文件（10个）
**新建：**
- `rear-emp-platform/sql/create_sys_user_menu.sql` - PostgreSQL建表脚本
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/entity/SysUserMenu.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/mapper/SysUserMenuMapper.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/entity/table/SysUserMenuTableDef.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/vo/user/UserPermissionVO.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/service/SysUserMenuService.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/service/impl/SysUserMenuServiceImpl.java`

**更新：**
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/service/SysUserService.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/service/impl/SysUserServiceImpl.java`
- `rear-emp-platform/emp-system/src/main/java/com/ldjt/emp/controller/SysUserController.java`

### 前端文件（5个）
**新建：**
- `emp-vben-admin/apps/web-antd/src/views/system/user/components/AssignUserPermissionsModal.vue`

**更新：**
- `emp-vben-admin/apps/web-antd/src/api/sys/user.ts`
- `emp-vben-admin/apps/web-antd/src/api/index.ts`
- `emp-vben-admin/apps/web-antd/src/views/system/user/components/UserDetailModal.vue`
- `emp-vben-admin/apps/web-antd/src/views/system/user/index.vue`

---

## 常见问题

### Q: 为什么角色权限不能取消？
A: 角色权限是通过用户的角色/岗位获得的，应该通过修改角色权限或用户角色来管理，不应该在这里取消。

### Q: 直接分配的权限有什么用？
A: 用于给用户临时增加额外的权限，而不需要修改角色配置。

### Q: 岗位权限和角色权限有什么区别？
A: 岗位权限本质就是角色权限，因为岗位是通过关联角色来获得权限的。

---

## 相关文档

- [用户管理增强计划](./USER-MANAGEMENT-ENHANCEMENT-PLAN.md)
- [多租户实现指南](../rear-emp-platform/MULTI-TENANT-README.md)
